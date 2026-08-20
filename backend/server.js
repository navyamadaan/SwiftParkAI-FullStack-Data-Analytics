// ============================================
// IMPORTS AND MIDDLEWARE SETUP
// ============================================

const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
require("dotenv").config();

const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json()); // lets us read JSON in request bodies (e.g. sensor POSTs)
app.use(cors());         // allows the frontend (different origin) to call this API

// ============================================
// DATABASE SETUP
// ============================================

// Defines what a single "parking event" document looks like in MongoDB
const parkingSchema = new mongoose.Schema({
  spotId: { type: Number, required: true },
  occupied: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ParkingLog = mongoose.model("ParkingLog", parkingSchema);

const DbURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 9000;

mongoose
  .connect(DbURI)
  .then(() => console.log(`Connected to Mongo Database Successfully at port: ${PORT}`))
  .catch((err) => console.log("Connection Failed", err));

// ============================================
// RATE LIMITING (protects the AI route from being spammed)
// ============================================

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // max 10 requests per IP per minute
  message: { error: "Too many questions — please wait a moment before asking again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// HELPER: GET CURRENT OCCUPANCY PER SPOT
// ============================================
// Looks at MongoDB and finds the most recent occupied/vacant status for every spotId.
// Returns something like: { 1: true, 2: false, 3: true, ... }
async function getLiveOccupancy() {
  const latest = await ParkingLog.aggregate([
    { $sort: { spotId: 1, timestamp: -1 } },
    {
      $group: {
        _id: "$spotId",
        occupied: { $first: "$occupied" },
      },
    },
  ]);

  const occupancyMap = {};
  latest.forEach((entry) => {
    occupancyMap[entry._id] = entry.occupied;
  });

  return occupancyMap;
}

// ============================================
// HELPER: ASSIGN CLUSTERED MAP COORDINATES
// ============================================
// Real anchor points around Square One Mall — each zone gets 10 spots
// arranged in a small 2x5 grid near its anchor, so markers don't overlap.
const zoneAnchors = [
  { min: 1, max: 10, lat: 43.5943741, lng: -79.6460898 },  // Zone A - Sheridan side
  { min: 11, max: 20, lat: 43.5911624, lng: -79.641351 },  // Zone B - Celebration Square side
  { min: 21, max: 30, lat: 43.5964637, lng: -79.6406148 }, // Zone C - Walmart side
];

const LAT_STEP = 0.00015; // spacing between rows
const LNG_STEP = 0.00025; // spacing between columns

function getClusteredCoords(spotId) {
  const zone = zoneAnchors.find((z) => spotId >= z.min && spotId <= z.max);
  if (!zone) return { lat: null, lng: null };

  const indexInZone = spotId - zone.min; // 0 through 9
  const row = Math.floor(indexInZone / 5); // 0 or 1
  const col = indexInZone % 5; // 0 through 4

  return {
    lat: zone.lat + row * LAT_STEP,
    lng: zone.lng + col * LNG_STEP,
  };
}

// ============================================
// HELPER: BUILD ZONE-LEVEL SUMMARY (for the AI chat)
// ============================================
// Reads the clustering CSV, groups spots by zone, and combines historical
// stats (turnover, dwell time) with live occupancy from Mongo.
function getZoneSummary() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(path.join(__dirname, "../scripts/final_clustered_data.csv"))
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          spotId: parseInt(data.spotId),
          zone_name: data.zone_name,
          turnover: parseInt(data.turnover),
          total_time: parseFloat(data.total_time),
        });
      })
      .on("end", async () => {
        try {
          const occupancyMap = await getLiveOccupancy();
          const zoneGroups = {};

          results.forEach((spot) => {
            const zone = spot.zone_name || "Unknown Zone";

            if (!zoneGroups[zone]) {
              zoneGroups[zone] = {
                zone_name: zone,
                totalTurnover: 0,
                totalTime: 0,
                count: 0,
                currentlyOccupied: 0,
                currentlyAvailable: 0,
              };
            }

            zoneGroups[zone].totalTurnover += spot.turnover || 0;
            zoneGroups[zone].totalTime += spot.total_time || 0;
            zoneGroups[zone].count += 1;

            // Add this spot's live status into its zone's current count
            const isOccupied = occupancyMap[spot.spotId];
            if (isOccupied === true) {
              zoneGroups[zone].currentlyOccupied += 1;
            } else if (isOccupied === false) {
              zoneGroups[zone].currentlyAvailable += 1;
            }
            // If isOccupied is undefined, we have no live data yet for that spot — skip it
          });

          // Turn totals into per-zone averages ready to hand to the AI
          const summary = Object.values(zoneGroups).map((z) => ({
            zone_name: z.zone_name,
            avgTurnover: parseFloat((z.totalTurnover / z.count).toFixed(2)),
            avgDwellTimeMinutes: parseFloat((z.totalTime / z.count / 60).toFixed(1)),
            spotCount: z.count,
            currentlyOccupied: z.currentlyOccupied,
            currentlyAvailable: z.currentlyAvailable,
          }));

          resolve(summary);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => reject(err));
  });
}

// ============================================
// ROUTES
// ============================================

// GET /latest-status
// Returns the most recent occupied/vacant status for every parking spot.
// Used by the frontend to power the live grid + map.
app.get("/latest-status", async (req, res) => {
  try {
    const latestStatus = await ParkingLog.aggregate([
      { $sort: { timestamp: -1 } }, // newest entries first
      {
        $group: {
          _id: "$spotId",
          spotId: { $first: "$spotId" },
          occupied: { $first: "$occupied" },
          timestamp: { $first: "$timestamp" },
        },
      },
      { $sort: { spotId: 1 } }, // return spots in order (1, 2, 3...)
    ]);

    if (latestStatus.length > 0) {
      res.status(200).json(latestStatus);
    } else {
      res.status(404).json({ message: "Data not Found" });
    }
  } catch (err) {
    console.error("Error fetching from DB: ", err);
    res.status(500).send("Internal Server Error");
  }
});

// GET /api/parking-stats
// Streams the clustering CSV, enriches each spot with real map coordinates,
// and returns everything needed to render the Live Map + Zone Analytics.
app.get("/api/parking-stats", (req, res) => {
  const results = [];
  const csvFilePath = path.join(__dirname, "..", "scripts", "final_clustered_data.csv");

  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: "CSV file not found at " + csvFilePath });
  }

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => {
      const coords = getClusteredCoords(parseInt(data.spotId));

      results.push({
        ...data,
        spotId: parseInt(data.spotId),
        occupied: data.occupied === "True" || data.occupied === "1",
        lat: coords.lat,
        lng: coords.lng,
        cluster: parseInt(data.cluster),
        total_time: parseFloat(data.total_time),
        turnover: parseInt(data.turnover),
      });
    })
    .on("end", () => {
      res.json(results);
    })
    .on("error", (err) => {
      res.status(500).json({ error: "Could not read cluster data" });
    });
});

// POST /
// Receives a status update from a sensor (real IoT device or simulator)
// and logs it as a new document in MongoDB.
app.post("/", async (req, res) => {
  try {
    console.log("Data received from sensor: ", req.body);

    const newLog = new ParkingLog(req.body);
    await newLog.save();

    res.status(200).send("Data Stored in Cloud Successfully");
  } catch (error) {
    console.error("Error Saving to DB: ", error);
    res.status(500).send("Failed to store data");
  }
});

// POST /api/ask-ai
// Takes a natural-language question, builds a prompt using current zone data,
// and returns Gemini's answer. Rate-limited to prevent quota abuse.
app.post("/api/ask-ai", aiLimiter, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Question is required." });
    }

    const zoneData = await getZoneSummary();
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `You are a helpful assistant for a mall parking dashboard called SwiftParkAI.
Here is the current zone-level parking data:
${JSON.stringify(zoneData, null, 2)}

Field meanings:
- avgTurnover: average number of times a spot in this zone changes from vacant to occupied historically (higher = busier/more active zone over time)
- avgDwellTimeMinutes: average time a car stays parked in this zone, in minutes
- spotCount: total number of parking spots in this zone
- currentlyOccupied: number of spots in this zone that are occupied RIGHT NOW, based on live sensor data
- currentlyAvailable: number of spots in this zone that are open RIGHT NOW, based on live sensor data

When the question asks about current availability, busyness "right now", or where to go immediately, prioritize currentlyOccupied/currentlyAvailable over historical averages. Use avgTurnover and avgDwellTimeMinutes for questions about general patterns or trends over time.

Answer the following question concisely (2-3 sentences max), based only on the data above. If the question asks for information not present in this data (like store locations, day-of-week patterns, or anything not listed above), say clearly that you don't have that data yet, rather than guessing.

Question: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (error) {
    console.error("AI route error:", error);
    res.status(500).json({ error: "Failed to get AI response." });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is LIVE at http://localhost:${PORT}`);
});
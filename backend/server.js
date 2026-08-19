// IMPORTS AND MIDDLEWARE

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config();

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

let app = express();
app.use(express.json());
app.use(cors());


// THE SCHEMA FOR DATA MODELING

const parkingSchema = new mongoose.Schema({
    spotId:{type: Number , required: true},
    occupied:{type : Boolean ,  required : true},
    timestamp:{type: Date , default: Date.now}
})

const ParkingLog = mongoose.model('ParkingLog',parkingSchema);

// THE CLOUD CONNECTION

const DbURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 9000



mongoose.connect(DbURI)
.then(()=>console.log(`Connected to Mongo Database Successfuly at port: ${PORT}`))
.catch((err)=>console.log('Connection Failed',err));


// THE UPDATED ROUTE


app.get("/latest-status",async (req,res)=>{
            
   try{
        const latestStatus = await ParkingLog.aggregate([
            // sort everything by time
            {$sort : {timestamp : -1}},
            {$group :{
                _id : "$spotId",
                spotId : {$first : "$spotId"},
                occupied  : {$first : "$occupied"},
                timestamp : {$first : "$timestamp"}
            }},
            { $sort : {spotId:1}}
        ]);

        if (latestStatus.length>0){
            res.status(200).json(latestStatus);
        }
        else{
            res.status(404).json({message : "Data not Found"});
        }
   }
   catch(err){
    console.error("Error fetching from DB: ",err);
    res.status(500).send("Internal Server Error");
   }
    
})


// ZONE ANCHOR POINTS — real locations around Square One Mall
const zoneAnchors = [
    { min: 1,  max: 10, lat: 43.5943741, lng: -79.6460898 }, // Zone A - Sheridan side
    { min: 11, max: 20, lat: 43.5911624, lng: -79.6413510 }, // Zone B - Celebration Square side
    { min: 21, max: 30, lat: 43.5964637, lng: -79.6406148 }, // Zone C - Walmart side
];

const LAT_STEP = 0.00015; // spacing between rows
const LNG_STEP = 0.00025; // spacing between columns

function getClusteredCoords(spotId) {
    const zone = zoneAnchors.find(z => spotId >= z.min && spotId <= z.max);
    if (!zone) return { lat: null, lng: null };

    const indexInZone = spotId - zone.min; // 0 through 9
    const row = Math.floor(indexInZone / 5); // 0 or 1
    const col = indexInZone % 5;             // 0 through 4

    return {
        lat: zone.lat + (row * LAT_STEP),
        lng: zone.lng + (col * LNG_STEP),
    };
}

app.get("/api/parking-stats",(req,res)=>{
    const results = [];
    // This tells Node: Start at backend/, go UP to SwiftParkAI/, then DOWN to scripts/
    const csvFilePath = path.join(__dirname, '..', 'scripts', 'final_clustered_data.csv');

    if (!fs.existsSync(csvFilePath)) {
        return res.status(404).json({ error: "CSV file not found at " + csvFilePath });
    }
    // Make sure the path points to where your Python script saved the file
    fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data',(data)=>{
        // Convert strings to numbers for React-Leaflet
        const coords = getClusteredCoords(parseInt(data.spotId));
        results.push({
            ...data,
            spotId: parseInt(data.spotId),
            occupied :  data.occupied === "True" || data.occupied === '1',
            lat: coords.lat,
            lng: coords.lng,
            cluster: parseInt(data.cluster),
            total_time: parseFloat(data.total_time),
            turnover: parseInt(data.turnover)
        });
    })
    .on('end',()=>{
        res.json(results);
    })
    .on('error',(err)=>{
        res.status(500).json({ error: "Could not read cluster data" });
    });
});



app.post("/",async(req,res)=>{
    try{
        console.log("Data received from sensor: ",req.body);

        // Create a new document based on the request body
        const newLog = new ParkingLog(req.body);

        // save it to mongoDB
        await newLog.save();
        res.status(200).send('Data Stored in Cloud Succesfully');
    }
    catch(error){
        console.error("Error Saving to DB: ",error);
        res.status(500).send('Failed to store data');
    }
})





const server = app.listen(PORT, '0.0.0.0', () => {console.log(` Server is LIVE at http://localhost:${PORT}`)})
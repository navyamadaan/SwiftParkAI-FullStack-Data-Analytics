import { useEffect, useState } from "react";

// Component imports
import { Login } from "./components/Login";
import { SideBar } from "./components/SideBar";
import { SpaceSelector } from "./components/SpaceSelector";
import { ZoneAnalytics } from "./components/ZoneAnalytics";
import { ParkingGrid } from "./components/ParkingGrid";
import { AIChat } from "./components/AIChat";
import { RealMap } from "./components/RealMap";
import "leaflet/dist/leaflet.css";

// Groups raw per-spot data into per-zone averages (turnover, dwell time, occupancy)
// so the Zone Analytics tab and AI chat can work with summarized stats instead of 30 individual spots.
function aggregateZoneData(mapBlueprint) {
  if (!mapBlueprint || mapBlueprint.length === 0) return [];

  const zoneGroups = {};

  mapBlueprint.forEach((spot) => {
    const zone = spot.zone_name || "Unknown Zone";

    // Create a new group the first time we see this zone
    if (!zoneGroups[zone]) {
      zoneGroups[zone] = {
        zone_name: zone,
        totalTurnover: 0,
        totalTime: 0,
        count: 0,
        occupiedCount: 0,
        vacantCount: 0,
      };
    }

    // Add this spot's numbers into its zone's running totals
    zoneGroups[zone].totalTurnover += spot.turnover || 0;
    zoneGroups[zone].totalTime += spot.total_time || 0;
    zoneGroups[zone].count += 1;

    if (spot.occupied) {
      zoneGroups[zone].occupiedCount += 1;
    } else {
      zoneGroups[zone].vacantCount += 1;
    }
  });

  // Convert totals into averages, ready for charts/AI use
  return Object.values(zoneGroups).map((zone) => ({
    zone_name: zone.zone_name,
    avgTurnover: parseFloat((zone.totalTurnover / zone.count).toFixed(2)),
    avgTime: parseFloat((zone.totalTime / zone.count).toFixed(2)),
    count: zone.count,
    occupiedCount: zone.occupiedCount,
    vacantCount: zone.vacantCount,
  }));
}

function App() {
  // --- Auth state ---
  // Reads localStorage on first load so refreshing the page doesn't log the user out
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("swiftpark_logged_in") === "true";
  });

  // --- Parking & UI state ---
  const [activeSpace, setActiveSpace] = useState("Space A"); // which Space (A/B/C) is selected in Grid View
  const [activeTab, setActiveTab] = useState("map");         // which sidebar tab is active: 'map' | 'analytics'
  const [viewMode, setViewMode] = useState("grid");          // within the Map tab: 'grid' | 'map'
  const [mapBlueprint, setMapBlueprint] = useState([]);      // spot data with lat/lng + cluster info (from CSV)
  const [parkingData, setParkingData] = useState([]);        // live occupancy per spot (from MongoDB)
  const spaceList = ["Space A", "Space B", "Space C"];

  // Fetch geographic + clustering data once on load (doesn't change often, so no polling needed)
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/parking-stats`);
        const json = await response.json();
        setMapBlueprint(json); // Includes lat, lng, cluster, and zone name for every spot
      } catch (error) {
        console.error("Error fetching bridge data:", error);
      }
    };

    fetchMapData();
  }, []);

  // Poll live occupancy every 5 seconds so the dashboard reflects real-time sensor data
  useEffect(() => {
    const fetchParkingStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/latest-status`);
        const data = await response.json();
        setParkingData(data);
      } catch (err) {
        console.error("Connection to Backend failed: ", err);
      }
    };

    fetchParkingStatus(); // run once immediately on mount/login

    const interval = setInterval(fetchParkingStatus, 5000);
    return () => clearInterval(interval); // clean up polling when component unmounts
  }, [isLoggedIn]);

  // --- Auth gate: show Login screen until the user signs in ---
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem("swiftpark_logged_in", "true");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const onLogout = () => {
    localStorage.removeItem("swiftpark_logged_in");
    setIsLoggedIn(false);
  };

  // Recalculated on every render from the latest mapBlueprint — cheap enough not to need memoization
  const zoneAnalyticsData = aggregateZoneData(mapBlueprint);

  // --- Main dashboard (only reached once logged in) ---
  return (
    <div className="flex h-screen bg-ink text-porcelain overflow-hidden font-body">
      {/* Sidebar navigation */}
      <SideBar onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Page header, changes label based on active tab */}
        <header className="mb-8">
          <span className="eyebrow">Live Telemetry</span>
          <h1 className="text-3xl font-display font-semibold italic mt-1">
            {activeTab === "map" ? "Mall Operations Dashboard" : "Zone Performance"}
          </h1>
          <p className="text-mist font-mono text-sm">real_time_iot // swiftpark_ai</p>
        </header>

        {/* ---- Live Map tab: Grid View or Map View ---- */}
        {activeTab === "map" && (
          <>
            {/* Toggle between Grid View and Map View */}
            <div className="inline-flex items-center gap-1 p-1 mb-6 rounded-xl bg-panel/60 border border-gold/10 backdrop-blur-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-signal/10 text-signal border border-signal/30 shadow-[0_0_15px_rgba(79,216,196,0.1)]"
                    : "text-mist hover:text-porcelain hover:bg-white/5"
                }`}
              >
                Grid View
              </button>

              <button
                onClick={() => setViewMode("map")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "map"
                    ? "bg-signal/10 text-signal border border-signal/30 shadow-[0_0_15px_rgba(79,216,196,0.1)]"
                    : "text-mist hover:text-porcelain hover:bg-white/5"
                }`}
              >
                Map View
              </button>
            </div>

            {/* Show either the card grid or the interactive map, depending on viewMode */}
            {viewMode === "grid" ? (
              <>
                <SpaceSelector spaces={spaceList} activeSpace={activeSpace} setActiveSpace={setActiveSpace} />
                <ParkingGrid activeSpace={activeSpace} parkingData={parkingData} zoneData={mapBlueprint} />
              </>
            ) : (
              <RealMap data={mapBlueprint} />
            )}
          </>
        )}

        {/* ---- Zone Analytics tab: AI chat + charts ---- */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <AIChat />
            <ZoneAnalytics data={zoneAnalyticsData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
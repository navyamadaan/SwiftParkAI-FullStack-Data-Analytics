import { useEffect, useState } from "react";
import { Login } from "./components/Login";
import { SideBar } from "./components/SideBar";
import { SpaceSelector } from "./components/SpaceSelector";
import { ZoneAnalytics } from "./components/ZoneAnalytics";
import { ParkingGrid } from "./components/ParkingGrid";
import { RealMap } from "./components/RealMap";
import 'leaflet/dist/leaflet.css';



function aggregateZoneData(mapBlueprint) {
  if (!mapBlueprint || mapBlueprint.length === 0) return [];

  const zoneGroups = {};

  mapBlueprint.forEach((spot) => {
    const zone = spot.zone_name || 'Unknown Zone';

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

    zoneGroups[zone].totalTurnover += spot.turnover || 0;
    zoneGroups[zone].totalTime += spot.total_time || 0;
    zoneGroups[zone].count += 1;

    if (spot.occupied) {
      zoneGroups[zone].occupiedCount += 1;
    } else {
      zoneGroups[zone].vacantCount += 1;
    }
  });

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
  // 1. Manage the authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 2. Manage the parking data state
  const [activeSpace, setActiveSpace] = useState('Space A');
  const [isOccupied, setIsOccupied] = useState(false);
  const[activeTab,setActiveTab]=useState('map');
  const [mapBlueprint , setMapBlueprint] = useState([]);
  const [parkingData, setParkingData]= useState([]);
  const spaceList = ['Space A', 'Space B', 'Space C'];
  const [viewMode, setViewMode]= useState('grid');


    useEffect(() => {
  const fetchMapData = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/parking-stats');
      const json = await response.json();
      setMapBlueprint(json); // This state now contains lat, lng, and cluster names!
    } catch (error) {
      console.error("Error fetching bridge data:", error);
    }
  };

  fetchMapData();
  // Set an interval if you want the clusters to update live
}, []);

    useEffect(()=>{
    // define the function
    const fetchParkingStatus = async()=>{
    try{
      const response = await fetch('http://localhost:9000/latest-status');
      const data = await response.json();
      setParkingData(data);
    }
    catch(err){
      console.error("Connection to Backend failed : ",err);
    }
  }
  
  // call it
  fetchParkingStatus();

  const interval = setInterval(fetchParkingStatus, 5000);

  return () => clearInterval(interval);
  }
  , [isLoggedIn]  );    //this means only run it once  

  // 3. Conditional Rendering: Gatekeeper
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const onLogout=()=>{
    setIsLoggedIn(false);
  }


const zoneAnalyticsData = aggregateZoneData(mapBlueprint);
console.log('Zone analytics:', zoneAnalyticsData);


  // 4. Main Dashboard (Visible only after Sign In)
  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Navigation & Brand */}
      <SideBar
      onLogout={onLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab} />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold italic">
      {activeTab === 'map' ? 'Mall Operations Dashboard' : 'Zone Performance' }
    </h1>
    <p className="text-slate-400">Real-time IoT Telemetry for SwiftParkAI</p>
  </header>




  {/* LOGIC: Render content based on activeTab */}
  {activeTab === 'map' && (
    <>

      <div className="view-controls">
        <button onClick={()=> setViewMode('grid')} className={viewMode==='grid' ? 'active' : ''}>
          Grid View
        </button>

        <button onClick={()=> setViewMode('map')} className={viewMode==='map' ? 'active' : ''}>
          Map View
        </button>
      </div>

      {viewMode === 'grid' ? 
      (
        <ParkingGrid data={parkingData} />
      ) 
        : 
      (
        <RealMap data={mapBlueprint} />
      )}

      <SpaceSelector
      spaces={spaceList} 
        activeSpace={activeSpace} 
        setActiveSpace={setActiveSpace} 
      />
      <ParkingGrid 
        activeSpace={activeSpace} 
        parkingData={parkingData} 
      />
    </>
  )}

  {activeTab === 'analytics' && (
    <ZoneAnalytics data={zoneAnalyticsData} />
  )}

      </main> 
    </div>   
  );
}

export default App;
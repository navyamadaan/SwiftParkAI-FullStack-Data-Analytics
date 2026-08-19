<video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center z-0 "
            >
            <source src="/bg-video.mp4" type="video/mp4" />
            </video>



import random
import time
import requests

class Spot:
    def __init__(self, ID, Occupied):
        self.ID = ID
        self.Occupied = Occupied

spotsA = []
spotsB = []
spotsC = []

for i in range (1,11):
    
    occupancy = random.choice([True,False])
    element = Spot(i,occupancy)
    spotsA.append(element)

for i in range (11,21):
    
    occupancy = random.choice([True,False])
    element = Spot(i,occupancy)
    spotsB.append(element)

for i in range (21,31):
    
    occupancy = random.choice([True,False])
    element = Spot(i,occupancy)
    spotsC.append(element)


all_spots = spotsA+spotsB+spotsC




npx localtunnel --port 9000 --subdomain swift-park-navya



 return (
        <div style={{ height: "500px", width: "100%", borderRadius: "10px", overflow: "hidden" }}>
            <MapContainer center={center} zoom={18} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {/* Render routing only if a target destination is selected */}
                {target && <Routing start={mallEntrance} end={target} />}

                {/* Reset button to clear the route line */}
                {target && (
                    <button 
                        style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px', 
                            zIndex: 1000,
                            padding: '8px 12px',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        onClick={() => setTarget(null)}
                    >
                        Clear Route
                    </button>
                )}

                {/* Map through data with validation to prevent 'undefined' crashes */}
                {data && data.map((spot, index) => {
                    // Guard Clause: Skip spots missing coordinates from the CSV
                    if (!spot || spot.lat === undefined || spot.lng === undefined) {
                        return null;
                    }

                    return (
                        <CircleMarker
                            key={spot.spotId || index}
                            center={[spot.lat, spot.lng]}
                            radius={8}
                            pathOptions={{
                                fillColor: getClusterColor(spot.cluster),
                                color: spot.occupied ? "black" : "white",
                                weight: 2,
                                fillOpacity: 0.8,
                            }}
                        >
                            <Popup>
                                <div className="popup-content">
                                    <strong>Spot {spot.spotId}</strong> <br/>
                                    Zone: {spot.zone_name} <br/>
                                    Status: {spot.occupied ? "Occupied" : "Available"}
                                    <br />
                                    <button 
                                        style={{ marginTop: '10px', cursor: 'pointer' }}
                                        onClick={() => setTarget([spot.lat, spot.lng])}
                                    >
                                        Get Directions
                                    </button>
                                </div>
                            </Popup>
                            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                Spot {spot.spotId}
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
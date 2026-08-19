import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Routing from "./Routing.js"; // Ensure this matches your file name

export const RealMap = ({ data }) => {
    // Center of Square One Shopping Centre
    const center = [43.5930, -79.6425];
    const [target, setTarget] = useState(null);
    const mallEntrance = [43.5935, -79.6430];

    // Helper to color cod1 SXZe markers based on K-Means results
    const getClusterColor = (cluster) => {
        const clusterId = parseInt(cluster);
        switch (clusterId) {
            case 0: return "#2ecc71"; // Prime Shopping (Green)
            case 1: return "#95a5a6"; // Inactive (Gray)
            case 2: return "#e74c3c"; // Long-Stay (Red)
            default: return "#3498db";
        }
    };

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
                {data && data.length>0 && data.map((spot, index) => {
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
};

export default RealMap;
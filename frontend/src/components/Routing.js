import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const Routing = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // 1. Create the routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      lineOptions: {
        styles: [{ color: "#3498db", weight: 5 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false // Hides the text instructions box
    }).addTo(map);

    // 2. THE FIX: The Cleanup Function
    // This removes the line BEFORE the component updates or unmounts
    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end]); // Re-run when start or end changes

  return null;
};

export default Routing;
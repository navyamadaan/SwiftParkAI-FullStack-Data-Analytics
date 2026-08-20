import { ParkingSpot } from './ParkingSpot';

export const ParkingGrid = ({ activeSpace, parkingData, zoneData }) => {

  if (!parkingData || parkingData.length === 0) {
    return <div className="text-center p-20 text-mist italic font-mono text-sm">connecting_to_iot_sensors...</div>;
  }

  // Build a quick lookup: spotId -> zone_name
  const zoneLookup = {};
  (zoneData || []).forEach((spot) => {
    zoneLookup[spot.spotId] = spot.zone_name;
  });

  return (
    <div className="grid grid-cols-5 gap-6">
      {parkingData
        .filter((spot) => {
          if (activeSpace === 'Space A') return spot.spotId <= 10;
          if (activeSpace === 'Space B') return spot.spotId > 10 && spot.spotId <= 20;
          if (activeSpace === 'Space C') return spot.spotId > 20;
          return true;
        })
        .map((spot) => (
          <ParkingSpot
            key={spot.spotId}
            id={spot.spotId}
            occupied={spot.occupied}
            zone={zoneLookup[spot.spotId] || "Unclassified"}
          />
        ))}
    </div>
  );
};
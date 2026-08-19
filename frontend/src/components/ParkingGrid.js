import { ParkingSpot } from './ParkingSpot';

export const ParkingGrid = ({ activeSpace, parkingData }) => {

  if (!parkingData || parkingData.length === 0) {
    return <div className="text-center p-20 text-slate-500 italic">Connecting to IoT Sensors...</div>;
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      {parkingData

      .filter((spot)=>{
        if(activeSpace==='Space A') return spot.spotId <= 10;
        if (activeSpace === 'Space B') return spot.spotId > 10 && spot.spotId <= 20;
        if (activeSpace === 'Space C') return spot.spotId > 20;
        return true; // Fallback
      })


      .map((spot) => (
        <ParkingSpot 
          key={spot.spotId}
          id={spot.spotId}
          occupied={spot.occupied}/>
      ))
      
      }
    </div>
  );
};
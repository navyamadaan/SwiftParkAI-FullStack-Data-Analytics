import { Car } from 'lucide-react';

export const ParkingSpot = ({ id, occupied, zone }) => {
  return (
    <div className="relative group p-4">
      {/* Glow */}
      <div className={`absolute inset-0 blur-2xl transition-opacity duration-500 opacity-20 ${
        occupied ? "bg-red-500" : "bg-signal"
      }`}></div>

      {/* Glass card */}
      <div className={`relative z-10 border border-gold/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center transition-all ${
        occupied ? "bg-panel/60" : "bg-white/10"
      }`}>

        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full mb-3 uppercase tracking-widest ${
          occupied ? "bg-red-500/20 text-red-400" : "bg-signal/20 text-signal"
        }`}>
          {occupied ? "Occupied" : "Available"}
        </span>

        <Car size={48} className={occupied ? "text-red-500" : "text-signal"} />

        <div className="mt-4 text-center">
          <p className="text-xl font-display font-semibold text-porcelain">Spot {id}</p>
          <p className="text-xs text-mist mt-1 italic">{zone}</p>
        </div>

        <button className="mt-6 w-full py-2 bg-signal/10 hover:bg-signal/20 border border-signal/40 text-signal rounded-lg text-sm font-semibold transition-all">
          Navigate
        </button>
      </div>
    </div>
  );
};
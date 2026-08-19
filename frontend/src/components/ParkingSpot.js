import {Car} from 'lucide-react'

export const ParkingSpot = ({ id, occupied }) => {
  return (
    <div className="relative group p-4">
      {/* 1. THE GLOW (Background) */}
      <div className={`absolute inset-0 blur-2xl transition-opacity duration-500 opacity-20 ${
        occupied ? "bg-red-500" : "bg-emerald-500"
      }`}></div>

      {/* 2. THE GLASS CARD (Foreground) */}
      <div className={`relative z-10 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center transition-all ${
        occupied ? "bg-slate-900/60" : "bg-white/10"
      }`}>
        
        {/* Status Badge */}
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full mb-3 uppercase tracking-widest ${
          occupied ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
        }`}>
          {occupied ? "Occupied" : "Available"}
        </span>

        <Car size={48} className={occupied ? "text-red-500" : "text-emerald-500"} />
        
        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-white">Spot {id}</p>
          {/* Your ML Touch: Show customer value or prediction */}
          <p className="text-xs text-slate-400 mt-1 italic">VIP Zone • 95% Utility</p>
        </div>

        {/* The Action Button */}
        <button className="mt-6 w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 rounded-lg text-sm font-semibold transition-all">
          Navigate
        </button>
      </div>
    </div>
  );
};
import { LayoutDashboard, BarChart3, LogOut, Settings } from "lucide-react";
import {useEffect, useState} from 'react'



export const SideBar = ({ onLogout, setActiveTab, activeTab }) => {
  return (
    <aside className="w-64 h-full flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10 z-20">
      
      {/* 1. BRAND SECTION */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SwiftPark</span>
        </div>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <nav className="flex-1 px-4 space-y-2">
        {/* Navigation Item Template */}
        {[
          { id: 'map', label: 'Live Map', icon: LayoutDashboard },
          { id: 'analytics', label: 'Zone Analytics', icon: BarChart3 },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id 
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? "text-blue-400" : "group-hover:text-white"} />
            <span className="font-semibold text-sm">{item.label}</span>
            
            {/* Active Indicator Glow */}
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      {/* 3. SYSTEM SECTION (Logout) */}
      <div className="p-4 border-t border-white/5 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};
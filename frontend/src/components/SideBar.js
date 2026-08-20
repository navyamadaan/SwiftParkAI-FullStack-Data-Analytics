import { LayoutDashboard, BarChart3, LogOut } from "lucide-react";

export const SideBar = ({ onLogout, setActiveTab, activeTab }) => {
  return (
    <aside className="w-64 h-full flex flex-col bg-panel/50 backdrop-blur-xl border-r border-gold/10 z-20">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 bg-gradient-to-br from-gold to-gold-light rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
            <span className="text-ink font-display font-bold text-xl">S</span>
          </div>
          <div>
            <span className="text-lg font-display font-semibold tracking-tight text-porcelain block leading-tight">
              SwiftPark
            </span>
            <span className="eyebrow">AI Concierge</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {[
          { id: "map", label: "Live Map", icon: LayoutDashboard },
          { id: "analytics", label: "Zone Analytics", icon: BarChart3 },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id
                ? "bg-signal/10 text-signal border border-signal/30 shadow-[0_0_15px_rgba(79,216,196,0.1)]"
                : "text-mist hover:bg-white/5 hover:text-porcelain"
            }`}
          >
            <item.icon
              size={20}
              className={activeTab === item.id ? "text-signal" : "group-hover:text-porcelain"}
            />
            <span className="font-semibold text-sm">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto pulse-dot" />
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gold/10 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-mist hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};
export const SpaceSelector = ({ spaces = [], activeSpace, setActiveSpace }) => {
  return (
    <div className="flex gap-4 mb-8">
      {spaces.map(space => (
        <button 
          key={space}
          onClick={() => setActiveSpace(space)}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeSpace === space 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          {space}
        </button>
      ))}
    </div>
  );
};
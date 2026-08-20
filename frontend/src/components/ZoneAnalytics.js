import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const ZONE_COLORS = ['#D4A45C', '#4FD8C4', '#8B95A7'];

export const ZoneAnalytics = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center p-20 text-slate-500 italic">Loading zone data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <h2 className="text-xl text-blue-400 font-bold mb-4">Zone Occupancy Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="zone_name" stroke="#8884d8" />
            <YAxis stroke="#8884d8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="occupiedCount" fill="#82ca9d" name="Occupied Spots" />
            <Bar dataKey="vacantCount" fill="#8884d8" name="Vacant Spots" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <h2 className="text-xl text-blue-400 font-bold mb-4">Zone Turnover Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="zone_name" stroke="#8884d8" />
            <YAxis stroke="#8884d8" />
            <Tooltip />
            <Bar dataKey="avgTurnover" fill="#ffc658" name="Avg Turnover" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <h2 className="text-xl text-blue-400 font-bold mb-4">Spot Distribution by Zone</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="zone_name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ZONE_COLORS[index % ZONE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
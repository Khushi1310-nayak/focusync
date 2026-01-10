import React from 'react';
import { Session } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

interface AnalyticsProps {
  sessions: Session[];
}

const Analytics: React.FC<AnalyticsProps> = ({ sessions }) => {
  // Aggregate data by category
  const categoryData = sessions.reduce((acc, session) => {
    const existing = acc.find(item => item.name === session.category);
    if (existing) {
      existing.value += session.duration;
    } else {
      acc.push({ name: session.category, value: session.duration });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Convert seconds to hours for display
  const pieData = categoryData.map(d => ({ ...d, value: parseFloat((d.value / 3600).toFixed(2)) }));

  // Calculate Daily Activity for Bar Chart (Real Data)
  const dailyData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toDateString();
      
      const daySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === dateStr);
      const totalSeconds = daySessions.reduce((acc, s) => acc + s.duration, 0);
      
      data.push({
        name: dayName,
        focus: parseFloat((totalSeconds / 3600).toFixed(2)),
      });
    }
    return data;
  }, [sessions]);

  const COLORS = ['#00E5FF', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-6">Performance Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="glass-panel p-6 rounded-2xl h-80 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Time by Category (Hours)</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#132F4C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No session data yet.
            </div>
          )}
        </div>

        {/* Daily Focus Trend */}
        <div className="glass-panel p-6 rounded-2xl h-80 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Daily Focus (Hours)</h3>
          {sessions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" axisLine={false} tickLine={false} />
                <YAxis stroke="#6B7280" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#132F4C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="focus" name="Coding Time" fill="#00E5FF" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-500">
              Start coding to see your trends!
            </div>
          )}
        </div>
      </div>

      {/* Insight Card */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-secondary">
        <h3 className="text-lg font-bold text-white mb-2">💡 Weekly Insight</h3>
        <p className="text-gray-300">
          {sessions.length > 0 
            ? "Keep up the consistency! Check back later for more detailed patterns." 
            : "Start your first session to unlock AI-powered insights."}
        </p>
      </div>
    </div>
  );
};

export default Analytics;
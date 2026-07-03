import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Activity, Calendar, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Analytics() {
  const { guildId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    api.analytics.get(guildId, days).then(d => {
      setData(d.analytics);
      setLoading(false);
    }).catch(console.error);
  }, [guildId, days]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const timeline = data?.timeline || [];
  const totalActions = data?.totalActions || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="glass rounded-lg px-3 py-2 text-sm">
        <p className="text-gray-300">{label}</p>
        <p className="text-blurple font-semibold">{payload[0].value} actions</p>
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-sm text-gray-400">Server activity and usage metrics</p>
        </div>
        <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${days === d ? 'bg-blurple text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="stat-label">Total Actions</p>
          <p className="stat-value">{totalActions}</p>
          <p className="text-xs text-gray-500 mt-1">Last {days} days</p>
        </Card>
        <Card>
          <p className="stat-label">Open Tickets</p>
          <p className="stat-value">{data?.tickets?.open || 0}</p>
        </Card>
        <Card>
          <p className="stat-label">Closed Tickets</p>
          <p className="stat-value">{data?.tickets?.closed || 0}</p>
        </Card>
      </div>

      <Card>
        <h3 className="section-title flex items-center gap-2"><Activity size={16} /> Activity Timeline</h3>
        {timeline.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#5865F2" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No data yet</p>
        )}
      </Card>
    </div>
  );
}

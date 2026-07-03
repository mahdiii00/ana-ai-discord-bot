import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'blurple' }) {
  const colors = { blurple: 'text-blurple', green: 'text-green', red: 'text-red', yellow: 'text-yellow' };
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value mt-1">{value}</p>
          {trend !== undefined && (
            <p className={`flex items-center gap-1 text-xs mt-2 ${trendUp ? 'text-green' : 'text-red'}`}>
              {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {trend}%
            </p>
          )}
        </div>
        {Icon && <div className={`p-3 rounded-xl bg-${color}/10 ${colors[color]}`}><Icon size={22} /></div>}
      </div>
    </div>
  );
}

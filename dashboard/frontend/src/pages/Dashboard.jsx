import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Activity, Ticket, Archive, Users, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import StatCard from '../components/StatCard';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';

export default function Dashboard() {
  const { guildId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guild, setGuild] = useState(null);

  useEffect(() => {
    Promise.all([
      api.guilds.get(guildId),
      api.logs.stats(guildId),
      api.analytics.get(guildId),
      api.tickets.list(guildId),
    ]).then(([g, stats, analytics, tickets]) => {
      setGuild(g.guild);
      setData({ stats: stats.stats, analytics: analytics.analytics, tickets: tickets.tickets });
      setLoading(false);
    }).catch(console.error);
  }, [guildId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const { stats, analytics: an, tickets } = data || {};
  const online = guild?.botInGuild;
  const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
  const totalLogs = stats?.last7d || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-400">Overview of {guild?.name || 'server'}</p>
        </div>
        <Badge variant={online ? 'green' : 'red'}>{online ? 'Online' : 'Offline'}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bot Status" value={online ? 'Online' : 'Offline'} icon={Activity} color={online ? 'green' : 'red'} />
        <StatCard title="Actions (7d)" value={totalLogs} icon={Shield} color="blurple" />
        <StatCard title="Open Tickets" value={openTickets} icon={Ticket} color="yellow" />
        <StatCard title="Backups" value={an?.tickets?.closed || 0} icon={Archive} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="section-title">Security Status</h3>
          <div className="space-y-3">
            {['antiSpam', 'antiLink', 'antiBot', 'antiScam', 'antiRaid', 'antiNuke', 'autoMod', 'autoBackup'].map(mod => (
              <div key={mod} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-300">{mod.replace(/^(anti|auto)/, '$1 ').replace(/([A-Z])/g, ' $1').trim()}</span>
                <Badge variant={guild?.config?.[mod] ? 'green' : 'gray'}>{guild?.config?.[mod] ? 'Enabled' : 'Disabled'}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="section-title">Recent Activity</h3>
          {stats?.topActions?.length > 0 ? (
            <div className="space-y-2">
              {stats.topActions.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-300">{a._id}</span>
                  <Badge>{a.count}x</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="section-title">Recent Tickets</h3>
        {tickets?.length > 0 ? (
          <div className="space-y-2">
            {tickets.slice(0, 5).map(ticket => (
              <div key={ticket._id} className="flex items-center justify-between py-2 border-b border-dark-700/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{ticket.userName || ticket.userId}</p>
                  <p className="text-xs text-gray-500">{ticket.subject || 'No subject'}</p>
                </div>
                <Badge variant={ticket.status === 'open' ? 'green' : ticket.status === 'closed' ? 'red' : 'yellow'}>
                  {ticket.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tickets yet</p>
        )}
      </Card>
    </div>
  );
}

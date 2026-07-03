import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ticket, MessageSquare, User, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export default function Tickets() {
  const { guildId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tickets.list(guildId).then(d => {
      setTickets(d.tickets || []);
      setLoading(false);
    }).catch(console.error);
  }, [guildId]);

  const updateStatus = async (ticketId, status) => {
    await api.tickets.updateStatus(guildId, ticketId, status);
    setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status } : t));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const open = tickets.filter(t => t.status === 'open');
  const closed = tickets.filter(t => t.status === 'closed');
  const pending = tickets.filter(t => t.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tickets</h1>
          <p className="text-sm text-gray-400">{open.length} open · {pending.length} pending · {closed.length} closed</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><p className="stat-label">Open</p><p className="stat-value text-green">{open.length}</p></Card>
        <Card><p className="stat-label">Pending</p><p className="stat-value text-yellow">{pending.length}</p></Card>
        <Card><p className="stat-label">Closed</p><p className="stat-value text-gray-400">{closed.length}</p></Card>
      </div>

      {tickets.length === 0 ? (
        <Card><p className="text-sm text-gray-500 text-center py-8">No tickets yet</p></Card>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <Card key={ticket._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={ticket.status === 'open' ? 'green' : ticket.status === 'closed' ? 'red' : 'yellow'}>{ticket.status}</Badge>
                    <span className="text-sm font-medium">{ticket.userName || 'Unknown User'}</span>
                    <span className="text-xs text-gray-500 font-mono">{ticket.userId}</span>
                  </div>
                  {ticket.subject && <p className="text-sm text-gray-300 mb-2">{ticket.subject}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {ticket.messages?.length || 0} messages</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {ticket.status !== 'closed' && (
                  <Button size="sm" variant="secondary" onClick={() => updateStatus(ticket._id, 'closed')}>Close</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

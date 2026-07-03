import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollText, Filter, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

const severityColors = { info: 'gray', warn: 'yellow', high: 'red' };

export default function Logs() {
  const { guildId } = useParams();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [guildId, filter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter) params.action = filter;
      const data = await api.logs.list(guildId, params);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Logs</h1>
        <p className="text-sm text-gray-400">{total} total entries</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-9" placeholder="Filter by action..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        {filter && <button onClick={() => setFilter('')} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>}
        <span className="text-xs text-gray-500 ml-auto">{logs.length} showing</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : logs.length === 0 ? (
        <Card><p className="text-sm text-gray-500 text-center py-8">No logs found</p></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-dark-700/50">
            {logs.map((log, i) => (
              <div key={log._id || i} className="flex items-center gap-4 px-5 py-3 hover:bg-dark-700/30 transition-colors">
                <Badge variant={severityColors[log.severity] || 'gray'}>{log.severity || 'info'}</Badge>
                <span className="text-xs font-mono text-gray-500 w-16 shrink-0">{formatDate(log.timestamp)}</span>
                <span className="text-sm font-medium text-gray-200 w-36 shrink-0">{log.action}</span>
                <span className="text-xs text-gray-400 truncate">{log.executor || 'system'}</span>
                <span className="text-xs text-gray-500 truncate ml-auto">{log.details ? JSON.stringify(log.details).slice(0, 60) : ''}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

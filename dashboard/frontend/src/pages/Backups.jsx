import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Archive, Download, Trash2, Clock, Layers } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';

export default function Backups() {
  const { guildId } = useParams();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.backups.list(guildId).then(d => {
      setBackups(d.backups || []);
      setLoading(false);
    }).catch(console.error);
  }, [guildId]);

  const viewBackup = async (filename) => {
    const d = await api.backups.get(guildId, filename);
    setSelected(d.backup);
  };

  const formatDate = (ts) => new Date(ts).toLocaleString();

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Backups</h1>
        <p className="text-sm text-gray-400">{backups.length} saved snapshots</p>
      </div>

      {backups.length === 0 ? (
        <Card><p className="text-sm text-gray-500 text-center py-8">No backups yet. The bot creates them automatically before dangerous actions.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {backups.map((b, i) => (
            <Card key={b.filename} hover onClick={() => viewBackup(b.filename)}>
              <div className="flex items-start justify-between mb-3">
                <Badge>#{backups.length - i}</Badge>
                <Archive size={18} className="text-gray-500" />
              </div>
              <p className="text-xs font-mono text-gray-400 mb-2">{b.filename}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Layers size={12} /> {b.roles} roles</span>
                <span className="flex items-center gap-1"><Layers size={12} /> {b.channels} channels</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Clock size={12} /> {formatDate(b.timestamp)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Backup Details">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-800 rounded-lg p-3"><p className="text-gray-500 text-xs">Server</p><p className="font-medium">{selected.name}</p></div>
              <div className="bg-dark-800 rounded-lg p-3"><p className="text-gray-500 text-xs">Backup ID</p><p className="font-medium font-mono text-xs">{selected.id}</p></div>
              <div className="bg-dark-800 rounded-lg p-3"><p className="text-gray-500 text-xs">Roles</p><p className="font-medium">{selected.roles?.length || 0}</p></div>
              <div className="bg-dark-800 rounded-lg p-3"><p className="text-gray-500 text-xs">Channels</p><p className="font-medium">{selected.channels?.length || 0}</p></div>
            </div>
            {selected.roles?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Roles</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selected.roles.map(r => <div key={r.id} className="text-xs text-gray-400 font-mono">{r.name}</div>)}
                </div>
              </div>
            )}
            {selected.channels?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Channels</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selected.channels.map(c => <div key={c.id} className="text-xs text-gray-400 font-mono">#{c.name}</div>)}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

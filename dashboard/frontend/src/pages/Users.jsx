import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users as UsersIcon, Shield, ShieldOff, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export default function Users() {
  const { guildId } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inputId, setInputId] = useState('');

  useEffect(() => {
    api.config.get(guildId).then(d => {
      setConfig(d.config);
      setLoading(false);
    }).catch(console.error);
  }, [guildId]);

  const handleAction = async (list, id, action) => {
    if (!id) return;
    const endpoint = list === 'whitelist' ? api.config.whitelist : api.config.blacklist;
    await endpoint(guildId, id, action);
    const d = await api.config.get(guildId);
    setConfig(d.config);
    setInputId('');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const whitelist = config?.whitelist || [];
  const blacklist = config?.blacklist || [];

  const filteredWhite = whitelist.filter(id => id.includes(search));
  const filteredBlack = blacklist.filter(id => id.includes(search));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">User Management</h1>
        <p className="text-sm text-gray-400">Manage whitelist and blacklist</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-9" placeholder="Search by ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input className="input-field max-w-[200px]" placeholder="User ID" value={inputId} onChange={e => setInputId(e.target.value)} />
        <Button size="sm" variant="primary" onClick={() => handleAction('whitelist', inputId, 'add')} disabled={!inputId}>Whitelist</Button>
        <Button size="sm" variant="danger" onClick={() => handleAction('blacklist', inputId, 'add')} disabled={!inputId}>Blacklist</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="section-title flex items-center gap-2">
            <Shield size={16} className="text-green" /> Whitelist ({whitelist.length})
          </h3>
          {filteredWhite.length > 0 ? (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredWhite.map(id => (
                <div key={id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center"><UsersIcon size={14} className="text-green" /></div>
                    <span className="text-xs font-mono text-gray-300">{id}</span>
                  </div>
                  <button onClick={() => handleAction('whitelist', id, 'remove')} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">{search ? 'No matching users' : 'Whitelist is empty'}</p>
          )}
        </Card>

        <Card>
          <h3 className="section-title flex items-center gap-2">
            <ShieldOff size={16} className="text-red" /> Blacklist ({blacklist.length})
          </h3>
          {filteredBlack.length > 0 ? (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredBlack.map(id => (
                <div key={id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red/20 flex items-center justify-center"><ShieldOff size={14} className="text-red" /></div>
                    <span className="text-xs font-mono text-gray-300">{id}</span>
                  </div>
                  <button onClick={() => handleAction('blacklist', id, 'remove')} className="text-xs text-gray-500 hover:text-green-400 transition-colors">Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">{search ? 'No matching users' : 'Blacklist is empty'}</p>
          )}
        </Card>
      </div>
    </div>
  );
}

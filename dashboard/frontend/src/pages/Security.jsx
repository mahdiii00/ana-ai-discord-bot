import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, AlertTriangle, Users, ShieldOff } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';

const modules = [
  { key: 'antiSpam', label: 'Anti-Spam', desc: 'Detect and block spam messages' },
  { key: 'antiLink', label: 'Anti-Link', desc: 'Block suspicious links and invites' },
  { key: 'antiBot', label: 'Anti-Bot', desc: 'Auto-detect and kick bot accounts' },
  { key: 'antiScam', label: 'Anti-Scam', desc: 'Detect scam attempts and phishing' },
  { key: 'antiRaid', label: 'Anti-Raid', desc: 'Detect and block mass joins' },
  { key: 'antiNuke', label: 'Anti-Nuke', desc: 'Prevent mass channel/role deletion' },
  { key: 'autoMod', label: 'AutoMod', desc: 'AI-powered content moderation' },
  { key: 'autoBackup', label: 'Auto Backup', desc: 'Automatic daily server backups' },
];

export default function Security() {
  const { guildId } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    api.config.get(guildId).then(d => {
      setConfig(d.config);
      setLoading(false);
    }).catch(console.error);
  }, [guildId]);

  const toggle = async (module, enabled) => {
    const d = await api.config.toggleSecurity(guildId, module, enabled);
    setConfig(d.config);
  };

  const handleWhitelist = async (action) => {
    if (!userId) return;
    await api.config.whitelist(guildId, userId, action);
    const d = await api.config.get(guildId);
    setConfig(d.config);
    setUserId('');
  };

  const handleBlacklist = async (action) => {
    if (!userId) return;
    await api.config.blacklist(guildId, userId, action);
    const d = await api.config.get(guildId);
    setConfig(d.config);
    setUserId('');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Security</h1>
        <p className="text-sm text-gray-400">Manage security modules and filters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(mod => (
          <Card key={mod.key}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-sm">{mod.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{mod.desc}</p>
              </div>
              <Toggle checked={config?.[mod.key]} onChange={v => toggle(mod.key, v)} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="section-title flex items-center gap-2"><Shield size={16} /> Whitelist</h3>
          <p className="text-xs text-gray-500 mb-4">Whitelisted users bypass security filters</p>
          <div className="flex gap-2 mb-4">
            <input className="input-field flex-1" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
            <Button size="sm" onClick={() => handleWhitelist('add')}>Add</Button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {config?.whitelist?.map(id => (
              <div key={id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-dark-700/50">
                <span className="text-xs font-mono text-gray-400">{id}</span>
                <button onClick={() => handleWhitelist('remove', id)} className="text-red-400 hover:text-red text-xs">Remove</button>
              </div>
            ))}
            {(!config?.whitelist || config.whitelist.length === 0) && <p className="text-xs text-gray-500">Empty</p>}
          </div>
        </Card>

        <Card>
          <h3 className="section-title flex items-center gap-2"><ShieldOff size={16} /> Blacklist</h3>
          <p className="text-xs text-gray-500 mb-4">Blacklisted users are blocked from all actions</p>
          <div className="flex gap-2 mb-4">
            <input className="input-field flex-1" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
            <Button size="sm" onClick={() => handleBlacklist('add')}>Add</Button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {config?.blacklist?.map(id => (
              <div key={id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-dark-700/50">
                <span className="text-xs font-mono text-gray-400">{id}</span>
                <button onClick={() => handleBlacklist('remove', id)} className="text-red-400 hover:text-red text-xs">Remove</button>
              </div>
            ))}
            {(!config?.blacklist || config.blacklist.length === 0) && <p className="text-xs text-gray-500">Empty</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

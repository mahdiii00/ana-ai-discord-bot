import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import ServerList from '../components/ServerList';
import { Spinner } from '../components/ui/Spinner';
import { Bot, RefreshCw, LogOut } from 'lucide-react';

export default function Servers() {
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.auth.me().then(data => {
      if (!data?.user) { navigate('/login'); return; }
      setUser(data.user);
      loadGuilds();
    }).catch(() => navigate('/login'));
  }, [navigate]);

  async function loadGuilds() {
    setLoading(true);
    try {
      const data = await api.guilds.list();
      setGuilds(data.guilds || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const handleSelect = (guildId) => {
    navigate(`/dashboard/${guildId}`);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    navigate('/login');
  };

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : null;

  const managed = guilds.filter(g => g.hasBot);
  const available = guilds.filter(g => !g.hasBot);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Bot className="text-blurple" size={32} />
            <div>
              <h1 className="text-xl font-bold">Your Servers</h1>
              <p className="text-sm text-gray-400">Select a server to manage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {avatarUrl && <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full" />}
            <span className="text-sm text-gray-300">{user?.username}</span>
            <button onClick={loadGuilds} className="p-2 hover:bg-dark-700 rounded-lg transition-colors"><RefreshCw size={16} /></button>
            <button onClick={handleLogout} className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-red-400"><LogOut size={16} /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
        ) : (
          <>
            {managed.length > 0 && (
              <section className="mb-10">
                <h2 className="section-title flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green" />
                  Connected Servers ({managed.length})
                </h2>
                <ServerList guilds={managed} onSelect={handleSelect} />
              </section>
            )}
            {available.length > 0 && (
              <section>
                <h2 className="section-title flex items-center gap-2 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-dark-500" />
                  Available ({available.length})
                </h2>
                <ServerList guilds={available} onSelect={() => {}} />
              </section>
            )}
            {guilds.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">No servers found. Make sure you have administrator access.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

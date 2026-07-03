import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { api } from '../lib/api';
import { Spinner } from './ui/Spinner';

export default function Layout() {
  const { guildId } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [guildName, setGuildName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.me().then(data => {
      if (!data?.user) { navigate('/login'); return; }
      setUser(data.user);
      const g = data.user.guilds?.find(g => g.id === guildId);
      setGuildName(g?.name || '');
      setLoading(false);
    }).catch(() => navigate('/login'));
  }, [guildId, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-8 w-8" />
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
        <Header user={user} guildName={guildName} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

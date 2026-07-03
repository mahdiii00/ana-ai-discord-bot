import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import { useState } from 'react';

export default function Header({ user, guildName }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await api.auth.logout();
    navigate('/login');
  };

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : null;

  return (
    <header className="h-14 glass border-b flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        {guildName && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Server</span>
            <span className="text-sm font-medium text-gray-200">{guildName}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-1.5 hover:bg-dark-700 rounded-lg transition-colors">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blurple flex items-center justify-center">
              <User size={14} />
            </div>
          )}
          <span className="text-sm font-medium">{user?.username || 'User'}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 glass rounded-xl p-1.5 z-20 animate-fade-in">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut size={15} /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

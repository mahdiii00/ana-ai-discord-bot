import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Shield, Brain, ScrollText, Ticket, BarChart3,
  Archive, Users, ChevronLeft, Bot,
} from 'lucide-react';

const navItems = [
  { to: '', icon: LayoutDashboard, label: 'Overview' },
  { to: 'security', icon: Shield, label: 'Security' },
  { to: 'ai', icon: Brain, label: 'AI Config' },
  { to: 'logs', icon: ScrollText, label: 'Logs' },
  { to: 'tickets', icon: Ticket, label: 'Tickets' },
  { to: 'analytics', icon: BarChart3, label: 'Analytics' },
  { to: 'backups', icon: Archive, label: 'Backups' },
  { to: 'users', icon: Users, label: 'Users' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { guildId } = useParams();

  return (
    <aside className={`fixed left-0 top-0 h-full glass border-r z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex items-center justify-between h-14 px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Bot className="text-blurple" size={22} />
            <span className="font-bold text-sm">ana AI</span>
          </div>
        )}
        {collapsed && <Bot className="text-blurple mx-auto" size={22} />}
        <button onClick={onToggle} className={`p-1 hover:bg-dark-700 rounded-lg transition-colors ${collapsed ? 'mx-auto mt-1' : ''}`}>
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={`/dashboard/${guildId}/${item.to}`}
            end={item.to === ''}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blurple/10 text-blurple border border-blurple/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

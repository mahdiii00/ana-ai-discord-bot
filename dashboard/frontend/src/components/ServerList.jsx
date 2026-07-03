import { Server } from 'lucide-react';

export default function ServerList({ guilds, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {guilds.map(guild => (
        <button
          key={guild.id}
          onClick={() => onSelect(guild.id)}
          className="card-hover text-left group"
        >
          <div className="flex items-center gap-4">
            {guild.icon ? (
              <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt="" className="w-12 h-12 rounded-xl" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
                <Server size={22} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{guild.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {guild.hasBot ? 'Bot connected' : 'No bot'}
              </p>
            </div>
            {guild.hasBot && (
              <div className="w-2 h-2 rounded-full bg-green shrink-0" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

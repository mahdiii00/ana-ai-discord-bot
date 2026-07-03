export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <div className="relative" onClick={e => { if (!disabled) { e.preventDefault(); onChange(!checked); } }}>
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-green' : 'bg-dark-600'}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label && <span className="text-sm text-gray-300 select-none">{label}</span>}
    </label>
  );
}

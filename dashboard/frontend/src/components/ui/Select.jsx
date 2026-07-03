export function Select({ options, value, onChange, className = '', placeholder = 'Select...' }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} className={`input-field ${className}`}>
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

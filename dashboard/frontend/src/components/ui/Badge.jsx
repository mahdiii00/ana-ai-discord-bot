export function Badge({ children, variant = 'gray', className = '' }) {
  const variants = { green: 'badge-green', red: 'badge-red', yellow: 'badge-yellow', gray: 'badge-gray' };
  return <span className={`${variants[variant]} ${className}`}>{children}</span>;
}

export function Card({ children, className = '', hover = false, ...props }) {
  const cls = hover ? 'card-hover' : 'card';
  return <div className={`${cls} ${className}`} {...props}>{children}</div>;
}

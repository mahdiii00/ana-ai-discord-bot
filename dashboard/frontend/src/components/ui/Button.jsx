export function Button({ children, variant = 'primary', className = '', size = 'md', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'hover:bg-dark-700 text-gray-300 hover:text-gray-100 px-3 py-2 rounded-lg transition-all',
  };
  const sizes = { sm: 'text-sm px-3 py-1.5', md: 'px-5 py-2.5', lg: 'px-6 py-3 text-lg' };
  return (
    <button className={`${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

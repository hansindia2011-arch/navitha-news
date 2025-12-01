
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  small?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  small = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-md transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeStyles = small ? 'py-1 px-3 text-sm' : 'py-2 px-4 text-base';

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-gray-900',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400 focus:ring-offset-gray-900',
    outline: 'bg-transparent border border-gray-400 hover:border-blue-500 hover:text-blue-500 text-gray-700 focus:ring-blue-500 focus:ring-offset-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 focus:ring-offset-gray-900',
  };

  return (
    <button
      className={clsx(baseStyles, sizeStyles, variantStyles[variant], props.disabled && 'opacity-50 cursor-not-allowed', className)}
      {...props}
    >
      {children}
    </button>
  );
};
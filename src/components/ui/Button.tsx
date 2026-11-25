import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'outline';
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-3 py-1.5 rounded-md font-medium text-sm transition-colors cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-emerald-600 text-white hover:bg-emerald-700': variant === 'success',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'bg-amber-500 text-white hover:bg-amber-600': variant === 'warning',
          'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100':
            variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
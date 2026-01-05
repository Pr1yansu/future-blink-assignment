import { type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NodeCardProps {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  id?: string;
}

export function NodeCard({ children, className, selected, id }: NodeCardProps) {
  return (
    <div id={id} className={cn(
      "relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-indigo-200 group",
      selected && "ring-2 ring-indigo-500 ring-offset-2",
      className
    )}>
      {children}
    </div>
  );
}

interface NodeHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  iconClassName?: string;
}

export function NodeHeader({ icon, title, subtitle, action, className, iconClassName }: NodeHeaderProps) {
  return (
    <div className={cn("bg-gray-50/50 px-5 py-4 border-b border-gray-100 flex items-center justify-between backdrop-blur-sm", className)}>
      <div className="flex items-center gap-2.5">
        <div className={cn("p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-indigo-600 group-hover:scale-110 transition-transform duration-300", iconClassName)}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

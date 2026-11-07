import React from 'react';
import { PawPrint } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md',
  subtitle = "Clínica Estética & Banho e Tosa"
}) => {
  const iconSizes = {
    sm: "w-8 h-8 p-1.5",
    md: "w-11 h-11 p-2.5",
    lg: "w-14 h-14 p-3",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-600/25 ring-4 ring-blue-50 dark:ring-blue-950/40",
          iconSizes[size]
        )}>
          <PawPrint className="w-full h-full transform -rotate-12 fill-white/20 stroke-white stroke-[2.2]" />
        </div>
        
        <div className="text-left">
          <span className={cn(
            "font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5",
            titleSizes[size]
          )}>
            Elbima <span className="text-blue-600 dark:text-blue-400">Pet</span>
          </span>
          {subtitle && (
            <span className="block text-[11px] font-medium text-blue-700/80 dark:text-blue-400/90 uppercase tracking-wider -mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

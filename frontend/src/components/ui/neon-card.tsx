import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function NeonCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative group rounded-xl bg-[#0A0A0A]", className)}>
      <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 rounded-xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 rounded-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative h-full w-full bg-[#050505] rounded-xl flex flex-col z-10">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl z-0 pointer-events-none rounded-xl"></div>
        <div className="relative z-10 p-5 h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

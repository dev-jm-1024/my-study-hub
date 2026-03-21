import type { ReactNode, MouseEvent } from 'react';

interface GlassCardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function GlassCard({ children, hover = false, className = '', onClick }: GlassCardProps) {
  return (
    <div
      className={`glass-card${hover ? ' glass-card-hover' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`card ${hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

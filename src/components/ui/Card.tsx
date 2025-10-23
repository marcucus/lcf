import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export function Card({ children, className = '', hover = false, style }: CardProps) {
  return (
    <div
      className={`card ${hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

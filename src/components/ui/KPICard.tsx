import { ReactNode } from 'react';
import { Card } from './Card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
  subtitle?: string;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  icon,
  iconColor = 'text-accent',
  subtitle,
  loading = false,
}: KPICardProps) {
  return (
    <Card>
      <div className="flex items-center space-x-4">
        <div className={`p-3 bg-${iconColor.replace('text-', '')}/10 rounded-lg`}>
          <div className={`w-8 h-8 ${iconColor}`}>{icon}</div>
        </div>
        <div className="flex-1">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

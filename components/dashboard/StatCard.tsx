import { type ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary',
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn('mt-1 text-3xl font-bold', typeof value === 'number' && value === 0 && 'text-muted-foreground')}>
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
      {description && (
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
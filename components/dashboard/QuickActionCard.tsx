import Link from 'next/link';
import { type ComponentType } from 'react';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-primary">
        <span>Get Started</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
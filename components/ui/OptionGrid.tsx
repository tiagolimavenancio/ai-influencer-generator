import { type ComponentType } from 'react';
import { Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  emoji?: string;
}

interface OptionGridProps {
  options: Option[];
  selected: string;
  onSelect: (id: string) => void;
  title: string;
  icon: ComponentType<{ className?: string }>;
}

export function OptionGrid({
  options,
  selected,
  onSelect,
  title,
  icon: Icon,
}: OptionGridProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`group relative overflow-hidden rounded-lg border-2 p-4 transition-all hover:shadow-md ${
              selected === option.id
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="relative z-10">
              {option.emoji && (
                <div className="mb-2 text-2xl">{option.emoji}</div>
              )}
              <div
                className={`text-sm font-medium ${selected === option.id ? 'text-primary' : ''}`}
              >
                {option.label}
              </div>
              {selected === option.id && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
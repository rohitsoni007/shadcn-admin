
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchTriggerProps {
  onClick: () => void;
  variant?: 'button' | 'input';
  className?: string;
  placeholder?: string;
}

export function SearchTrigger({ 
  onClick, 
  variant = 'input', 
  className,
  placeholder = "Search..." 
}: SearchTriggerProps) {
  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn("relative", className)}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{placeholder}</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
        ⌘K
      </kbd>
    </button>
  );
}
import { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  Star, 
  Bookmark, 
  Filter,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,

} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useSearch } from '@/hooks/use-search';
import type { SearchResult, SearchResultType } from '@/types/search';
import { cn } from '@/lib/utils';
import React from 'react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeColors: Record<SearchResultType, string> = {
  page: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  setting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  action: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  widget: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  data: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const typeLabels: Record<SearchResultType, string> = {
  page: 'Page',
  user: 'User',
  setting: 'Setting',
  action: 'Action',
  widget: 'Widget',
  data: 'Data',
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    history,
    savedSearches,
    suggestions,
    navigateToResult,

    saveSearch,
    removeSavedSearch,
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);


  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setShowFilters(false);
    }
  }, [open, setQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleResultSelect = (result: SearchResult) => {
    navigateToResult(result);
    onOpenChange(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleSaveSearch = () => {
    if (query.trim()) {
      const name = `Search: ${query}`;
      saveSearch(name, query);
    }
  };

  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    
    results.forEach(result => {
      const category = result.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(result);
    });

    return groups;
  }, [results]);

  const hasResults = results.length > 0;
  const hasHistory = history.length > 0;
  const hasSavedSearches = savedSearches.length > 0;
  const hasSuggestions = suggestions.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Search pages, users, settings..."
          value={query}
          onValueChange={setQuery}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
        />
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-8 px-2",
              showFilters && "bg-accent"
            )}
          >
            <Filter className="h-3 w-3" />
          </Button>
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveSearch}
              className="h-8 px-2"
            >
              <Bookmark className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <CommandList className="max-h-[400px]">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Searching...
            </div>
          </div>
        )}

        {!isLoading && !query && (
          <>
            {hasSavedSearches && (
              <CommandGroup heading="Saved Searches">
                {savedSearches.slice(0, 3).map((saved) => (
                  <CommandItem
                    key={saved.id}
                    onSelect={() => handleSuggestionSelect(saved.query)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{saved.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSavedSearch(saved.id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasHistory && (
              <CommandGroup heading="Recent Searches">
                {history.slice(0, 5).map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSuggestionSelect(item.query)}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.query}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => handleSuggestionSelect('users')}>
                <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Search users</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('settings')}>
                <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Find settings</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('dashboard')}>
                <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Go to dashboard</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {!isLoading && query && !hasResults && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
              {hasSuggestions && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-2">Try these suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="h-6 text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CommandEmpty>
        )}

        {!isLoading && hasResults && (
          <>
            {Object.entries(groupedResults).map(([category, categoryResults]) => (
              <CommandGroup key={category} heading={category}>
                {categoryResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultSelect(result)}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {result.icon && (
                        <result.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", typeColors[result.type])}
                          >
                            {typeLabels[result.type]}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>

      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">⌘K</kbd> to search</span>
        </div>
        <div className="flex items-center gap-2">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </CommandDialog>
  );
}
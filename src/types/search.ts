export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: SearchResultType;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  category?: string;
  keywords?: string[];
}

export type SearchResultType = 
  | 'page' 
  | 'user' 
  | 'setting' 
  | 'action' 
  | 'widget' 
  | 'data';

export interface SearchCategory {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  results?: SearchResult[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  createdAt: Date;
}

export interface SearchFilters {
  types?: SearchResultType[];
  categories?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  history: SearchHistory[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error?: string;
  filters: SearchFilters;
}
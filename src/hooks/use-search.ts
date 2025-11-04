import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  SearchResult, 
  SearchHistory, 
  SavedSearch, 
  SearchFilters,
  SearchResultType 
} from '@/types/search';
import { 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Database,
  Home,
  Shield,
  Zap
} from 'lucide-react';

// Mock search data - in a real app this would come from an API
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Dashboard',
    description: 'Main dashboard with widgets and analytics',
    type: 'page',
    url: '/dashboard',
    icon: Home,
    category: 'Navigation',
    keywords: ['dashboard', 'home', 'overview', 'analytics']
  },
  {
    id: '2',
    title: 'Users Management',
    description: 'Manage users, roles, and permissions',
    type: 'page',
    url: '/users',
    icon: Users,
    category: 'Management',
    keywords: ['users', 'people', 'accounts', 'management']
  },
  {
    id: '3',
    title: 'Settings',
    description: 'Application settings and configuration',
    type: 'page',
    url: '/settings',
    icon: Settings,
    category: 'Configuration',
    keywords: ['settings', 'config', 'preferences', 'options']
  },
  {
    id: '4',
    title: 'John Doe',
    description: 'Administrator - john.doe@example.com',
    type: 'user',
    url: '/users/1',
    icon: Users,
    category: 'Users',
    keywords: ['john', 'doe', 'admin', 'administrator']
  },
  {
    id: '5',
    title: 'Jane Smith',
    description: 'Editor - jane.smith@example.com',
    type: 'user',
    url: '/users/2',
    icon: Users,
    category: 'Users',
    keywords: ['jane', 'smith', 'editor']
  },
  {
    id: '6',
    title: 'Theme Settings',
    description: 'Change appearance and theme preferences',
    type: 'setting',
    url: '/settings#theme',
    icon: Settings,
    category: 'Appearance',
    keywords: ['theme', 'dark', 'light', 'appearance', 'color']
  },
  {
    id: '7',
    title: 'User Permissions',
    description: 'Manage user roles and access control',
    type: 'setting',
    url: '/settings#permissions',
    icon: Shield,
    category: 'Security',
    keywords: ['permissions', 'roles', 'access', 'security']
  },
  {
    id: '8',
    title: 'Analytics Widget',
    description: 'View analytics and performance metrics',
    type: 'widget',
    url: '/dashboard#analytics',
    icon: BarChart3,
    category: 'Widgets',
    keywords: ['analytics', 'metrics', 'charts', 'data']
  },
  {
    id: '9',
    title: 'Export Data',
    description: 'Export data in various formats',
    type: 'action',
    url: '/export',
    icon: Database,
    category: 'Actions',
    keywords: ['export', 'download', 'csv', 'excel', 'data']
  },
  {
    id: '10',
    title: 'Quick Actions',
    description: 'Perform common tasks quickly',
    type: 'action',
    url: '/actions',
    icon: Zap,
    category: 'Actions',
    keywords: ['quick', 'actions', 'shortcuts', 'tasks']
  }
];

const SEARCH_HISTORY_KEY = 'search-history';
const SAVED_SEARCHES_KEY = 'saved-searches';
const MAX_HISTORY_ITEMS = 10;

export function useSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [filters, setFilters] = useState<SearchFilters>({});
  
  // Load history and saved searches from localStorage
  const [history, setHistory] = useState<SearchHistory[]>(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Persist saved searches to localStorage
  useEffect(() => {
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
  }, [savedSearches]);

  // Search function with debouncing
  const performSearch = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      let filteredResults = mockSearchResults.filter(result => {
        // Text matching
        const matchesText = 
          result.title.toLowerCase().includes(normalizedQuery) ||
          result.description?.toLowerCase().includes(normalizedQuery) ||
          result.keywords?.some(keyword => keyword.toLowerCase().includes(normalizedQuery));

        if (!matchesText) return false;

        // Type filtering
        if (searchFilters?.types?.length && !searchFilters.types.includes(result.type)) {
          return false;
        }

        // Category filtering
        if (searchFilters?.categories?.length && result.category && 
            !searchFilters.categories.includes(result.category)) {
          return false;
        }

        return true;
      });

      // Sort by relevance (exact matches first, then partial matches)
      filteredResults.sort((a, b) => {
        const aExact = a.title.toLowerCase() === normalizedQuery;
        const bExact = b.title.toLowerCase() === normalizedQuery;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStartsWith = a.title.toLowerCase().startsWith(normalizedQuery);
        const bStartsWith = b.title.toLowerCase().startsWith(normalizedQuery);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.title.localeCompare(b.title);
      });

      setResults(filteredResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query, filters);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, performSearch]);

  // Add to search history
  const addToHistory = useCallback((searchQuery: string, searchResults?: SearchResult[]) => {
    if (!searchQuery.trim()) return;

    const historyItem: SearchHistory = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date(),
      results: searchResults
    };

    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== searchQuery);
      const newHistory = [historyItem, ...filtered];
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  // Save search
  const saveSearch = useCallback((name: string, searchQuery: string, searchFilters?: SearchFilters) => {
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: searchQuery,
      filters: searchFilters,
      createdAt: new Date()
    };

    setSavedSearches(prev => [savedSearch, ...prev]);
  }, []);

  // Remove saved search
  const removeSavedSearch = useCallback((id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Navigate to result
  const navigateToResult = useCallback((result: SearchResult) => {
    addToHistory(query, results);
    navigate({ to: result.url });
  }, [query, results, addToHistory, navigate]);

  // Get suggestions based on current query
  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return history.slice(0, 5).map(h => h.query);
    }

    const normalizedQuery = query.toLowerCase();
    const matchingHistory = history
      .filter(h => h.query.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .map(h => h.query);

    const matchingKeywords = mockSearchResults
      .flatMap(result => result.keywords || [])
      .filter(keyword => keyword.toLowerCase().includes(normalizedQuery))
      .filter(keyword => keyword.toLowerCase() !== normalizedQuery)
      .slice(0, 5);

    return [...new Set([...matchingHistory, ...matchingKeywords])];
  }, [query, history]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    filters,
    setFilters,
    history,
    savedSearches,
    suggestions,
    performSearch,
    addToHistory,
    saveSearch,
    removeSavedSearch,
    clearHistory,
    navigateToResult
  };
}
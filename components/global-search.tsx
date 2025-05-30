"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, ArrowUp, ArrowDown, CornerDownLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { searchAnalytics } from "@/lib/search-analytics"
import { SearchFilters, type SearchFiltersType } from "@/components/search-filters"

interface SearchResult {
  id: string
  title: string
  description: string
  type: "bounty" | "category" | "activity"
  url: string
  metadata?: {
    reward?: number
    deadline?: string
    status?: string
    category?: string
  }
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
  hasMore: boolean
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFiltersType>({
    types: [],
    categories: [],
    status: [],
    dateRange: {},
    rewardRange: {}
  })
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Fetch available categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const categories = await response.json()
        setAvailableCategories(categories.map((cat: any) => cat.name || cat.title || cat))
      }
    } catch (error) {
      console.warn('Failed to fetch categories:', error)
    }
  }, [])

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      setIsLoading(false)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        query: searchQuery,
        limit: "10",
        includeInactive: "false"
      })

      // Add filter parameters
      if (filters.types.length > 0) {
        params.set('types', filters.types.join(','))
      } else {
        params.set('types', 'bounty,category')
      }

      if (filters.categories.length > 0) {
        params.set('categories', filters.categories.join(','))
      }

      if (filters.status.length > 0) {
        params.set('status', filters.status.join(','))
      }

      if (filters.rewardRange.min !== undefined) {
        params.set('minReward', filters.rewardRange.min.toString())
      }

      if (filters.rewardRange.max !== undefined) {
        params.set('maxReward', filters.rewardRange.max.toString())
      }

      const response = await fetch(`/api/search?${params.toString()}`, {
        cache: "no-store"
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Search failed: ${response.status}`)
      }

      const data: SearchResponse = await response.json()
      setResults(data.results)
      setSelectedIndex(0)
      
      // Track search analytics
      searchAnalytics.trackSearch(searchQuery, data.results.length)
    } catch (err) {
      console.error("Search error:", err)
      setError(err instanceof Error ? err.message : "Search failed")
      setResults([])
      
      // Track failed search
      searchAnalytics.trackSearch(searchQuery, 0)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Handle Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      
      if (e.key === "Escape") {
        setIsOpen(false)
        setQuery("")
        setSelectedIndex(0)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input and fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus()
      }
      if (availableCategories.length === 0) {
        fetchCategories()
      }
    }
  }, [isOpen, availableCategories.length, fetchCategories])

  // Debounced search with cleanup
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim()) {
      setIsLoading(true)
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 300) // 300ms debounce
    } else {
      setResults([])
      setSelectedIndex(0)
      setIsLoading(false)
      setError(null)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, performSearch])

  // Re-search when filters change
  useEffect(() => {
    if (query.trim()) {
      performSearch(query)
    }
  }, [filters, performSearch, query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }

  const handleSelect = (result: SearchResult) => {
    // Track result click analytics
    const position = results.findIndex(r => r.id === result.id)
    searchAnalytics.trackResultClick(query, {
      id: result.id,
      title: result.title,
      type: result.type
    }, position)
    
    router.push(result.url)
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(0)
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(0)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      
      {/* Search Modal */}
      <div className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 z-50">
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-border/20">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search bounties, pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-background/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

              {/* Search Filters */}
              <SearchFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableCategories={availableCategories}
              />

              {/* Error State */}
          {error && (
            <div className="px-4 py-8 text-center text-destructive">
              <X className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Search Error</p>
              <p className="text-xs mt-1 text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {!error && results.length > 0 && (
            <div ref={resultsRef} className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-background/20 transition-colors border-b border-border/10 last:border-b-0",
                    index === selectedIndex && "bg-background/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      result.type === "bounty" ? "bg-green-500" : "bg-blue-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {result.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {result.description}
                      </p>
                      {result.metadata && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {result.metadata.reward && (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              ${result.metadata.reward}
                            </span>
                          )}
                          {result.metadata.status && (
                            <span className={cn(
                              "px-2 py-0.5 rounded-full",
                              result.metadata.status === "active" 
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            )}>
                              {result.metadata.status}
                            </span>
                          )}
                          {result.metadata.category && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                              {result.metadata.category}
                            </span>
                          )}
                          {result.metadata.deadline && (
                            <span className="text-orange-600">
                              Due: {new Date(result.metadata.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground capitalize">
                        {result.type}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!error && !isLoading && query && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords or check spelling</p>
            </div>
          )}

          {/* Footer */}
          <div className="p-3 border-t border-border/20 bg-background/10">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background/20 rounded text-xs">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-background/20 rounded text-xs">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background/20 rounded text-xs">↵</kbd>
                  to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background/20 rounded text-xs">esc</kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
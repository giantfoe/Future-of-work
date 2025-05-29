"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SearchResult {
  id: string
  title: string
  description: string
  type: "bounty" | "page"
  url: string
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Mock search results - replace with actual search logic
  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "Design a Landing Page",
      description: "Create a modern landing page for our product",
      type: "bounty",
      url: "/bounties/1"
    },
    {
      id: "2",
      title: "Build React Component",
      description: "Develop a reusable React component library",
      type: "bounty",
      url: "/bounties/2"
    },
    {
      id: "3",
      title: "All Bounties",
      description: "Browse all available bounties",
      type: "page",
      url: "/bounties"
    },
    {
      id: "4",
      title: "Profile",
      description: "View and edit your profile",
      type: "page",
      url: "/profile"
    }
  ]

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

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle search
  useEffect(() => {
    if (query.trim()) {
      // Filter mock results based on query
      const filtered = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setSelectedIndex(0)
    } else {
      setResults([])
      setSelectedIndex(0)
    }
  }, [query])

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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-background/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
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
                      <p className="text-sm text-muted-foreground truncate">
                        {result.description}
                      </p>
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
          {query && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
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
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowUp, Search, X } from "lucide-react"
import MobileMenu from "@/components/mobile-menu"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/contexts/auth-context"


export default function Header() {
  // Define all available categories
  const categories = [
    { name: "Design", slug: "design" },
    { name: "Product", slug: "product" },
    { name: "Content Creation", slug: "content" },
    { name: "Engineering", slug: "engineering" },
  ]

  const pathname = usePathname()
  const router = useRouter()
  const isBountiesPage = pathname === "/bounties" || pathname.startsWith("/bounties?")
  const isAirtableBountiesPage = false

  // Search functionality removed as requested
  const [windowWidth, setWindowWidth] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)
  const [headerHeight, setHeaderHeight] = useState(0)

  const { user, isLoading: authLoading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("signup")

  // Header search state
  const [headerSearchExpanded, setHeaderSearchExpanded] = useState(false)
  const [headerSearchQuery, setHeaderSearchQuery] = useState("")
  const [headerSearchResults, setHeaderSearchResults] = useState<any[]>([])
  const headerSearchRef = useRef<HTMLDivElement>(null)
  const headerSearchInputRef = useRef<HTMLInputElement>(null)

  // Mock search results for header dropdown
  const mockSearchResults = [
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

  // Handle header search
  const handleHeaderSearch = (query: string) => {
    setHeaderSearchQuery(query)
    if (query.trim()) {
      const filtered = mockSearchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase())
      )
      setHeaderSearchResults(filtered)
    } else {
      setHeaderSearchResults([])
    }
  }

  const handleHeaderSearchSelect = (result: any) => {
    router.push(result.url)
    setHeaderSearchExpanded(false)
    setHeaderSearchQuery("")
    setHeaderSearchResults([])
  }

  const handleHeaderSearchToggle = () => {
    setHeaderSearchExpanded(!headerSearchExpanded)
    if (!headerSearchExpanded) {
      setTimeout(() => {
        if (headerSearchInputRef.current) {
          headerSearchInputRef.current.focus()
        }
      }, 300)
    } else {
      setHeaderSearchQuery("")
      setHeaderSearchResults([])
    }
  }

  // Close header search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerSearchExpanded && headerSearchRef.current && !headerSearchRef.current.contains(event.target as Node)) {
        setHeaderSearchExpanded(false)
        setHeaderSearchQuery("")
        setHeaderSearchResults([])
      }
    }

    if (headerSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [headerSearchExpanded])

  // Track window width for testing responsive behavior
  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth)
    setHeaderHeight(headerRef.current?.offsetHeight || 0)

    // Update width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setHeaderHeight(headerRef.current?.offsetHeight || 0)
    }

    // Handle scroll events
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show/hide scroll to top button
      if (currentScrollY > 500) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }

      // Add shadow to header when scrolled
      if (currentScrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Determine if we're on desktop (>= 1024px)
  const isDesktop = windowWidth >= 1024

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "bg-background/80 sticky top-0 z-30 transition-all duration-300",
          scrolled ? "border-b border-border shadow-sm backdrop-blur-md bg-background/60" : "border-b border-border",
        )}
      >
        <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 md:px-6 w-full">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu - Only visible on mobile (<1024px) and not on Bounties page */}
            <MobileMenu />

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Bounty Platform</span>
            </Link>
          </div>

          {/* Desktop Navigation - Only visible on desktop (>=1024px) */}
          {!isBountiesPage && !isAirtableBountiesPage && (
            <div className="hidden lg:flex items-center space-x-6 mx-8">
              <Link href="/bounties" className="text-sm font-medium hover:text-primary">
                All Bounties
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/bounties?category=${category.slug}`}
                  className="text-sm font-medium hover:text-primary px-2 py-1 rounded-full hover:bg-[hsl(var(--primary-hover))]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Right side - Search and Auth */}
          <div className="flex items-center gap-4">
            {/* Header Search - Desktop */}
            <div ref={headerSearchRef} className="hidden md:block relative">
              <div className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                headerSearchExpanded ? "w-80" : "w-auto"
              )}>
                {headerSearchExpanded ? (
                  <div className="relative w-full">
                    <div className="glass-card rounded-lg border border-border/20 bg-background/80 backdrop-blur-md">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                          ref={headerSearchInputRef}
                          type="text"
                          placeholder="Search bounties, pages..."
                          value={headerSearchQuery}
                          onChange={(e) => handleHeaderSearch(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setHeaderSearchExpanded(false)
                              setHeaderSearchQuery("")
                              setHeaderSearchResults([])
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setHeaderSearchExpanded(false)
                            setHeaderSearchQuery("")
                            setHeaderSearchResults([])
                          }}
                          className="h-6 w-6 p-0 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {headerSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg border border-border/20 bg-background/95 backdrop-blur-md shadow-lg z-50 max-h-80 overflow-y-auto">
                        {headerSearchResults.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => handleHeaderSearchSelect(result)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/10 last:border-b-0 focus:outline-none focus:bg-muted/50"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                result.type === "bounty" ? "bg-green-500" : "bg-blue-500"
                              )} />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">
                                  {result.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {result.description}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 capitalize">
                                  {result.type}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Trigger global search modal
                      const event = new KeyboardEvent('keydown', {
                        key: 'k',
                        metaKey: true,
                        bubbles: true
                      })
                      document.dispatchEvent(event)
                    }}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Search className="h-4 w-4" />
                    <span className="text-sm">Search</span>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Mobile Search Button */}
            <div ref={headerSearchRef} className="md:hidden relative">
              {headerSearchExpanded ? (
                <div className="absolute right-0 top-0 w-64 z-50">
                  <div className="glass-card rounded-lg border border-border/20 bg-background/80 backdrop-blur-md">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        ref={headerSearchInputRef}
                        type="text"
                        placeholder="Search..."
                        value={headerSearchQuery}
                        onChange={(e) => handleHeaderSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setHeaderSearchExpanded(false)
                            setHeaderSearchQuery("")
                            setHeaderSearchResults([])
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHeaderSearchExpanded(false)
                          setHeaderSearchQuery("")
                          setHeaderSearchResults([])
                        }}
                        className="h-6 w-6 p-0 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile Search Results Dropdown */}
                  {headerSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg border border-border/20 bg-background/95 backdrop-blur-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {headerSearchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleHeaderSearchSelect(result)}
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-b border-border/10 last:border-b-0 focus:outline-none focus:bg-muted/50"
                        >
                          <div className="flex items-start gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                              result.type === "bounty" ? "bg-green-500" : "bg-blue-500"
                            )} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs text-foreground truncate">
                                {result.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {result.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Trigger global search modal
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      bubbles: true
                    })
                    document.dispatchEvent(event)
                  }}
                  className="p-2"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
            {!authLoading && (
              <>
                {user ? (
                  <UserMenu />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAuthModalMode("login")
                        setAuthModalOpen(true)
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#5865F2] hover:bg-[#4752C4] neon-border"
                      onClick={() => {
                        setAuthModalMode("signup")
                        setAuthModalOpen(true)
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Debug info - Only visible in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-0 right-0 bg-foreground text-background p-2 text-xs z-50">
            Width: {windowWidth}px | {isDesktop ? "Desktop" : "Mobile"} View | Path: {pathname}
          </div>
        )}
      </header>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={cn(
          "fixed bottom-6 right-6 bg-foreground text-background rounded-full p-3 shadow-lg transition-all duration-300 z-40",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />
    </>
  )
}

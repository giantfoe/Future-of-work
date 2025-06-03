"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowUp, Search, X, Menu } from "lucide-react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          "header-glass sticky top-0 z-30",
          scrolled ? "scrolled" : "",
        )}
      >
        <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-2 sm:px-4 md:px-6 w-full min-w-0">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 burger-menu-button"
            >
              <div className="burger-icon">
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
              </div>
            </Button>
            
            <Link href="/" className="flex items-center gap-2">
              <span className="text-sm sm:text-lg md:text-xl font-bold header-logo truncate">Bounty Platform</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isAirtableBountiesPage && (
            <div className="hidden md:flex items-center space-x-2 mx-8">
              <Link 
                href="/bounties" 
                className={cn(
                  "nav-link whitespace-nowrap",
                  pathname === "/bounties" || pathname.startsWith("/bounties") 
                    ? "bg-white/20 text-white" 
                    : ""
                )}
              >
                All
              </Link>
              {categories.map((category) => {
                const isActive = pathname.includes(`category=${category.slug}`)
                return (
                  <Link
                    key={category.slug}
                    href={`/bounties?category=${category.slug}`}
                    className={cn(
                      "nav-link whitespace-nowrap",
                      isActive ? "bg-white/20 text-white" : ""
                    )}
                  >
                    {category.name === "Content Creation" ? "Content" : category.name}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right side - Search and Auth */}
          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            {/* Header Search - Desktop */}
            <div ref={headerSearchRef} className="hidden md:block relative">
              <div className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                headerSearchExpanded ? "w-80" : "w-auto"
              )}>
                {headerSearchExpanded ? (
                  <div className="relative w-full">
                    <div className="header-search expanded">
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
                      <div className="absolute top-full left-0 right-0 mt-2 search-dropdown z-50 max-h-80 overflow-y-auto">
                        {headerSearchResults.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => handleHeaderSearchSelect(result)}
                            className="w-full text-left px-4 py-3 search-result-item border-b border-border/10 last:border-b-0 focus:outline-none"
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
                    className="header-search flex items-center gap-2 text-muted-foreground hover:text-foreground border-none"
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
                <div className="absolute right-0 top-0 w-[calc(100vw-2rem)] max-w-sm z-50">
                  <div className="header-search">
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
                    <div className="absolute top-full left-0 right-0 mt-2 search-dropdown z-50 max-h-60 overflow-y-auto">
                      {headerSearchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleHeaderSearchSelect(result)}
                          className="w-full text-left px-3 py-2 search-result-item border-b border-border/10 last:border-b-0 focus:outline-none"
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
                  className="header-search-mobile p-2 border-none bg-white/10 hover:bg-white/20"
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
                      className="auth-button-login border-none text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
                    >
                      Login
                    </Button>
                    <Button
                      size="sm"
                      className="auth-button-signup border-none text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
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
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="mobile-menu-overlay fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="mobile-menu-sidebar fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-black/95 backdrop-blur-md border-r border-white/10 z-50 md:hidden">
            <div className="p-6">
              {/* Close Button */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Navigation Links */}
              <nav className="space-y-4">
                <Link 
                  href="/bounties"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "mobile-menu-item block px-4 py-3 rounded-lg text-white font-medium transition-colors",
                    pathname === "/bounties" || pathname.startsWith("/bounties") 
                      ? "bg-white/20" 
                      : "hover:bg-white/10"
                  )}
                >
                  All Bounties
                </Link>
                
                {categories.map((category) => {
                  const isActive = pathname.includes(`category=${category.slug}`)
                  return (
                    <Link
                      key={category.slug}
                      href={`/bounties?category=${category.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "mobile-menu-item block px-4 py-3 rounded-lg text-white font-medium transition-colors",
                        isActive ? "bg-white/20" : "hover:bg-white/10"
                      )}
                    >
                      {category.name}
                    </Link>
                  )
                })}
                
                <div className="border-t border-white/10 pt-4 mt-6">
                  <Link 
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-menu-item block px-4 py-3 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    Home
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}

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

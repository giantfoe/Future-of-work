"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowUp } from "lucide-react"
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
          "bg-white sticky top-0 z-30 transition-shadow duration-300",
          scrolled ? "border-b shadow-sm" : "border-b",
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
                  className="text-sm font-medium hover:text-primary px-2 py-1 rounded-full hover:bg-gray-100"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Right side spacer - Search removed as requested */}
          <div className="flex items-center gap-4">
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
                      className="bg-[#5865F2] hover:bg-[#4752C4]"
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
          <div className="fixed bottom-0 right-0 bg-black text-white p-2 text-xs z-50">
            Width: {windowWidth}px | {isDesktop ? "Desktop" : "Mobile"} View | Path: {pathname}
          </div>
        )}
      </header>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={cn(
          "fixed bottom-6 right-6 bg-black text-white rounded-full p-3 shadow-lg transition-all duration-300 z-40",
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

"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on the bounties page to show category filters
  const isBountiesPage = pathname === "/bounties" || pathname.startsWith("/bounties?")

  // Simple navigation for non-bounties pages
  const navItems = [
    { name: "Home", href: "/" },
    { name: "All Bounties", href: "/bounties" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Activity", href: "/activity" }
  ]

  // Categories for bounties page
  const categories = [
    { name: "All", slug: "", href: "/bounties" },
    { name: "Design", slug: "design", href: "/bounties?category=design" },
    { name: "Product", slug: "product", href: "/bounties?category=product" },
    { name: "Content Creation", slug: "content", href: "/bounties?category=content" },
    { name: "Engineering", slug: "engineering", href: "/bounties?category=engineering" },
  ]

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Get current category from URL
  const getCurrentCategory = () => {
    if (pathname === "/bounties") return ""
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("category") || ""
  }

  const currentCategory = typeof window !== "undefined" ? getCurrentCategory() : ""

  // If we're on bounties page, show horizontal category filters instead
  if (isBountiesPage) {
    return (
      <div className="lg:hidden w-full">
        {/* Horizontal scrollable category filters */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-4 py-3">
          {categories.map((category) => {
            const isActive = currentCategory === category.slug
            return (
              <Link
                key={category.slug}
                href={category.href}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  "border border-white/20 backdrop-blur-sm",
                  isActive
                    ? "bg-white text-black border-white"
                    : "bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
                )}
              >
                {category.name}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Simple hamburger menu for other pages
  return (
    <div className="lg:hidden">
      {/* Simple hamburger button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "bg-white/10 border border-white/20 backdrop-blur-sm",
          "hover:bg-white/20 text-white"
        )}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Simple dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={closeMenu}
          />
          
          {/* Simple dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 z-50">
            <div 
              className={cn(
                "bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl",
                "shadow-xl p-4 space-y-2"
              )}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-white hover:bg-white/10",
                    "transition-colors duration-200 text-sm font-medium"
                  )}
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

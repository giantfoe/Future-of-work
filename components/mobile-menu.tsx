"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on the Explore Bounties page
  const isExploreBountiesPage = pathname === "/bounties" || pathname.startsWith("/bounties?")

  // Don't render the menu on the Explore Bounties page
  if (isExploreBountiesPage) {
    return null
  }

  // Navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "All Bounties", href: "/bounties" },
  ]

  // Categories
  const categories = [
    { name: "Design", slug: "design" },
    { name: "Product", slug: "product" },
    { name: "Content Creation", slug: "content" },
    { name: "Engineering", slug: "engineering" },
  ]

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      {/* Hamburger Button - Absolutely Positioned to Ensure Clickability */}
      <button
        onClick={toggleMenu}
        className="mobile-menu-button relative z-50 p-2 text-white hover:text-white focus:outline-none"
        style={{ touchAction: "manipulation" }}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop - Only visible when menu is open */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={closeMenu} aria-hidden="true" />}

      {/* Drawer - Slides in from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(96, 165, 250, 0.15)',
          borderLeft: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 32px rgba(96, 165, 250, 0.1)'
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white header-logo">Navigation</h2>
            <button
              onClick={closeMenu}
              className="mobile-menu-button p-2 text-white hover:text-white focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Main Navigation</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="nav-link block w-full text-left"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/bounties?category=${category.slug}`}
                      className="nav-link block w-full text-left"
                      onClick={closeMenu}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

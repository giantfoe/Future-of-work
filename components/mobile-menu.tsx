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
        className="relative z-50 p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
        style={{ touchAction: "manipulation" }}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop - Only visible when menu is open */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMenu} aria-hidden="true" />}

      {/* Drawer - Slides in from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Navigation</h2>
            <button
              onClick={closeMenu}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Main Navigation</h3>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500">Categories</h3>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/bounties?category=${category.slug}`}
                      className="block px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
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

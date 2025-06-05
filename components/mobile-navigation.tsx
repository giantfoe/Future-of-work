"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useBreakpoint } from "@/hooks/use-breakpoint"

export function MobileNavigation() {
  const pathname = usePathname()
  const { isTablet, isMobile } = useBreakpoint()

  const categories = [
    { name: "Design", slug: "design" },
    { name: "Product", slug: "product" },
    { name: "Content Creation", slug: "content" },
    { name: "Engineering", slug: "engineering" },
  ]

  const mainLinks = [
    { name: "Home", href: "/" },
    { name: "All Bounties", href: "/bounties" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Activity", href: "/activity" },
  ]

  // Show navigation for mobile and tablet, but hide on desktop
  if (!isMobile && !isTablet) return null

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden lg:hidden focus:outline-none" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className={`${isTablet ? 'w-[400px]' : 'w-[300px]'} sm:w-[350px] p-0 overflow-y-auto`}
      >
        <div className="p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-left text-xl font-bold">Bounty Platform</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">Main Navigation</h3>
              <nav className={`flex flex-col ${isTablet ? 'space-y-2' : 'space-y-1'}`}>
                {mainLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center ${isTablet ? 'px-4 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md ${
                        pathname === link.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500">Categories</h3>
              <nav className={`flex flex-col ${isTablet ? 'space-y-2' : 'space-y-1'}`}>
                {categories.map((category) => (
                  <SheetClose asChild key={category.slug}>
                    <Link
                      href={`/bounties?category=${category.slug}`}
                      className={`flex items-center ${isTablet ? 'px-4 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900`}
                    >
                      {category.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

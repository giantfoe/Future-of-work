"use client"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"

export default function MobileNav() {
  // Navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "All Bounties", href: "/bounties" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Activity", href: "/activity" },
  ]

  // Categories
  const categories = [
    { name: "Design", slug: "design" },
    { name: "Product", slug: "product" },
    { name: "Content Creation", slug: "content" },
    { name: "Engineering", slug: "engineering" },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link href={item.href} className="px-2 py-1 text-sm hover:underline">
                  {item.name}
                </Link>
              </SheetClose>
            ))}

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Categories</h3>
              {categories.map((category) => (
                <SheetClose asChild key={category.slug}>
                  <Link
                    href={`/bounties?category=${category.slug}`}
                    className="block px-2 py-1 text-sm hover:underline"
                  >
                    {category.name}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

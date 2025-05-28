"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationNavProps {
  currentPage: number
  totalPages: number
  basePath: string
  className?: string
}

export function PaginationNav({ currentPage, totalPages, basePath, className }: PaginationNavProps) {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5 // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always include page 1
      pages.push(1)

      // Calculate start and end of the middle section
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = 4
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3
      }

      // Add ellipsis after page 1 if needed
      if (start > 2) {
        pages.push("...")
      }

      // Add the middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis before the last page if needed
      if (end < totalPages - 1) {
        pages.push("...")
      }

      // Always include the last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className={cn("flex items-center justify-center space-x-2", className)} aria-label="Pagination">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 px-2.5"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
      >
        {currentPage !== 1 ? (
          <Link href={`${basePath}/${currentPage - 1}`} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </>
        )}
      </Button>

      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 text-sm",
                currentPage === page ? "bg-primary text-primary-foreground" : "text-gray-600",
              )}
              asChild={currentPage !== page}
            >
              {currentPage !== page ? <Link href={`${basePath}/${page}`}>{page}</Link> : <span>{page}</span>}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 px-2.5"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
      >
        {currentPage !== totalPages ? (
          <Link href={`${basePath}/${currentPage + 1}`} className="flex items-center gap-1">
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </nav>
  )
}

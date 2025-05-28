"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/use-categories"

interface MobileFiltersProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedCategories: string[]
  setSelectedCategories: (value: string[]) => void
  rewardRange: number[]
  setRewardRange: (value: number[]) => void
  statusOpen: boolean
  setStatusOpen: (value: boolean) => void
  statusInProgress: boolean
  setStatusInProgress: (value: boolean) => void
  statusCompleted: boolean
  setStatusCompleted: (value: boolean) => void
  sortBy: string
  setSortBy: (value: string) => void
  resetFilters: () => void
  minReward: number
  maxReward: number
  activeFilters: number
  categoryCounts: Record<string, number>
}

// Format currency for display
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function MobileFilters({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  rewardRange,
  setRewardRange,
  statusOpen,
  setStatusOpen,
  statusInProgress,
  setStatusInProgress,
  statusCompleted,
  setStatusCompleted,
  sortBy,
  setSortBy,
  resetFilters,
  minReward,
  maxReward,
  activeFilters,
  categoryCounts,
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false)
  const { categories, loading: categoriesLoading } = useCategories()
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isFilterSticky, setIsFilterSticky] = useState(false)

  // Track scroll position for filter preview visibility
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY
      setScrollPosition(position)

      // Make filter preview sticky when scrolled past a certain point
      if (position > 100) {
        setIsFilterSticky(true)
      } else {
        setIsFilterSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleApplyFilters = () => {
    setOpen(false)
  }

  // Create a summary of active filters for preview
  const getFilterSummary = () => {
    const parts = []

    if (selectedCategories.length > 0) {
      parts.push(`${selectedCategories.length} ${selectedCategories.length === 1 ? "category" : "categories"}`)
    }

    if (rewardRange[0] > minReward || rewardRange[1] < maxReward) {
      parts.push(`${formatCurrency(rewardRange[0])} - ${formatCurrency(rewardRange[1])}`)
    }

    const statusCount = [statusOpen, statusInProgress, statusCompleted].filter(Boolean).length
    if (statusCount > 0) {
      parts.push(`${statusCount} ${statusCount === 1 ? "status" : "statuses"}`)
    }

    if (sortBy !== "newest") {
      parts.push(`Sorted by ${sortBy.toLowerCase()}`)
    }

    return parts.join(", ")
  }

  const filterSummary = getFilterSummary()

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (category === "content-creation") return "Content Creation"
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="lg:hidden mb-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full flex items-center justify-between transition-all duration-300",
              isFilterSticky ? "sticky top-16 z-20 bg-white shadow-md" : "",
            )}
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <span>Filters {activeFilters > 0 && `(${activeFilters})`}</span>
            </div>
            {activeFilters > 0 && (
              <span className="text-xs text-gray-500 truncate max-w-[200px] text-right">{filterSummary}</span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow down bounties based on your preferences</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-8 overflow-y-auto flex-grow">
            <div className="space-y-4">
              <h2 className="font-medium">Search</h2>
              <Input
                placeholder="Search bounties..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h2 className="font-medium">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categoriesLoading ? (
                  <div className="text-sm text-gray-500">Loading categories...</div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.normalized}
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat.normalized)
                            ? prev.filter((c) => c !== cat.normalized)
                            : [...prev, cat.normalized],
                        )
                      }}
                      className={cn(
                        "px-2.5 py-1 text-sm font-medium rounded-full transition-all duration-200 border flex items-center",
                        selectedCategories.includes(cat.normalized)
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-gradient-to-b from-white to-gray-50 text-gray-700 border-gray-200 shadow-sm hover:shadow hover:border-gray-300",
                      )}
                    >
                      <span>{cat.original}</span>
                      <span
                        className={cn(
                          "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                          selectedCategories.includes(cat.normalized)
                            ? "bg-white bg-opacity-20 text-white"
                            : "bg-gray-100 text-gray-700 border border-gray-200",
                        )}
                      >
                        {categoryCounts[cat.normalized] || 0}
                      </span>
                    </button>
                  ))
                )}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className={cn(
                      "px-2.5 py-1 text-sm font-medium rounded-full",
                      "bg-gradient-to-b from-white to-gray-50",
                      "text-gray-700 border border-gray-200",
                      "shadow-sm hover:shadow hover:border-gray-300 transition-all duration-200",
                      "flex items-center",
                    )}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium">Reward Range</h2>
              <Slider
                value={rewardRange}
                onValueChange={setRewardRange}
                min={minReward}
                max={maxReward}
                step={10}
                className="py-4 transition-all duration-200 ease-in-out"
              />
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 font-medium transition-all duration-200">
                  {formatCurrency(rewardRange[0])}
                </span>
                <span className="text-sm text-gray-700 font-medium transition-all duration-200">
                  {formatCurrency(rewardRange[1])}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium">Status</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobile-open"
                    checked={statusOpen}
                    onCheckedChange={(checked) => setStatusOpen(checked as boolean)}
                  />
                  <label
                    htmlFor="mobile-open"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Open
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobile-in-progress"
                    checked={statusInProgress}
                    onCheckedChange={(checked) => setStatusInProgress(checked as boolean)}
                  />
                  <label
                    htmlFor="mobile-in-progress"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In Review
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobile-completed"
                    checked={statusCompleted}
                    onCheckedChange={(checked) => setStatusCompleted(checked as boolean)}
                  />
                  <label
                    htmlFor="mobile-completed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Closed
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium">Sort By</h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Reward</SelectItem>
                  <SelectItem value="lowest">Lowest Reward</SelectItem>
                  <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add extra padding at the bottom to ensure content isn't hidden behind the fixed buttons */}
            <div className="h-20"></div>
          </div>

          {/* Fixed position buttons at the bottom */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2 mt-auto">
            <Button variant="outline" className="flex-1" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" /> Reset
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Filter Preview - Shows active filters on mobile */}
      {activeFilters > 0 && (
        <div
          className={cn(
            "mt-3 flex flex-wrap gap-2 transition-all duration-300",
            isFilterSticky ? "sticky top-[calc(4rem+1px)] z-20 bg-white pt-3 pb-3 -mt-0 border-b shadow-sm" : "",
          )}
        >
          {selectedCategories.map((category) => (
            <div
              key={category}
              className="bg-black text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center"
            >
              {formatCategoryName(category)}
              <button
                onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
                className="ml-1.5 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {(rewardRange[0] > minReward || rewardRange[1] < maxReward) && (
            <div className="bg-gray-700 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {formatCurrency(rewardRange[0])} - {formatCurrency(rewardRange[1])}
            </div>
          )}

          {statusOpen && (
            <div className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
              Open
              <button
                onClick={() => setStatusOpen(false)}
                className="ml-1.5 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {statusInProgress && (
            <div className="bg-amber-600 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
              In Review
              <button
                onClick={() => setStatusInProgress(false)}
                className="ml-1.5 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {statusCompleted && (
            <div className="bg-gray-600 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
              Closed
              <button
                onClick={() => setStatusCompleted(false)}
                className="ml-1.5 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {sortBy !== "newest" && (
            <div className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">Sorted: {sortBy}</div>
          )}

          <button
            onClick={resetFilters}
            className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center hover:bg-gray-300"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}

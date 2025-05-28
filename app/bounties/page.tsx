"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import BountyCard from "@/components/bounty-card"
import MobileFilters from "./mobile"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Bounty } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { parseCategories } from "@/components/category-tag"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/use-categories"

// Skeleton component for a single bounty card
function BountyCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-white h-[460px] flex flex-col">
      <div className="p-6 flex-1">
        <div className="mb-4">
          <Skeleton className="h-6 w-16 mb-3 rounded-full" />
          <Skeleton className="h-7 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="space-y-2 mt-4">
          <Skeleton className="h-5 w-24" />
          <div className="mt-3">
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

// Count bounties per category
const getCategoryCounts = (bounties: Bounty[]) => {
  const counts: Record<string, number> = {}

  bounties.forEach((bounty) => {
    const categories = parseCategories(bounty.category)
    categories.forEach((category) => {
      // Normalize category name for consistent counting
      const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-")
      counts[normalizedCategory] = (counts[normalizedCategory] || 0) + 1
    })
  })

  return counts
}

// Category filter button component - Updated to match CategoryTag styling
function CategoryFilterButton({
  category,
  isSelected,
  onClick,
  count,
}: {
  category: { original: string; normalized: string }
  isSelected: boolean
  onClick: () => void
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 text-sm font-medium rounded-full transition-all duration-200 border flex items-center",
        isSelected
          ? "bg-black text-white border-black shadow-md"
          : "bg-gradient-to-b from-white to-gray-50 text-gray-700 border-gray-200 shadow-sm hover:shadow hover:border-gray-300",
      )}
    >
      <span>{category.original}</span>
      <span
        className={cn(
          "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
          isSelected ? "bg-white bg-opacity-20 text-white" : "bg-gray-100 text-gray-700 border border-gray-200",
        )}
      >
        {count}
      </span>
    </button>
  )
}

// Update the MobileFilters props interface to include categoryCounts
interface MobileFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  rewardRange: number[]
  setRewardRange: (range: number[]) => void
  statusOpen: boolean
  setStatusOpen: (open: boolean) => void
  statusInProgress: boolean
  setStatusInProgress: (inProgress: boolean) => void
  statusCompleted: boolean
  setStatusCompleted: (completed: boolean) => void
  sortBy: string
  setSortBy: (sortBy: string) => void
  resetFilters: () => void
  minReward: number
  maxReward: number
  activeFilters: number
  categoryCounts: Record<string, number>
}

export default function BountiesPage() {
  // State for all bounties and filtered bounties
  const [allBounties, setAllBounties] = useState<Bounty[]>([])
  const [filteredBounties, setFilteredBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [headerHeight, setHeaderHeight] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Get dynamic categories from Airtable
  const { categories, loading: categoriesLoading } = useCategories()

  // Filter states - all initialized as unselected/neutral
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [rewardRange, setRewardRange] = useState<number[]>([0, 5000])
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusInProgress, setStatusInProgress] = useState(false)
  const [statusCompleted, setStatusCompleted] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [activeFilters, setActiveFilters] = useState(0)

  // Min and max reward values
  const [minReward, setMinReward] = useState(0)
  const [maxReward, setMaxReward] = useState(5000)

  // In the BountiesPage component, add:
  const categoryCounts = useMemo(() => {
    return getCategoryCounts(allBounties)
  }, [allBounties])

  // Get header height for proper sticky positioning
  useEffect(() => {
    // Get header height for proper sticky positioning
    const header = document.querySelector("header")
    if (header) {
      setHeaderHeight(header.offsetHeight)
    }

    // Update on resize
    const handleResize = () => {
      const header = document.querySelector("header")
      if (header) {
        setHeaderHeight(header.offsetHeight)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Fetch bounties on component mount
  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const response = await fetch("/api/bounties")
        const data = await response.json()

        // Normalize data to ensure consistent format
        const normalizedData = data.map((bounty: Bounty) => ({
          ...bounty,
          // Ensure category is properly formatted
          category: bounty.category || "uncategorized",
        }))

        setAllBounties(normalizedData)
        setFilteredBounties(normalizedData)

        // Set min and max reward values based on actual data
        if (normalizedData.length) {
          const max = Math.max(...normalizedData.map((bounty: Bounty) => bounty.reward || 0))
          setMinReward(0) // Always keep minimum at 0
          // Round max to nearest 10 and add a small buffer
          const roundedMax = Math.ceil(max / 10) * 10 + 50
          setMaxReward(roundedMax > 0 ? roundedMax : 5000)
          setRewardRange([0, roundedMax > 0 ? roundedMax : 5000]) // Start with full range but minimum at 0
        }

        // Check URL parameters for initial filters
        const urlParams = new URLSearchParams(window.location.search)
        const categoryParam = urlParams.get("category")
        const searchParam = urlParams.get("search")

        if (categoryParam) {
          setSelectedCategories([categoryParam.toLowerCase().replace(/\s+/g, "-")])
        }

        if (searchParam) {
          setSearchQuery(searchParam)
        }

        // Simulate a slight delay to show loading state even on fast connections
        setTimeout(() => {
          setLoading(false)
        }, 300)
      } catch (error) {
        console.error("Error fetching bounties:", error)
        setLoading(false)
      }
    }

    fetchBounties()
  }, [])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedCategories, rewardRange, statusOpen, statusInProgress, statusCompleted, sortBy])

  // Count active filters for badge display
  useEffect(() => {
    let count = 0
    if (searchQuery) count++
    if (selectedCategories.length > 0) count++
    if (rewardRange[0] > 0 || rewardRange[1] < maxReward) count++
    if (statusOpen || statusInProgress || statusCompleted) count++
    if (sortBy !== "newest") count++
    setActiveFilters(count)
  }, [
    searchQuery,
    selectedCategories,
    rewardRange,
    statusOpen,
    statusInProgress,
    statusCompleted,
    sortBy,
    minReward,
    maxReward,
  ])

  // Filter logic
  const applyFilters = () => {
    if (!allBounties.length) return

    let result = [...allBounties]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (bounty) =>
          bounty.title?.toLowerCase().includes(query) ||
          false ||
          bounty.description?.toLowerCase().includes(query) ||
          false,
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((bounty) => {
        // Parse categories into an array
        const bountyCategories = parseCategories(bounty.category).map((cat) => cat.toLowerCase().replace(/\s+/g, "-"))
        // Check if any of the selected categories match
        return selectedCategories.some((selectedCat) => bountyCategories.includes(selectedCat))
      })
    }

    // Apply reward range filter - show bounties within the selected range
    result = result.filter((bounty) => {
      const reward = bounty.reward || 0
      return reward >= rewardRange[0] && reward <= rewardRange[1]
    })

    // Apply status filters - if none selected, show all
    if (statusOpen || statusInProgress || statusCompleted) {
      result = result.filter((bounty) => {
        // Get the status and ensure it's a string
        const status = String(bounty.status || "open").toLowerCase()

        // Log the status for debugging
        console.log(`Filtering bounty: ${bounty.title}, Status: ${status}`)

        // Check if the status matches any of the selected filters
        if (statusOpen && status === "open") {
          return true
        }

        if (statusInProgress && status === "in-progress") {
          return true
        }

        if (statusCompleted && (status === "closed" || status === "completed")) {
          return true
        }

        return false
      })
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        // Assuming newer bounties have higher IDs for this demo
        result = result.sort((a, b) => {
          const idA = typeof a.id === "string" ? Number.parseInt(a.id.replace(/\D/g, "")) || 0 : 0
          const idB = typeof b.id === "string" ? Number.parseInt(a.id.replace(/\D/g, "")) || 0 : 0
          return idB - idA
        })
        break
      case "oldest":
        result = result.sort((a, b) => {
          const idA = typeof a.id === "string" ? Number.parseInt(a.id.replace(/\D/g, "")) || 0 : 0
          const idB = typeof b.id === "string" ? Number.parseInt(a.id.replace(/\D/g, "")) || 0 : 0
          return idA - idB
        })
        break
      case "highest":
        result = result.sort((a, b) => (b.reward || 0) - (a.reward || 0))
        break
      case "lowest":
        result = result.sort((a, b) => (a.reward || 0) - (b.reward || 0))
        break
      case "deadline":
        result = result.sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline).getTime() : Date.now()
          const dateB = b.deadline ? new Date(b.deadline).getTime() : Date.now()
          return dateA - dateB
        })
        break
      default:
        break
    }

    setFilteredBounties(result)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setRewardRange([minReward, maxReward])
    setStatusOpen(false)
    setStatusInProgress(false)
    setStatusCompleted(false)
    setSortBy("newest")
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Create an array for skeleton cards
  const skeletonCards = Array.from({ length: 6 }, (_, i) => i)

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Explore Bounties</h1>

          {activeFilters > 0 && (
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-2">
                {activeFilters} {activeFilters === 1 ? "filter" : "filters"} active
              </Badge>
              <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center">
                <X className="h-4 w-4 mr-1" /> Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        <MobileFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          rewardRange={rewardRange}
          setRewardRange={setRewardRange}
          statusOpen={statusOpen}
          setStatusOpen={setStatusOpen}
          statusInProgress={statusInProgress}
          setStatusInProgress={setStatusInProgress}
          statusCompleted={statusCompleted}
          setSortBy={setSortBy}
          sortBy={sortBy}
          resetFilters={resetFilters}
          minReward={minReward}
          maxReward={maxReward}
          activeFilters={activeFilters}
          categoryCounts={categoryCounts}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div
            ref={sidebarRef}
            className="space-y-8 hidden lg:block w-full"
            style={{
              position: "sticky",
              top: `${headerHeight + 16}px`,
              height: "fit-content",
              maxHeight: `calc(100vh - ${headerHeight + 32}px)`,
              overflowY: "auto",
              overflowX: "hidden", // Changed from "visible" to "hidden"
            }}
          >
            <div className="space-y-4">
              <h2 className="font-medium">Search</h2>
              <Input
                placeholder="Search bounties..."
                className="w-full hover:border-gray-400 transition-colors"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="space-y-4">
              <h2 className="font-medium">Categories</h2>
              {categoriesLoading ? (
                <div className="py-2 text-sm text-gray-500">Loading categories...</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <CategoryFilterButton
                      key={cat.normalized}
                      category={cat}
                      isSelected={selectedCategories.includes(cat.normalized)}
                      onClick={() => toggleCategory(cat.normalized)}
                      count={categoryCounts[cat.normalized] || 0}
                    />
                  ))}
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
              )}
            </div>

            <div className="space-y-4">
              <h2 className="font-medium">Reward Range</h2>
              <div className="pt-6 pb-2">
                <Slider
                  value={rewardRange}
                  onValueChange={setRewardRange}
                  min={0}
                  max={maxReward}
                  step={10} // Changed from 100 to 10 for smoother increments
                  className="relative z-0 transition-all duration-200 ease-in-out"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-medium text-gray-700 transition-all duration-200">
                    {formatCurrency(rewardRange[0])}
                  </span>
                  <span className="text-sm font-medium text-gray-700 transition-all duration-200">
                    {formatCurrency(rewardRange[1])}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center transition-all duration-200">
                  {rewardRange[0] === 0 && rewardRange[1] === maxReward
                    ? "Showing all rewards"
                    : `Showing rewards between ${formatCurrency(rewardRange[0])} and ${formatCurrency(rewardRange[1])}`}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium">Status</h2>
              <div className="space-y-2">
                <label
                  htmlFor="open"
                  className="flex items-center space-x-2 w-full hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
                >
                  <Checkbox
                    id="open"
                    checked={statusOpen}
                    onCheckedChange={(checked) => setStatusOpen(checked as boolean)}
                  />
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow">
                    Open
                  </span>
                </label>

                <label
                  htmlFor="in-progress"
                  className="flex items-center space-x-2 w-full hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
                >
                  <Checkbox
                    id="in-progress"
                    checked={statusInProgress}
                    onCheckedChange={(checked) => setStatusInProgress(checked as boolean)}
                  />
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow">
                    In Review
                  </span>
                </label>

                <label
                  htmlFor="completed"
                  className="flex items-center space-x-2 w-full hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
                >
                  <Checkbox
                    id="completed"
                    checked={statusCompleted}
                    onCheckedChange={(checked) => setStatusCompleted(checked as boolean)}
                  />
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow">
                    Closed
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4 relative">
              <h2 className="font-medium">Sort By</h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="z-50 w-[var(--radix-select-trigger-width)] max-w-full">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Reward</SelectItem>
                  <SelectItem value="lowest">Lowest Reward</SelectItem>
                  <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full hover:bg-gray-800 transition-colors" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          {/* Bounties Grid */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skeletonCards.map((i) => (
                  <BountyCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredBounties.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-lg font-medium mb-2">No bounties found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filter criteria</p>
                <Button onClick={resetFilters}>Reset Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBounties.map((bounty) => (
                  <BountyCard key={bounty.id} bounty={bounty} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

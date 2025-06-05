"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/use-categories"
import { useBreakpoint } from "@/hooks/use-breakpoint"

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
  const { isTablet } = useBreakpoint()
  const { categories, loading: categoriesLoading } = useCategories()
  const [open, setOpen] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    )
  }

  return (
    <div className="md:hidden lg:hidden mb-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size={isTablet ? "default" : "sm"}
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              isTablet && "px-6 py-3 text-base",
              activeFilters > 0 ? "bg-[#FBF6E8]/10 border-[#FBF6E8]/30" : "",
            )}
          >
            <Filter className={`${isTablet ? 'h-5 w-5' : 'h-4 w-4'}`} />
            <span>Filters</span>
            {activeFilters > 0 && (
              <span className="bg-[#FBF6E8] text-[#091C2E] text-xs px-1.5 py-0.5 rounded-full font-medium">
                {activeFilters}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className={`${isTablet ? 'max-w-[500px]' : 'max-w-[90vw]'} w-full max-h-[85vh] flex flex-col p-0`}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className={`${isTablet ? 'text-xl' : 'text-lg'} font-semibold text-[#091C2E]`}>
              Filter Bounties
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Refine your search to find the perfect bounties
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <label className={`${isTablet ? 'text-base' : 'text-sm'} font-medium text-[#091C2E]`}>
                Search
              </label>
              <Input
                placeholder="Search bounties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isTablet ? 'h-12 text-base' : 'h-10'} border-gray-200 focus:border-[#FBF6E8] focus:ring-[#FBF6E8]`}
              />
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <label className={`${isTablet ? 'text-base' : 'text-sm'} font-medium text-[#091C2E]`}>
                Categories
              </label>
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">Loading categories...</div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories?.map((cat: any) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={cat.id}
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => handleCategoryToggle(cat.id)}
                        className="border-gray-300 data-[state=checked]:bg-[#FBF6E8] data-[state=checked]:border-[#FBF6E8]"
                      />
                      <label
                        htmlFor={cat.id}
                        className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-700 cursor-pointer flex-1`}
                      >
                        {cat.name}
                        {categoryCounts[cat.id] && (
                          <span className="text-xs text-gray-500 ml-1">({categoryCounts[cat.id]})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reward Range */}
            <div className="space-y-3">
              <label className={`${isTablet ? 'text-base' : 'text-sm'} font-medium text-[#091C2E]`}>
                Reward Range
              </label>
              <div className="px-2">
                <Slider
                  value={rewardRange}
                  onValueChange={setRewardRange}
                  max={maxReward}
                  min={minReward}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{formatCurrency(rewardRange[0])}</span>
                  <span>{formatCurrency(rewardRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Status Filters */}
            <div className="space-y-3">
              <label className={`${isTablet ? 'text-base' : 'text-sm'} font-medium text-[#091C2E]`}>
                Status
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-open"
                    checked={statusOpen}
                    onCheckedChange={setStatusOpen}
                    className="border-gray-300 data-[state=checked]:bg-[#FBF6E8] data-[state=checked]:border-[#FBF6E8]"
                  />
                  <label htmlFor="status-open" className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-700 cursor-pointer`}>
                    Open
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-in-progress"
                    checked={statusInProgress}
                    onCheckedChange={setStatusInProgress}
                    className="border-gray-300 data-[state=checked]:bg-[#FBF6E8] data-[state=checked]:border-[#FBF6E8]"
                  />
                  <label htmlFor="status-in-progress" className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-700 cursor-pointer`}>
                    In Progress
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-completed"
                    checked={statusCompleted}
                    onCheckedChange={setStatusCompleted}
                    className="border-gray-300 data-[state=checked]:bg-[#FBF6E8] data-[state=checked]:border-[#FBF6E8]"
                  />
                  <label htmlFor="status-completed" className={`${isTablet ? 'text-base' : 'text-sm'} text-gray-700 cursor-pointer`}>
                    Completed
                  </label>
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <label className={`${isTablet ? 'text-base' : 'text-sm'} font-medium text-[#091C2E]`}>
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={`${isTablet ? 'h-12 text-base' : 'h-10'} border-gray-200 focus:border-[#FBF6E8] focus:ring-[#FBF6E8]`}>
                  <SelectValue placeholder="Select sorting option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="reward-high">Highest Reward</SelectItem>
                  <SelectItem value="reward-low">Lowest Reward</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer with Reset Button */}
          <div className="p-6 pt-0 border-t border-gray-100">
            <Button
              onClick={resetFilters}
              variant="outline"
              className={`w-full ${isTablet ? 'h-12 text-base' : 'h-10'} border-gray-200 hover:bg-gray-50`}
            >
              <X className={`${isTablet ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
              Clear All Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Filters Display */}
      {activeFilters > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
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

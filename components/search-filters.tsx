"use client"

import React, { useState } from "react"
import { Filter, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SearchFiltersType {
  types: string[]
  categories: string[]
  status: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  rewardRange: {
    min?: number
    max?: number
  }
}

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  availableCategories: string[]
  className?: string
}

const SEARCH_TYPES = [
  { value: "bounty", label: "Bounties" },
  { value: "category", label: "Categories" },
  { value: "activity", label: "Activities" }
]

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" }
]

const REWARD_RANGES = [
  { label: "Any Amount", min: undefined, max: undefined },
  { label: "$0 - $100", min: 0, max: 100 },
  { label: "$100 - $500", min: 100, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "$1000+", min: 1000, max: undefined }
]

export function SearchFilters({ 
  filters, 
  onFiltersChange, 
  availableCategories,
  className 
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (updates: Partial<SearchFiltersType>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    updateFilters({ types: newTypes })
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilters({ categories: newCategories })
  }

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    updateFilters({ status: newStatus })
  }

  const setRewardRange = (min?: number, max?: number) => {
    updateFilters({ rewardRange: { min, max } })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      types: [],
      categories: [],
      status: [],
      dateRange: {},
      rewardRange: {}
    })
  }

  const hasActiveFilters = 
    filters.types.length > 0 ||
    filters.categories.length > 0 ||
    filters.status.length > 0 ||
    filters.rewardRange.min !== undefined ||
    filters.rewardRange.max !== undefined

  return (
    <div className={cn("border-b bg-background", className)}>
      <div className="flex items-center justify-between px-3 md:px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 md:gap-2 text-sm"
        >
          <Filter className="h-3 w-3 md:h-4 md:w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {filters.types.length + filters.categories.length + filters.status.length + 
               (filters.rewardRange.min !== undefined || filters.rewardRange.max !== undefined ? 1 : 0)}
            </span>
          )}
          <ChevronDown className={cn(
            "h-3 w-3 md:h-4 md:w-4 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
          >
            Clear All
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 md:space-y-4 search-filter-section">
          {/* Content Types */}
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-2">Content Type</h4>
            <div className="flex flex-wrap gap-1 md:gap-2 search-filter-buttons">
              {SEARCH_TYPES.map(type => (
                <Button
                  key={type.value}
                  variant={filters.types.includes(type.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleType(type.value)}
                  className="text-xs search-filter-button h-7 md:h-8 px-2 md:px-3"
                >
                  {type.label}
                  {filters.types.includes(type.value) && (
                    <X className="ml-1 h-2 w-2 md:h-3 md:w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <h4 className="text-xs md:text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-1 md:gap-2 max-h-24 md:max-h-32 overflow-y-auto search-filter-buttons">
                {availableCategories.map(category => (
                  <Button
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className="text-xs search-filter-button h-7 md:h-8 px-2 md:px-3"
                  >
                    {category}
                    {filters.categories.includes(category) && (
                      <X className="ml-1 h-2 w-2 md:h-3 md:w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-2">Status</h4>
            <div className="flex flex-wrap gap-1 md:gap-2 search-filter-buttons">
              {STATUS_OPTIONS.map(status => (
                <Button
                  key={status.value}
                  variant={filters.status.includes(status.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStatus(status.value)}
                  className="text-xs search-filter-button h-7 md:h-8 px-2 md:px-3"
                >
                  {status.label}
                  {filters.status.includes(status.value) && (
                    <X className="ml-1 h-2 w-2 md:h-3 md:w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Reward Range */}
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-2">Reward Range</h4>
            <div className="flex flex-wrap gap-1 md:gap-2 search-filter-buttons">
              {REWARD_RANGES.map((range, index) => {
                const isSelected = 
                  filters.rewardRange.min === range.min && 
                  filters.rewardRange.max === range.max
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRewardRange(range.min, range.max)}
                    className="text-xs search-filter-button h-7 md:h-8 px-2 md:px-3"
                  >
                    {range.label}
                    {isSelected && (
                      <X className="ml-1 h-2 w-2 md:h-3 md:w-3" />
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
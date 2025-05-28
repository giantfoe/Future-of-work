"use client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "open" | "in-progress" | "closed" | null

interface StatusFilterProps {
  counts: {
    open: number
    inProgress: number
    closed: number
  }
  onFilterChange: (status: StatusType) => void
  currentFilter: StatusType
}

export function StatusFilter({ counts, onFilterChange, currentFilter }: StatusFilterProps) {
  // Status color mapping
  const getStatusColor = (status: string, isActive: boolean) => {
    switch (status) {
      case "open":
        return isActive ? "bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600"
      case "in-progress":
        return isActive ? "bg-amber-600" : "bg-amber-500 hover:bg-amber-600"
      case "closed":
        return isActive ? "bg-gray-600" : "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Status label mapping
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open"
      case "in-progress":
        return "In Review" // This is displayed as "In Review" but the value is "in-progress"
      case "closed":
        return "Closed"
      default:
        return status
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        className={cn(
          "text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
          currentFilter === null ? "bg-black" : "bg-gray-400 hover:bg-gray-500",
        )}
        onClick={() => onFilterChange(null)}
      >
        All
        <span className="ml-1.5 bg-white bg-opacity-20 text-white px-1.5 py-0.5 rounded-full text-xs">
          {counts.open + counts.inProgress + counts.closed}
        </span>
      </Badge>

      <Badge
        className={cn(
          getStatusColor("open", currentFilter === "open"),
          "text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
        )}
        onClick={() => onFilterChange(currentFilter === "open" ? null : "open")}
      >
        {getStatusLabel("open")}
        <span className="ml-1.5 bg-white bg-opacity-20 text-white px-1.5 py-0.5 rounded-full text-xs">
          {counts.open}
        </span>
      </Badge>

      <Badge
        className={cn(
          getStatusColor("in-progress", currentFilter === "in-progress"),
          "text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
        )}
        onClick={() => onFilterChange(currentFilter === "in-progress" ? null : "in-progress")}
      >
        {getStatusLabel("in-progress")}
        <span className="ml-1.5 bg-white bg-opacity-20 text-white px-1.5 py-0.5 rounded-full text-xs">
          {counts.inProgress}
        </span>
      </Badge>

      <Badge
        className={cn(
          getStatusColor("closed", currentFilter === "closed"),
          "text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
        )}
        onClick={() => onFilterChange(currentFilter === "closed" ? null : "closed")}
      >
        {getStatusLabel("closed")}
        <span className="ml-1.5 bg-white bg-opacity-20 text-white px-1.5 py-0.5 rounded-full text-xs">
          {counts.closed}
        </span>
      </Badge>
    </div>
  )
}

import { cn } from "@/lib/utils"

interface StatusTagProps {
  status: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function StatusTag({ status, className, size = "md" }: StatusTagProps) {
  // Determine status color and label
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-emerald-500 text-white"
      case "in-progress":
      case "in progress":
      case "in review":
        return "bg-amber-500 text-white" // Consistent amber color for "in review" status
      case "closed":
      case "completed":
        return "bg-gray-500 text-white"
      default:
        return "bg-black text-white"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "Open"
      case "in-progress":
      case "in progress":
        return "In Review"
      case "closed":
      case "completed":
        return "Closed"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Size variants
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1 min-w-[70px]",
    md: "text-xs px-3.5 py-1.5 min-w-[80px]",
    lg: "text-sm px-4 py-2 min-w-[90px]",
  }

  return (
    <div
      className={cn(
        "inline-flex justify-center items-center font-medium rounded-full",
        getStatusColor(status),
        sizeClasses[size],
        className,
      )}
    >
      {getStatusLabel(status)}
    </div>
  )
}

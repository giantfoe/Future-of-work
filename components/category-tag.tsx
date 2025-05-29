import { Tag } from "lucide-react"
import { cn } from "@/lib/utils"

// Define a map of category colors for consistent styling
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  design: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  development: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  engineering: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  content: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  "content creation": { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  marketing: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
  research: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  community: { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
  data: { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
  analytics: { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-200" },
  writing: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  product: { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" },
  testing: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200" },
  security: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  devops: { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-200" },
  mobile: { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-200" },
  frontend: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  backend: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
  fullstack: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  ai: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  blockchain: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
}

// Function to get category color based on category name
export function getCategoryColors(category: string | unknown) {
  // Normalize the category
  const normalizedCategory =
    typeof category === "string"
      ? category.toLowerCase().trim()
      : String(category || "")
          .toLowerCase()
          .trim()

  // Get colors from map or use default
  return (
    CATEGORY_COLORS[normalizedCategory] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
    }
  )
}

// Function to format category name for display
export function formatCategoryName(category: string | unknown): string {
  if (!category) return "Uncategorized"

  const categoryStr = String(category).trim()

  // Handle special cases like "content creation"
  if (categoryStr.includes(" ")) {
    return categoryStr
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1)
}

interface CategoryTagProps {
  category: string | unknown
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
}

export function CategoryTag({ category, size = "md", showIcon = false, className }: CategoryTagProps) {
  // Updated styling to match media pills
  // Using a more neutral color scheme with subtle gradient and shadow
  const formattedName = formatCategoryName(category)

  // Size variants - made more compact
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full transition-colors duration-200",
        "bg-transparent border border-[#FBF6E8] text-[#FBF6E8] hover:bg-[#FBF6E8]/10",
        sizeClasses[size],
        className,
      )}
    >
      {showIcon && (
        <Tag className={cn("mr-1.5", size === "sm" ? "w-3 h-3" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      )}
      {formattedName}
    </span>
  )
}

// Component to handle multiple categories
interface CategoryTagsProps {
  categories: string | string[] | unknown
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
}

export function CategoryTags({ categories, size = "md", showIcon = false, className }: CategoryTagsProps) {
  // Parse categories into an array
  const categoryArray = parseCategories(categories)

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categoryArray.map((category, index) => (
        <CategoryTag key={`${category}-${index}`} category={category} size={size} showIcon={showIcon} />
      ))}
    </div>
  )
}

// Helper function to parse categories into an array
export function parseCategories(categories: string | string[] | unknown): string[] {
  if (!categories) return ["Uncategorized"]

  if (Array.isArray(categories)) {
    return categories.map((cat) => String(cat).trim()).filter(Boolean)
  }

  const categoryStr = String(categories)

  if (categoryStr.includes(",")) {
    return categoryStr
      .split(",")
      .map((cat) => cat.trim())
      .filter(Boolean)
  }

  return [categoryStr.trim()]
}

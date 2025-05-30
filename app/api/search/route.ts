import { NextRequest, NextResponse } from "next/server"
import { getBounties } from "@/lib/airtable-service"
import type { Bounty } from "@/lib/types"

// Types for search functionality
type SearchType = 'bounty' | 'category' | 'activity' | 'user'

interface SearchResult {
  id: string
  title: string
  description: string
  type: SearchType
  url: string
  metadata?: {
    reward?: number
    deadline?: string
    status?: string
    category?: string
  }
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
  hasMore: boolean
}

/**
 * GET /api/search
 * Comprehensive search across bounties, categories, and other data
 * GDPR Compliant - only searches public, non-personal data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.trim()
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || []
    const types = searchParams.get("types")?.split(",").filter(Boolean) || ["bounty", "category"]
    const status = searchParams.get("status")?.split(",").filter(Boolean) || []
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const includeInactive = searchParams.get("includeInactive") === "true"
    const minReward = searchParams.get("minReward") ? parseInt(searchParams.get("minReward")!) : undefined
    const maxReward = searchParams.get("maxReward") ? parseInt(searchParams.get("maxReward")!) : undefined

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    const searchTypes = types
    const categoryFilters = categories
    const statusFilters = status

    // Collect all results
    const results: SearchResult[] = []

    // Search bounties if requested
    if (searchTypes.includes('bounty')) {
      const bountyResults = await searchBounties(
        query,
        categoryFilters,
        statusFilters,
        minReward,
        maxReward,
        limit,
        includeInactive
      )
      results.push(...bountyResults)
    }

    // Search categories if requested
    if (searchTypes.includes('category')) {
      const categoryResults = await searchCategories(query, limit)
      results.push(...categoryResults)
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = sortResultsByRelevance(results, query)

    // Apply limit
    const limitedResults = sortedResults.slice(0, limit)

    // Add cache headers for performance
    const headers = {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    }

    return NextResponse.json(
      {
        query: query,
        results: limitedResults,
        total: limitedResults.length,
        hasMore: sortedResults.length > limitedResults.length,
      },
      { headers }
    )
  } catch (error) {
    console.error("Error in search API route:", error)
    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Helper function to search bounties
async function searchBounties(
  query: string,
  categories: string[],
  status: string[],
  minReward?: number,
  maxReward?: number,
  limit: number = 10,
  includeInactive: boolean = false
): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bounties`)
    if (!response.ok) return []
    
    const bounties = await response.json()
    
    return bounties
      .filter((bounty: any) => {
        // Enhanced flexible search query matching with broader scope
        const queryLower = query.toLowerCase()
        const titleLower = (bounty.title || '').toLowerCase()
        const descriptionLower = (bounty.description || '').toLowerCase()
        const categoryLower = Array.isArray(bounty.category) ? bounty.category.join(' ').toLowerCase() : (bounty.category || '').toLowerCase()
        const tagsLower = (bounty.tags || []).join(' ').toLowerCase()
        const skillsLower = (bounty.skills || []).join(' ').toLowerCase()
        
        // Create comprehensive searchable text combining all fields
        const searchableText = `${titleLower} ${descriptionLower} ${categoryLower} ${tagsLower} ${skillsLower}`
        
        // Split query into individual words and phrases for flexible matching
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0)
        const originalQuery = queryLower.trim()
        
        const matchesQuery = (() => {
          // If empty query, show all
          if (queryLower.length === 0) return true
          
          // Simple substring match - check if searchable text contains the query in order
          return searchableText.includes(queryLower)
        })()
        
        // Filter by categories if specified
        const matchesCategory = categories.length === 0 || 
          categories.some(cat => {
            if (Array.isArray(bounty.category)) {
              return bounty.category.some(bc => bc.toLowerCase().includes(cat.toLowerCase()))
            }
            return bounty.category?.toLowerCase().includes(cat.toLowerCase())
          })
        
        // Filter by status if specified
        const matchesStatus = status.length === 0 || 
          status.includes(bounty.status) || 
          (includeInactive || bounty.status === 'active')
        
        // Filter by reward range if specified
        const reward = parseFloat(bounty.reward) || 0
        const matchesRewardMin = minReward === undefined || reward >= minReward
        const matchesRewardMax = maxReward === undefined || reward <= maxReward
        
        return matchesQuery && matchesCategory && matchesStatus && matchesRewardMin && matchesRewardMax
      })
      .slice(0, limit)
      .map((bounty: any) => ({
        id: bounty.id,
        title: bounty.title,
        description: truncateDescription(bounty.description, 150),
        type: "bounty" as const,
        url: `/bounties/${bounty.id}`,
        metadata: {
          reward: parseFloat(bounty.reward) || 0,
          deadline: bounty.deadline,
          status: bounty.status,
          category: bounty.category
        }
      }))
  } catch (error) {
    console.error('Error searching bounties:', error)
    return []
  }
}

// Helper function to get categories
async function getCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`)
    if (!response.ok) return []
    
    const categories = await response.json()
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Helper function to search categories with enhanced scope
async function searchCategories(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const categories = await getCategories()
    
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0)
    const originalQuery = queryLower.trim()
    
    return categories
      .filter((category) => {
        const categoryLower = category.toLowerCase()
        
        // Simple substring match - check if category contains the query in order
        if (queryLower.length === 0) return true
        
        return categoryLower.includes(queryLower)
      })
      .slice(0, limit)
      .map((category) => ({
        id: `category-${category.toLowerCase().replace(/\s+/g, "-")}`,
        title: category,
        description: `Browse all bounties in the ${category} category`,
        type: "category" as const,
        url: `/bounties?category=${encodeURIComponent(category)}`,
      }))
  } catch (error) {
    console.error('Error searching categories:', error)
    return []
  }
}

/**
 * Sort results by relevance with enhanced scoring for broader search
 */
function sortResultsByRelevance(results: SearchResult[], query: string): SearchResult[] {
  const queryLower = query.toLowerCase().trim()
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0)
  
  // Calculate relevance score for each result
  const scoredResults = results.map(result => {
    const titleLower = result.title.toLowerCase()
    const descLower = result.description.toLowerCase()
    const combinedText = `${titleLower} ${descLower}`
    let score = 0
    
    // 1. Exact matches (highest priority)
    if (titleLower === queryLower) score += 2000
    if (titleLower.includes(queryLower) && queryLower.length > 1) score += 1000
    if (descLower.includes(queryLower) && queryLower.length > 1) score += 500
    
    // 2. Phrase and word position scoring
    if (titleLower.startsWith(queryLower)) score += 800
    if (descLower.startsWith(queryLower)) score += 400
    
    // 3. Individual word scoring with enhanced partial matching
    queryWords.forEach(word => {
      // Title word matches (high weight)
      if (titleLower.includes(word)) score += 200
      
      // Description word matches (medium weight)
      if (descLower.includes(word)) score += 100
      
      // Enhanced partial word matching in title
      if (word.length >= 2) {
        const titleWords = titleLower.match(/\b\w+\b/g) || []
        titleWords.forEach(titleWord => {
          if (titleWord.includes(word)) score += 150
          if (word.includes(titleWord)) score += 120
          // Fuzzy matching bonus
          if (word.length >= 3 && titleWord.length >= 3) {
            const similarity = calculateSimilarity(word, titleWord)
            if (similarity > 0.7) score += Math.floor(similarity * 100)
          }
        })
      }
      
      // Enhanced partial word matching in description
      if (word.length >= 2) {
        const descWords = descLower.match(/\b\w+\b/g) || []
        descWords.forEach(descWord => {
          if (descWord.includes(word)) score += 75
          if (word.includes(descWord)) score += 60
          // Fuzzy matching bonus
          if (word.length >= 3 && descWord.length >= 3) {
            const similarity = calculateSimilarity(word, descWord)
            if (similarity > 0.7) score += Math.floor(similarity * 50)
          }
        })
      }
    })
    
    // 4. Multi-word query bonus (when all words are found)
    if (queryWords.length > 1) {
      const allWordsInTitle = queryWords.every(word => 
        titleLower.includes(word) || 
        titleLower.split(/\s+/).some(titleWord => 
          titleWord.includes(word) || word.includes(titleWord)
        )
      )
      const allWordsInDesc = queryWords.every(word => 
        descLower.includes(word) || 
        descLower.split(/\s+/).some(descWord => 
          descWord.includes(word) || word.includes(descWord)
        )
      )
      
      if (allWordsInTitle) score += 300
      if (allWordsInDesc) score += 150
    }
    
    // 5. Type-based bonuses
    if (result.type === "bounty") score += 10
    if (result.type === "category") score += 5
    
    // 6. Length penalty for very long queries (avoid over-matching)
    if (queryLower.length > 20) score *= 0.9
    
    return { ...result, score }
  })
  
  // Sort by score (descending) then alphabetically
  return scoredResults
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      return a.title.localeCompare(b.title)
    })
    .map(({ score, ...result }) => result) // Remove score from final results
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a value between 0 and 1, where 1 is identical
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  
  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0
  
  // Create matrix
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null))
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[0][i] = i
  for (let j = 0; j <= len2; j++) matrix[j][0] = j
  
  // Fill matrix
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,     // deletion
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      )
    }
  }
  
  const maxLen = Math.max(len1, len2)
  return (maxLen - matrix[len2][len1]) / maxLen
}

/**
 * Truncate description to specified length
 */
function truncateDescription(description: string, maxLength: number): string {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength).trim() + "..."
}
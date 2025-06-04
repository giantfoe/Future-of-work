import { NextRequest, NextResponse } from "next/server"
import { getBounties, getCategories } from "@/lib/airtable-service"
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

// Helper function to search bounties with enhanced fuzzy matching
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
    // Direct function call instead of HTTP request for better Vercel compatibility
    const bounties = await getBounties()
    
    return bounties
      .filter((bounty: any) => {
        // Enhanced fuzzy search query matching
        const matchesQuery = fuzzySearchMatch(query, [
          bounty.title || '',
          bounty.description || '',
          bounty.category || '',
          bounty.skills?.join(' ') || '',
          bounty.tags?.join(' ') || ''
        ])
        
        // Filter by categories if specified
        const matchesCategory = categories.length === 0 || 
          categories.some(cat => bounty.category?.toLowerCase().includes(cat.toLowerCase()))
        
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

// Note: getCategories is now imported directly from airtable-service

// Enhanced fuzzy search matching function
function fuzzySearchMatch(query: string, searchFields: string[]): boolean {
  if (!query || query.trim().length === 0) return true
  
  const normalizedQuery = query.toLowerCase().trim()
  const queryWords = normalizedQuery.split(/\s+/)
  
  // Join all search fields into one searchable text
  const searchText = searchFields.join(' ').toLowerCase()
  
  // Check if any query word matches (partial matching)
  return queryWords.some(queryWord => {
    if (queryWord.length === 0) return false
    
    // Direct substring match (most flexible)
    if (searchText.includes(queryWord)) return true
    
    // Word boundary matching for better relevance
    const wordBoundaryRegex = new RegExp(`\\b${escapeRegExp(queryWord)}`, 'i')
    if (wordBoundaryRegex.test(searchText)) return true
    
    // Partial word matching (for cases like "expl" matching "explore", "explain", etc.)
    const words = searchText.split(/\s+/)
    return words.some(word => {
      // Check if any word starts with the query word
      if (word.startsWith(queryWord)) return true
      
      // Check if query word is contained within any word (for compound words)
      if (word.includes(queryWord) && queryWord.length >= 3) return true
      
      return false
    })
  })
}

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Helper function to search categories
async function searchCategories(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const categories = await getCategories()
    
    return categories
      .filter((category) => fuzzySearchMatch(query, [category]))
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
 * Sort results by relevance with enhanced scoring
 */
function sortResultsByRelevance(results: SearchResult[], query: string): SearchResult[] {
  const queryLower = query.toLowerCase().trim()
  const queryWords = queryLower.split(/\s+/)
  
  return results.sort((a, b) => {
    const aScore = calculateRelevanceScore(a, queryLower, queryWords)
    const bScore = calculateRelevanceScore(b, queryLower, queryWords)
    
    // Higher score comes first
    if (aScore !== bScore) return bScore - aScore
    
    // Bounties before categories if scores are equal
    if (a.type === "bounty" && b.type !== "bounty") return -1
    if (b.type === "bounty" && a.type !== "bounty") return 1
    
    // Alphabetical as final sort
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  })
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(result: SearchResult, query: string, queryWords: string[]): number {
  const title = result.title.toLowerCase()
  const description = result.description.toLowerCase()
  let score = 0
  
  // Exact title match (highest score)
  if (title === query) score += 100
  
  // Title starts with query
  if (title.startsWith(query)) score += 80
  
  // Title contains full query
  if (title.includes(query)) score += 60
  
  // Check individual query words
  queryWords.forEach(word => {
    if (word.length === 0) return
    
    // Word appears in title
    if (title.includes(word)) {
      if (title.startsWith(word)) score += 40
      else score += 20
    }
    
    // Word appears in description
    if (description.includes(word)) score += 10
    
    // Partial word matching in title (for "expl" matching "explore")
    const titleWords = title.split(/\s+/)
    titleWords.forEach(titleWord => {
      if (titleWord.startsWith(word) && word.length >= 3) {
        score += 15
      }
    })
  })
  
  // Bonus for bounties (more relevant than categories)
  if (result.type === "bounty") score += 5
  
  return score
}

/**
 * Truncate description to specified length
 */
function truncateDescription(description: string, maxLength: number): string {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength).trim() + "..."
}
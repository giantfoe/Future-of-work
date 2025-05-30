import { NextRequest, NextResponse } from "next/server"

interface SearchAnalytics {
  query: string
  timestamp: number
  resultsCount: number
  selectedResult?: {
    id: string
    title: string
    type: string
    position: number
  }
  userAgent?: string
  sessionId?: string
}

// In-memory storage for demo purposes
// In production, you would store this in a database
let analyticsStore: SearchAnalytics[] = []

export async function POST(request: NextRequest) {
  try {
    const analytics: SearchAnalytics = await request.json()

    // Validate required fields
    if (!analytics.query || typeof analytics.timestamp !== 'number') {
      return NextResponse.json(
        { error: "Missing required fields: query and timestamp" },
        { status: 400 }
      )
    }

    // Sanitize and validate data
    const sanitizedAnalytics: SearchAnalytics = {
      query: analytics.query.trim().toLowerCase(),
      timestamp: analytics.timestamp,
      resultsCount: Math.max(0, analytics.resultsCount || 0),
      selectedResult: analytics.selectedResult ? {
        id: analytics.selectedResult.id,
        title: analytics.selectedResult.title,
        type: analytics.selectedResult.type,
        position: Math.max(0, analytics.selectedResult.position)
      } : undefined,
      userAgent: analytics.userAgent?.substring(0, 500), // Limit length
      sessionId: analytics.sessionId
    }

    // Store analytics (in production, save to database)
    analyticsStore.push(sanitizedAnalytics)

    // Keep only last 10000 entries to prevent memory issues
    if (analyticsStore.length > 10000) {
      analyticsStore = analyticsStore.slice(-10000)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to process analytics data" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "summary"
    const days = parseInt(searchParams.get("days") || "7")
    const limit = parseInt(searchParams.get("limit") || "10")

    const now = Date.now()
    const daysAgo = now - (days * 24 * 60 * 60 * 1000)
    const recentAnalytics = analyticsStore.filter(a => a.timestamp >= daysAgo)

    switch (type) {
      case "popular-queries": {
        const queryCount = new Map<string, number>()
        recentAnalytics.forEach(analytics => {
          const count = queryCount.get(analytics.query) || 0
          queryCount.set(analytics.query, count + 1)
        })

        const popularQueries = Array.from(queryCount.entries())
          .map(([query, count]) => ({ query, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)

        return NextResponse.json({ popularQueries })
      }

      case "click-through-rate": {
        const totalSearches = recentAnalytics.length
        const searchesWithClicks = recentAnalytics.filter(a => a.selectedResult).length
        const clickThroughRate = totalSearches > 0 ? (searchesWithClicks / totalSearches) * 100 : 0

        return NextResponse.json({ 
          clickThroughRate: Math.round(clickThroughRate * 100) / 100,
          totalSearches,
          searchesWithClicks
        })
      }

      case "trends": {
        const dailySearches = new Map<string, number>()
        recentAnalytics.forEach(analytics => {
          const date = new Date(analytics.timestamp).toISOString().split('T')[0]
          const count = dailySearches.get(date) || 0
          dailySearches.set(date, count + 1)
        })

        const trends = Array.from(dailySearches.entries())
          .map(([date, searches]) => ({ date, searches }))
          .sort((a, b) => a.date.localeCompare(b.date))

        return NextResponse.json({ trends })
      }

      case "summary":
      default: {
        const totalSearches = recentAnalytics.length
        const searchesWithClicks = recentAnalytics.filter(a => a.selectedResult).length
        const clickThroughRate = totalSearches > 0 ? (searchesWithClicks / totalSearches) * 100 : 0
        const averageResults = totalSearches > 0 
          ? recentAnalytics.reduce((sum, a) => sum + a.resultsCount, 0) / totalSearches 
          : 0

        const uniqueQueries = new Set(recentAnalytics.map(a => a.query)).size
        const uniqueSessions = new Set(recentAnalytics.map(a => a.sessionId)).size

        return NextResponse.json({
          summary: {
            totalSearches,
            searchesWithClicks,
            clickThroughRate: Math.round(clickThroughRate * 100) / 100,
            averageResults: Math.round(averageResults * 100) / 100,
            uniqueQueries,
            uniqueSessions,
            period: `${days} days`
          }
        })
      }
    }
  } catch (error) {
    console.error("Analytics GET API error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve analytics data" },
      { status: 500 }
    )
  }
}
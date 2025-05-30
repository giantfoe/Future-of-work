"use client"

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

class SearchAnalyticsService {
  private static instance: SearchAnalyticsService
  private analytics: SearchAnalytics[] = []
  private sessionId: string

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.loadFromStorage()
  }

  public static getInstance(): SearchAnalyticsService {
    if (!SearchAnalyticsService.instance) {
      SearchAnalyticsService.instance = new SearchAnalyticsService()
    }
    return SearchAnalyticsService.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('search_analytics')
        if (stored) {
          this.analytics = JSON.parse(stored)
        }
      } catch (error) {
        console.warn('Failed to load search analytics from storage:', error)
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        // Keep only last 1000 entries to prevent storage bloat
        const recentAnalytics = this.analytics.slice(-1000)
        localStorage.setItem('search_analytics', JSON.stringify(recentAnalytics))
      } catch (error) {
        console.warn('Failed to save search analytics to storage:', error)
      }
    }
  }

  public trackSearch(query: string, resultsCount: number): void {
    if (!query.trim()) return

    const analytics: SearchAnalytics = {
      query: query.trim().toLowerCase(),
      timestamp: Date.now(),
      resultsCount,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      sessionId: this.sessionId
    }

    this.analytics.push(analytics)
    this.saveToStorage()

    // Send to analytics endpoint (optional)
    this.sendToServer(analytics)
  }

  public trackResultClick(
    query: string,
    result: { id: string; title: string; type: string },
    position: number
  ): void {
    if (!query.trim()) return

    // Find the most recent search for this query
    const recentSearch = this.analytics
      .slice()
      .reverse()
      .find(a => a.query === query.trim().toLowerCase() && !a.selectedResult)

    if (recentSearch) {
      recentSearch.selectedResult = {
        id: result.id,
        title: result.title,
        type: result.type,
        position
      }
      this.saveToStorage()

      // Send updated analytics to server
      this.sendToServer(recentSearch)
    }
  }

  private async sendToServer(analytics: SearchAnalytics): Promise<void> {
    try {
      // Only send analytics in production or if explicitly enabled
      if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
        return
      }

      await fetch('/api/analytics/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics),
      })
    } catch (error) {
      // Silently fail - analytics shouldn't break the user experience
      console.debug('Failed to send search analytics:', error)
    }
  }

  public getPopularQueries(limit: number = 10): Array<{ query: string; count: number }> {
    const queryCount = new Map<string, number>()
    
    this.analytics.forEach(analytics => {
      const count = queryCount.get(analytics.query) || 0
      queryCount.set(analytics.query, count + 1)
    })

    return Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  public getClickThroughRate(): number {
    const totalSearches = this.analytics.length
    const searchesWithClicks = this.analytics.filter(a => a.selectedResult).length
    
    return totalSearches > 0 ? (searchesWithClicks / totalSearches) * 100 : 0
  }

  public getAverageResultsPerQuery(): number {
    if (this.analytics.length === 0) return 0
    
    const totalResults = this.analytics.reduce((sum, a) => sum + a.resultsCount, 0)
    return totalResults / this.analytics.length
  }

  public getSearchTrends(days: number = 7): Array<{ date: string; searches: number }> {
    const now = Date.now()
    const daysAgo = now - (days * 24 * 60 * 60 * 1000)
    
    const recentAnalytics = this.analytics.filter(a => a.timestamp >= daysAgo)
    
    const dailySearches = new Map<string, number>()
    
    recentAnalytics.forEach(analytics => {
      const date = new Date(analytics.timestamp).toISOString().split('T')[0]
      const count = dailySearches.get(date) || 0
      dailySearches.set(date, count + 1)
    })

    return Array.from(dailySearches.entries())
      .map(([date, searches]) => ({ date, searches }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  public clearAnalytics(): void {
    this.analytics = []
    this.saveToStorage()
  }
}

export const searchAnalytics = SearchAnalyticsService.getInstance()
export type { SearchAnalytics }
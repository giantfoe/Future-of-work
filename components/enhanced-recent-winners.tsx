'use client'

import { useState, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, DollarSign, Clock, Search, Filter, SortAsc, SortDesc, Award, Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Winner {
  name: string
  reward: string
  bountyTitle: string
  timeAgo: string
  avatar?: string
  category?: string
  difficulty?: string
}

interface EnhancedRecentWinnersProps {
  winners: Winner[]
  showSearch?: boolean
  showFilters?: boolean
  maxDisplay?: number
}

type SortOption = 'recent' | 'reward' | 'name'
type SortDirection = 'asc' | 'desc'

export default function EnhancedRecentWinners({ 
  winners, 
  showSearch = true, 
  showFilters = true, 
  maxDisplay = 10 
}: EnhancedRecentWinnersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Extract unique categories from winners
  const categories = useMemo(() => {
    const cats = winners.map(w => w.category || 'General').filter(Boolean)
    return ['all', ...Array.from(new Set(cats))]
  }, [winners])

  // Filter and sort winners
  const filteredAndSortedWinners = useMemo(() => {
    let filtered = winners.filter(winner => {
      const matchesSearch = 
        winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        winner.bountyTitle.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        (winner.category || 'General') === selectedCategory
      
      return matchesSearch && matchesCategory
    })

    // Sort winners
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'reward':
          const aReward = parseFloat(a.reward.replace(/[$,]/g, '') || '0')
          const bReward = parseFloat(b.reward.replace(/[$,]/g, '') || '0')
          comparison = aReward - bReward
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'recent':
        default:
          // Assuming timeAgo format like "2 hours ago", "1 day ago"
          const aTime = parseTimeAgo(a.timeAgo)
          const bTime = parseTimeAgo(b.timeAgo)
          comparison = aTime - bTime
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered.slice(0, maxDisplay)
  }, [winners, searchTerm, sortBy, sortDirection, selectedCategory, maxDisplay])

  // Helper function to parse time ago strings
  function parseTimeAgo(timeAgo: string): number {
    const match = timeAgo.match(/(\d+)\s+(minute|hour|day|week|month)s?\s+ago/)
    if (!match) return 0
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    const multipliers = {
      minute: 1,
      hour: 60,
      day: 1440,
      week: 10080,
      month: 43200
    }
    
    return value * (multipliers[unit as keyof typeof multipliers] || 0)
  }

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(option)
      setSortDirection('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search winners or bounties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          )}

          {/* Filter and Sort Controls */}
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                    <Filter className="h-4 w-4 mr-2" />
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="text-white hover:bg-gray-700"
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Options */}
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('recent')}
                  className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Recent
                  {sortBy === 'recent' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
                
                <Button
                  variant={sortBy === 'reward' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('reward')}
                  className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Reward
                  {sortBy === 'reward' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
                
                <Button
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('name')}
                  className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                >
                  <Award className="h-4 w-4 mr-1" />
                  Name
                  {sortBy === 'name' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Showing {filteredAndSortedWinners.length} of {winners.length} winners
        </span>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="text-gray-400 hover:text-white"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Winners List */}
      <div className="space-y-4">
        {filteredAndSortedWinners.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No winners found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredAndSortedWinners.map((winner, index) => {
            const rewardValue = parseFloat(winner.reward.replace(/[$,]/g, '') || '0')
            const isHighValue = rewardValue >= 1000
            
            return (
              <div
                key={`${winner.name}-${index}`}
                className={`
                  group relative p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.02]
                  ${isHighValue 
                    ? 'bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30 hover:border-yellow-400/50' 
                    : 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/30 hover:border-blue-400/50'
                  }
                  hover:shadow-lg hover:shadow-blue-500/20
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* High Value Badge */}
                {isHighValue && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      High Value
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Avatar with enhanced styling */}
                  <div className="relative">
                    <Avatar className="h-14 w-14 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-gray-900">
                      <AvatarImage src={winner.avatar} alt={winner.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                        {winner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <Trophy className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Winner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">
                        {winner.name}
                      </h4>
                      {winner.category && (
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {winner.category}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2 line-clamp-1 group-hover:text-gray-200 transition-colors">
                      {winner.bountyTitle}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-400 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {winner.reward}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        {winner.timeAgo}
                      </div>
                    </div>
                  </div>

                  {/* Reward Highlight */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      isHighValue ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {winner.reward}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isHighValue ? 'Premium Bounty' : 'Standard Bounty'}
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )
          })
        )}
      </div>

      {/* Load More Button (if there are more winners) */}
      {winners.length > maxDisplay && filteredAndSortedWinners.length === maxDisplay && (
        <div className="text-center pt-6">
          <Button 
            variant="outline" 
            className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            onClick={() => {/* Implement load more functionality */}}
          >
            Load More Winners
          </Button>
        </div>
      )}
    </div>
  )
}
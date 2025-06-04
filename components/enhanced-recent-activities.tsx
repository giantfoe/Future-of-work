'use client'

import { useState, useMemo, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  DollarSign, 
  FileText, 
  Send, 
  Clock, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Activity,
  Zap,
  RefreshCw,
  Eye,
  TrendingUp
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ActivityItem {
  type: 'new_bounty' | 'payment' | 'application' | 'submission'
  user: string
  message: string
  timeAgo: string
  avatar?: string
  amount?: string
  bountyTitle?: string
  priority?: 'low' | 'medium' | 'high'
}

interface EnhancedRecentActivitiesProps {
  activities: ActivityItem[]
  showSearch?: boolean
  showFilters?: boolean
  maxDisplay?: number
  enableRealTime?: boolean
}

type SortOption = 'recent' | 'type' | 'user'
type SortDirection = 'asc' | 'desc'

const activityConfig = {
  new_bounty: {
    icon: Plus,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'New Bounty'
  },
  payment: {
    icon: DollarSign,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    label: 'Payment'
  },
  application: {
    icon: FileText,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    label: 'Application'
  },
  submission: {
    icon: Send,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    label: 'Submission'
  }
}

export default function EnhancedRecentActivities({ 
  activities, 
  showSearch = true, 
  showFilters = true, 
  maxDisplay = 10,
  enableRealTime = true
}: EnhancedRecentActivitiesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time updates
  useEffect(() => {
    if (!enableRealTime) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [enableRealTime])

  // Activity types for filtering
  const activityTypes = useMemo(() => {
    return ['all', ...Object.keys(activityConfig)]
  }, [])

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = 
        activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.bountyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      const matchesType = 
        selectedType === 'all' || 
        activity.type === selectedType
      
      return matchesSearch && matchesType
    })

    // Sort activities
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'user':
          comparison = a.user.localeCompare(b.user)
          break
        case 'recent':
        default:
          const aTime = parseTimeAgo(a.timeAgo)
          const bTime = parseTimeAgo(b.timeAgo)
          comparison = aTime - bTime
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered.slice(0, maxDisplay)
  }, [activities, searchTerm, sortBy, sortDirection, selectedType, maxDisplay])

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  // Get activity statistics
  const activityStats = useMemo(() => {
    const stats = Object.keys(activityConfig).reduce((acc, type) => {
      acc[type] = activities.filter(a => a.type === type).length
      return acc
    }, {} as Record<string, number>)
    
    return stats
  }, [activities])

  return (
    <div className="space-y-6">
      {/* Real-time Status and Refresh */}
      {enableRealTime && (
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">Live Updates</span>
            </div>
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}

      {/* Activity Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(activityConfig).map(([type, config]) => {
          const Icon = config.icon
          const count = activityStats[type] || 0
          
          return (
            <div key={type} className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span className="text-xs font-medium text-gray-300">{config.label}</span>
              </div>
              <div className={`text-lg font-bold ${config.color}`}>{count}</div>
            </div>
          )
        })}
      </div>

      {/* Search and Filter Controls */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities, users, or bounties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          )}

          {/* Filter and Sort Controls */}
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              {/* Activity Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                    <Filter className="h-4 w-4 mr-2" />
                    {selectedType === 'all' ? 'All Types' : activityConfig[selectedType as keyof typeof activityConfig]?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {activityTypes.map((type) => {
                    const config = type === 'all' ? null : activityConfig[type as keyof typeof activityConfig]
                    const Icon = config?.icon
                    
                    return (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className="text-white hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className={`h-4 w-4 ${config.color}`} />}
                          {type === 'all' ? 'All Types' : config?.label}
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
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
                  variant={sortBy === 'type' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('type')}
                  className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Type
                  {sortBy === 'type' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
                
                <Button
                  variant={sortBy === 'user' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('user')}
                  className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  User
                  {sortBy === 'user' && (
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
          Showing {filteredAndSortedActivities.length} of {activities.length} activities
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

      {/* Activities List */}
      <div className="space-y-3">
        {filteredAndSortedActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No activities found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredAndSortedActivities.map((activity, index) => {
            const config = activityConfig[activity.type]
            const Icon = config.icon
            const isHighPriority = activity.priority === 'high'
            const isRecent = parseTimeAgo(activity.timeAgo) <= 60 // Within last hour
            
            return (
              <div
                key={`${activity.user}-${activity.type}-${index}`}
                className={`
                  group relative p-4 rounded-xl border transition-all duration-500 hover:scale-[1.01]
                  ${config.bgColor} ${config.borderColor}
                  hover:shadow-lg hover:shadow-blue-500/10
                  ${isRecent ? 'ring-1 ring-blue-400/30' : ''}
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.4s ease-out forwards'
                }}
              >
                {/* Priority Badge */}
                {isHighPriority && (
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-red-500 text-white border-0 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      High Priority
                    </Badge>
                  </div>
                )}

                {/* Recent Activity Indicator */}
                {isRecent && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Activity Icon */}
                  <div className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* User Avatar */}
                  <Avatar className="h-10 w-10 ring-1 ring-gray-600">
                    <AvatarImage src={activity.avatar} alt={activity.user} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white text-sm">
                      {activity.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {activity.user}
                      </span>
                      <Badge variant="secondary" className={`text-xs ${config.color} bg-transparent border-current`}>
                        {config.label}
                      </Badge>
                      {activity.amount && (
                        <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          {activity.amount}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2 group-hover:text-gray-200 transition-colors">
                      {activity.message}
                    </p>
                    
                    {activity.bountyTitle && (
                      <p className="text-xs text-gray-400 mb-2 italic">
                        Bounty: {activity.bountyTitle}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {activity.timeAgo}
                      {isRecent && (
                        <span className="ml-2 text-blue-400 font-medium">• Just now</span>
                      )}
                    </div>
                  </div>

                  {/* Trending Indicator for high activity */}
                  {activity.priority === 'high' && (
                    <div className="text-orange-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )
          })
        )}
      </div>

      {/* Load More Button */}
      {activities.length > maxDisplay && filteredAndSortedActivities.length === maxDisplay && (
        <div className="text-center pt-6">
          <Button 
            variant="outline" 
            className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            onClick={() => {/* Implement load more functionality */}}
          >
            Load More Activities
          </Button>
        </div>
      )}
    </div>
  )
}
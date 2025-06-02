"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, ArrowRight, DollarSign, Target, Code, Wrench, FileText, Palette, Video, Package, Users, Briefcase, Lightbulb, Shield } from "lucide-react"
import CardMarkdownRenderer from "@/components/card-markdown-renderer"
import type { Bounty } from "@/lib/types"
import { CategoryTags } from "@/components/category-tag"
import { StatusTag } from "@/components/status-tag"

interface BountyCardProps {
  bounty: Bounty
  onStatusChange?: (id: string, status: string) => Promise<boolean>
  allowStatusChange?: boolean
  index?: number
}

export default function BountyCard({ bounty, onStatusChange, allowStatusChange = false, index = 0 }: BountyCardProps) {
  const router = useRouter()

  // Calculate days left
  const deadline = new Date(bounty.deadline)
  const today = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Check if bounty is closed or in review
  const isClosed = bounty.status === "closed"
  const isInReview = bounty.status === "in-progress"

  // Handle card click
  const handleCardClick = () => {
    router.push(`/bounties/${bounty.id}`)
  }

  // Handle button click without triggering the card click
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    // Handle cases where category might not be a string or might be undefined
    const categoryStr = category ? String(category) : ''
    const mainCategory = categoryStr.split(',')[0]?.trim().toLowerCase()
    switch (mainCategory) {
      case 'engineering':
      case 'development':
      case 'coding':
      case 'programming':
        return { icon: Code, color: 'bg-blue-500' }
      case 'content':
      case 'content creation':
      case 'writing':
      case 'copywriting':
      case 'documentation':
        return { icon: FileText, color: 'bg-green-500' }
      case 'design':
      case 'ui':
      case 'ux':
      case 'graphic':
        return { icon: Palette, color: 'bg-purple-500' }
      case 'media':
      case 'video':
      case 'multimedia':
      case 'animation':
        return { icon: Video, color: 'bg-red-500' }
      case 'product':
      case 'management':
      case 'strategy':
        return { icon: Package, color: 'bg-orange-500' }
      case 'community':
      case 'social':
      case 'marketing':
        return { icon: Users, color: 'bg-pink-500' }
      case 'business':
      case 'finance':
      case 'legal':
        return { icon: Briefcase, color: 'bg-indigo-500' }
      case 'research':
      case 'innovation':
      case 'ideation':
        return { icon: Lightbulb, color: 'bg-yellow-500' }
      case 'security':
      case 'audit':
      case 'testing':
        return { icon: Shield, color: 'bg-gray-500' }
      case 'defi':
        return { icon: DollarSign, color: 'bg-emerald-500' }
      case 'nft':
        return { icon: Target, color: 'bg-violet-500' }
      case 'dao':
        return { icon: Users, color: 'bg-cyan-500' }
      default:
        return { icon: Code, color: 'bg-slate-500' }
    }
  }

  // Get geometric pattern based on index
  const getPattern = (index: number) => {
    const patterns = [
      'bounty-pattern-lines',
      'bounty-pattern-dots',
      'bounty-pattern-triangles',
      'bounty-pattern-waves',
      'bounty-pattern-grid',
      'bounty-pattern-circles'
    ]
    return patterns[index % patterns.length]
  }

  // Get category info
  const categoryInfo = getCategoryIcon(bounty.category)
  const IconComponent = categoryInfo.icon

  // Get urgency status
  const getUrgencyStatus = () => {
    if (isClosed) return { text: "Closed", color: "text-gray-400" }
    if (isInReview) return { text: "In Review", color: "text-yellow-400" }
    if (daysLeft <= 0) return { text: "In Review", color: "text-yellow-400" }
    if (daysLeft <= 7) return { text: "Urgent", color: "text-orange-400" }
    return { text: "Open", color: "text-green-400" }
  }

  const urgencyStatus = getUrgencyStatus()
  const patternClass = getPattern(index)

  return (
    <div
      className="group award-style-card cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${bounty.title}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick()
        }
      }}
    >
      <div className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden h-[420px] transition-all duration-300 group-hover:border-gray-700/70 group-hover:shadow-xl flex flex-col">
        
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className={`w-12 h-12 rounded-xl ${categoryInfo.color} flex items-center justify-center shadow-lg`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${urgencyStatus.color}`}>
              {urgencyStatus.text}
            </span>
          </div>
        </div>

        {/* Content Area - Fixed layout */}
        <div className="">
          {/* Title */}
          <div className="px-6 pb-4 h-[100px]">
            <h3 className="text-xl font-bold text-white leading-tight mb-2 line-clamp-2">
              {bounty.title}
            </h3>
            <CategoryTags categories={bounty.category} size="sm" />
          </div>

          {/* Description */}
          <div className="px-6 pb-6 h-[80px]">
            <div className="h-[2.5rem]">
              <CardMarkdownRenderer
                content={bounty.description}
                className="text-gray-300 text-sm leading-relaxed"
                maxLines={2}
              />
            </div>
          </div>

          {/* Reward and Time Info */}
          <div className="px-6 pb-6 space-y-3 h-[80px]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Reward</span>
              <span className="text-white font-bold">${bounty.reward} USD</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Time Left</span>
              <span className={`font-medium ${urgencyStatus.color}`}>
                {daysLeft <= 0 ? "Expired" : `${daysLeft} days`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button - Always at bottom */}
        <div className="px-6 pb-6 mt-auto">
          <Link href={`/bounties/${bounty.id}`} onClick={handleButtonClick}>
            <Button className="w-full h-10 bg-white text-gray-900 hover:bg-gray-100 font-medium rounded-lg transition-colors duration-200">
              <span className="flex items-center justify-center gap-2">
                View Details
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Decorative Pattern */}
        <div className={`absolute bottom-8 right-0 w-32 h-32 ${patternClass} opacity-20 -z-10`} />
      </div>
    </div>
  )
}

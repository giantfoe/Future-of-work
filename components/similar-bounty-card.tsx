import Link from "next/link"
import { Clock, DollarSign, Target, Code, Wrench, FileText, Palette, Video, Package, Users, Briefcase, Lightbulb, Shield } from "lucide-react"
import type { Bounty } from "@/lib/types"
import { StatusTag } from "@/components/status-tag"

interface SimilarBountyCardProps {
  bounty: Bounty
}

export default function SimilarBountyCard({ bounty }: SimilarBountyCardProps) {
  // Calculate days left
  const deadline = new Date(bounty.deadline)
  const today = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
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

  const categoryInfo = getCategoryIcon(bounty.category)
  const IconComponent = categoryInfo.icon

  // Check if bounty is closed or deadline has passed
  const isClosed = bounty.status === "closed"
  const deadlinePassed = daysLeft <= 0

  // Get status based on the new requirements
  const getUrgencyStatus = () => {
    // If status is explicitly closed, show closed
    if (isClosed) return { text: "Closed", color: "text-gray-400" }
    
    // If status is in-progress OR deadline has passed but not closed, show in review
    if (bounty.status === "in-progress" || deadlinePassed) return { text: "In Review", color: "text-yellow-400" }
    
    // If deadline hasn't been reached and status is open, show open
    return { text: "Open", color: "text-green-400" }
  }

  const urgencyStatus = getUrgencyStatus()
  
  return (
    <Link 
      href={`/bounties/${bounty.id}`} 
      className="group block"
    >
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800/40 rounded-xl p-4 transition-all duration-300 hover:border-blue-500/30 hover:bg-gray-900/90 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.2),0_0_20px_rgba(59,130,246,0.1)]">
        
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-8 h-8 rounded-lg ${categoryInfo.color} flex items-center justify-center shadow-sm`}>
            <IconComponent className="h-4 w-4 text-white" />
          </div>
          <span className={`text-xs font-medium ${urgencyStatus.color}`}>
            {urgencyStatus.text}
          </span>
        </div>

        {/* Title */}
        <div className="mb-3">
          <h4 className="font-semibold text-sm text-white leading-tight mb-1">
            {bounty.title}
          </h4>
          <div className="text-xs text-gray-400">
            {bounty.category ? String(bounty.category).split(',')[0]?.trim() : 'General'}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Reward</span>
            <span className="text-green-400 font-semibold">${bounty.reward}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Time Left
            </span>
            <span className={`font-medium ${urgencyStatus.color}`}>
              {daysLeft <= 0 ? "Expired" : `${daysLeft} days`}
            </span>
          </div>
        </div>

        {/* Subtle decorative element */}
        <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10">
          <div className="w-full h-full bg-gradient-to-tl from-blue-500/30 to-transparent rounded-tl-full"></div>
        </div>
      </div>
    </Link>
  )
} 
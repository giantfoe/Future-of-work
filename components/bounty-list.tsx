import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, ArrowRight, DollarSign, Target, Code, Wrench, FileText, Palette, Video, Package, Users, Briefcase, Lightbulb, Shield } from "lucide-react"
import type { Bounty } from "@/lib/types"
import { CategoryTags } from "@/components/category-tag"
import { StatusTag } from "@/components/status-tag"
import CardMarkdownRenderer from "@/components/card-markdown-renderer"
import BountyCard from "@/components/bounty-card"

interface BountyListProps {
  bounties: Bounty[]
  featured?: boolean
}

export default function BountyList({ bounties, featured = false }: BountyListProps) {
  if (!bounties || bounties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No bounties available at the moment.</h3>
        <p className="text-muted-foreground mt-2">Check back later for new opportunities.</p>
      </div>
    )
  }

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

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {/* This ensures:
          - Mobile: 1 column
          - Tablet: 2 columns  
          - Desktop: 3 columns
      */}
      {bounties.map((bounty) => (
        <BountyCard key={bounty.id} bounty={bounty} />
      ))}
    </div>
  )
}

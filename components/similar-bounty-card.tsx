import Link from "next/link"
import { Clock } from "lucide-react"
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
  
  return (
    <Link 
      href={`/bounties/${bounty.id}`} 
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/10 transition-colors border border-gray-200/20 backdrop-blur-sm"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-medium text-sm text-foreground truncate">
            {bounty.title}
          </div>
          <StatusTag status={bounty.status} size="sm" />
        </div>
        <div className="text-xs text-muted-foreground">
          {Array.isArray(bounty.category) ? bounty.category[0] : bounty.category}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1">
            <span className="text-green-600 font-medium">${bounty.reward}</span>
            <span>USDC</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Due in {daysLeft} days</span>
          </span>
        </div>
      </div>
    </Link>
  )
} 
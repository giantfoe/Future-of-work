export interface Bounty {
  id: string
  title: string
  description: string
  requirements: string
  reward: number
  deadline: string
  category: string // This can be a comma-separated string of categories
  status: "open" | "in-progress" | "closed"
}

export interface BountySubmission {
  id?: string
  fullName: string
  university: string
  bountyId: string
  bountyName: string
  submissionLink: string
  walletAddress: string
  files?: File[]
}

export interface PlatformStats {
  totalEarned: string
  availableOpportunities: number
  totalAvailable: string
  activeUsers: string
  completionRate: number
}

export interface Winner {
  id: string
  name: string
  timeAgo: string
  bountyTitle: string
  category: string
  reward: number
}

export interface Activity {
  id: string
  type: "new_bounty" | "payment" | "application" | "submission" | "other"
  userName?: string
  bountyTitle?: string
  amount?: number
  message?: string
  timeAgo: string
}

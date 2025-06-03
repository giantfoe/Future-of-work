"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  ExternalLink, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react"
import Link from "next/link"

interface UserSubmission {
  id: string
  userName: string
  university: string
  userId: string
  bountyId: string
  bountyName: string
  submissionLink: string
  attachments: any[]
  walletAddress: string
  status: string
  createdAt: string
}

interface UserActivitySectionProps {
  userId: string
}

export default function UserActivitySection({ userId }: UserActivitySectionProps) {
  const [submissions, setSubmissions] = useState<UserSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserSubmissions = async () => {
      try {
        setLoading(true)
        console.log("Fetching submissions for user ID:", userId)
        
        const response = await fetch(`/api/submissions/user?userId=${userId}`)
        const data = await response.json()

        if (data.success) {
          setSubmissions(data.submissions || [])
          console.log("Found", data.submissions?.length || 0, "submissions")
        } else {
          console.error("API error:", data.error)
          setError(data.error || "Failed to fetch submissions")
        }
      } catch (err) {
        console.error("Network error:", err)
        setError("Failed to load your activity")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserSubmissions()
    } else {
      console.log("No user ID provided")
      setLoading(false)
    }
  }, [userId])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "approved":
      case "winner":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
      case "submitted":
      case "under review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "approved":
      case "winner":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
      case "declined":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "pending":
      case "submitted":
      case "under review":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <Card className="glass-card border-[#1F3B54]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#FBF6E8] text-xl relative z-20">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#1F3B54] border-t-[#FBF6E8] rounded-full mx-auto mb-4"></div>
              <p className="text-[#C4C9D2] relative z-20">Loading your activity...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card border-[#1F3B54]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#FBF6E8] text-xl relative z-20">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 relative z-20">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (submissions.length === 0) {
    return (
      <Card className="glass-card border-[#1F3B54]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#FBF6E8] text-xl relative z-20">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1F3B54]/30 flex items-center justify-center">
                <FileText className="w-8 h-8 text-[#C4C9D2]" />
              </div>
              <p className="text-[#C4C9D2] text-lg font-medium mb-2 relative z-20">No submissions yet</p>
              <p className="text-[#C4C9D2]/70 text-sm relative z-20">Your bounty submissions will appear here once you start participating</p>
              <Link href="/bounties">
                <Button className="mt-4 bg-[#5865F2] hover:bg-[#4752C4] relative z-20">
                  Explore Bounties
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-[#1F3B54]">
      <CardHeader className="pb-4">
        <CardTitle className="text-[#FBF6E8] text-xl relative z-20">
          Recent Activity ({submissions.length} submission{submissions.length !== 1 ? 's' : ''})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className="border border-[#1F3B54]/50 rounded-lg p-4 hover:border-[#1F3B54] transition-colors relative z-20"
            >
              {/* Header: Bounty name and status */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#FBF6E8] font-medium text-sm line-clamp-1">
                  {submission.bountyName}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.status)}
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-1 ${getStatusColor(submission.status)}`}
                  >
                    {submission.status}
                  </Badge>
                </div>
              </div>

              {/* Submission details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-[#C4C9D2]">
                  <Calendar className="h-3 w-3" />
                  <span>Submission #{index + 1}</span>
                </div>
                
                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#C4C9D2]">
                    <FileText className="h-3 w-3" />
                    <span>{submission.attachments.length} file{submission.attachments.length !== 1 ? 's' : ''} attached</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {submission.submissionLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs bg-transparent border-[#1F3B54] text-[#C4C9D2] hover:bg-[#1F3B54]/20"
                    asChild
                  >
                    <Link href={submission.submissionLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Submission
                    </Link>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs bg-transparent border-[#1F3B54] text-[#C4C9D2] hover:bg-[#1F3B54]/20"
                  asChild
                >
                  <Link href={`/bounties/${submission.bountyId}`}>
                    <FileText className="h-3 w-3 mr-1" />
                    View Bounty
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {submissions.length > 5 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-[#C4C9D2]/70">Showing recent submissions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { fetchBountyById } from "@/lib/api-client"
import SubmissionForm from "@/components/submission-form"
import { CalendarDays, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Bounty } from "@/lib/types"

interface AirtableBountyDetailProps {
  bountyId: string
}

export default function AirtableBountyDetail({ bountyId }: AirtableBountyDetailProps) {
  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBounty() {
      try {
        setLoading(true)
        const data = await fetchBountyById(bountyId)
        setBounty(data)
        setError(null)
      } catch (err) {
        console.error(`Failed to load bounty ${bountyId}:`, err)
        setError("Failed to load bounty details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadBounty()
  }, [bountyId])

  // Render loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
          <div className="mb-8">
            <Link href="/airtable-bounties" className="text-primary hover:underline mb-4 inline-flex items-center">
              ← Back to Bounties
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bounty Details Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 lg:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Skeleton className="h-6 w-16 mb-3 rounded-full" />
                  <Skeleton className="h-10 w-3/4" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>

              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-32" />
              </div>

              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-8" />
            </div>

            {/* Submission Form Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
              <Skeleton className="h-8 w-48 mb-6" />
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-5 w-28 mb-2" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-5 w-36 mb-2" />
              <Skeleton className="h-10 w-full mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
          <div className="mb-8">
            <Link href="/airtable-bounties" className="text-primary hover:underline mb-4 inline-flex items-center">
              ← Back to Bounties
            </Link>
          </div>

          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Bounty</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  // Render not found state
  if (!bounty) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
          <div className="mb-8">
            <Link href="/airtable-bounties" className="text-primary hover:underline mb-4 inline-flex items-center">
              ← Back to Bounties
            </Link>
          </div>

          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium mb-2">Bounty Not Found</h3>
            <p className="text-muted-foreground mb-4">The bounty you're looking for doesn't exist or has been removed.</p>
            <Link href="/airtable-bounties">
              <Button>View All Bounties</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate days left
  const deadline = new Date(bounty.deadline)
  const today = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-500"
      case "in-progress":
        return "bg-amber-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-black"
    }
  }

  // Render bounty details
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <Link href="/airtable-bounties" className="text-primary hover:underline mb-4 inline-flex items-center">
            ← Back to Bounties
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bounty Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div
                  className={`inline-block ${getStatusColor(bounty.status)} text-white text-xs font-medium px-3.5 py-1.5 rounded-full mb-3`}
                >
                  {bounty.status === "open" ? "Open" : bounty.status === "in-progress" ? "In Progress" : "Completed"}
                </div>
                <h1 className="text-3xl font-bold">{bounty.title}</h1>
              </div>
              <div className="text-2xl font-bold text-primary">${bounty.reward}</div>
            </div>

            <p className="text-muted-foreground mb-6">{bounty.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-2.5" />
                <span>Deadline: {new Date(bounty.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2.5" />
                <span>{daysLeft} days left</span>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <div dangerouslySetInnerHTML={{ __html: bounty.requirements }} />
            </div>

            <div className="lg:hidden">
              <Button
                size="lg"
                className="w-full"
                onClick={() => document.getElementById("submission-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Submit Now
              </Button>
            </div>
          </div>

          {/* Submission Form */}
          <div id="submission-form" className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Submit Your Application</h2>
            <SubmissionForm 
              bountyId={bountyId} 
              bountyName={bounty.title}
              status={bounty.status}
              deadline={bounty.deadline}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

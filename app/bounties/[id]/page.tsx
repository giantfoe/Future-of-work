"use client"

import Link from "next/link"
import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import SubmissionForm from "@/components/submission-form"
import { CalendarDays, Clock, CheckCircle, Award, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import MarkdownRenderer from "@/components/markdown-renderer"
import type { Bounty } from "@/lib/types"
import { CategoryTags } from "@/components/category-tag"
import { StatusTag } from "@/components/status-tag"
import { CountdownTimer } from "@/components/countdown-timer"
import BountyCard from "@/components/bounty-card"
import SimilarBountyCard from "@/components/similar-bounty-card"
import { parseCategories } from "@/components/category-tag"
import FuturisticBackground from "@/components/FuturisticBackground"

export default function BountyDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
  console.log("BountyDetailPage: Initial ID from params", id);
  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deadlinePassed, setDeadlinePassed] = useState(false)
  const [prevBountyId, setPrevBountyId] = useState<string | null>(null)
  const [nextBountyId, setNextBountyId] = useState<string | null>(null)
  const [currentBountyIndex, setCurrentBountyIndex] = useState<number>(0)
  const [totalBounties, setTotalBounties] = useState<number>(0)
  const [allBounties, setAllBounties] = useState<Bounty[]>([])
  const [similarBounties, setSimilarBounties] = useState<Bounty[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First, fetch all bounties to get navigation data
        const allBountiesResponse = await fetch('/api/bounties')
        if (!allBountiesResponse.ok) {
          throw new Error('Failed to fetch bounties')
        }
        const allBountiesData = await allBountiesResponse.json()
        setAllBounties(allBountiesData)
        
        // Find the current bounty in the list
        const currentBounty = allBountiesData.find((b: any) => b.id === id)
        
        if (currentBounty) {
          setBounty(currentBounty)
        } else {
          // If not found in the list, try to fetch individually
          const bountyResponse = await fetch(`/api/bounties/${id}`)
          if (!bountyResponse.ok) {
            throw new Error('Bounty not found')
          }
          const bountyData = await bountyResponse.json()
          setBounty(bountyData)
        }
        
      } catch (err) {
        console.error('Error fetching bounty:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchData()
    }
  }, [id])

  useEffect(() => {
    if (!bounty || !allBounties.length) {
      return;
    }
    
    // Find similar bounties based on category
    const similar = allBounties.filter(b => {
      if (b.id === bounty.id) return false // Exclude current bounty
      if (b.status !== "open") return false // Only show open bounties
      
      // Check if any category matches
      const bountyCategories = Array.isArray(bounty.category) ? bounty.category : [bounty.category]
      const bCategories = Array.isArray(b.category) ? b.category : [b.category]
      
      return bountyCategories.some(cat => bCategories.includes(cat))
    })
    
    // Limit to 2 similar bounties
    const limitedSimilarBounties = similar.slice(0, 2)
    setSimilarBounties(limitedSimilarBounties)

  }, [bounty, allBounties]) // Rerun when bounty or allBounties changes

  // Render loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <FuturisticBackground />
        <div className="relative z-20 py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bounty Details Skeleton */}
              <div className="premium-card rounded-xl p-8 lg:col-span-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Skeleton className="h-6 w-16 mb-3 rounded-full" />
                    <Skeleton className="h-10 w-3/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>

                {/* Category skeleton */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-32 rounded-full" />
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
              <div className="premium-card rounded-xl p-8">
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
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <FuturisticBackground />
        <div className="relative z-20 py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 premium-card rounded-xl">
              <h3 className="text-lg font-medium mb-2 text-foreground">Error Loading Bounty</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="btn-gradient">Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render not found state
  if (!bounty) {
    return (
      <div className="min-h-screen bg-background">
        <FuturisticBackground />
        <div className="relative z-20 py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 premium-card rounded-xl">
              <h3 className="text-lg font-medium mb-2 text-foreground">Bounty not found</h3>
              <p className="text-muted-foreground mb-4">The bounty you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link href="/bounties" className="btn-gradient">
                  Browse Available Bounties
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate days left
  const deadline = new Date(bounty.deadline)
  const today = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Check if bounty is closed or in review - ensure we're correctly identifying the status
  const isClosed = bounty.status === "closed"
  // Check for both "in-progress" and "in review" to be safe
  const isInReview = bounty.status === "in-progress"
  const isOpen = !isClosed && !isInReview && !deadlinePassed

  // Handle deadline expiration
  const handleDeadlineExpire = () => {
    setDeadlinePassed(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <FuturisticBackground />
      <div className="relative z-20 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status Banner for In Review */}
          {isInReview && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-white p-2 rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-300">This bounty is currently under review</h3>
                  <p className="text-sm text-amber-200">
                    This bounty is in review and is not accepting submissions at the moment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Banner for Closed */}
          {isClosed && (
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 mb-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500 text-white p-2 rounded-full">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-300">This bounty has been closed</h3>
                  <p className="text-sm text-gray-400">
                    This bounty has been completed and is no longer accepting submissions.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bounty Details Card */}
              <div className="premium-card p-8">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {/* Use the StatusTag component for consistent status display */}
                    <StatusTag status={bounty.status} className="mb-3" />
                    <h1 className="text-3xl font-bold text-foreground">{bounty.title}</h1>
                  </div>
                  <div className="text-2xl font-bold text-primary">${bounty.reward}</div>
                </div>

                {/* Categories section */}
                <CategoryTags categories={bounty.category} size="lg" showIcon={false} className="mb-3 mt-3" />

                {/* Deadline and Status with Countdown Timer - Added directly beneath category pill */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>
                      <span className="font-medium">Deadline:</span>{" "}
                      {new Date(bounty.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-3">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`${
                            isClosed ? "text-gray-400" : isInReview ? "text-amber-400" : "text-emerald-400"
                          } font-medium`}
                        >
                          {isClosed ? "Closed" : isInReview ? "In Review" : "Open"}
                        </span>
                      </span>
                    </div>

                    {/* Compact Countdown Timer - Only show for open bounties */}
                    {isOpen && <CountdownTimer deadline={bounty.deadline} onExpire={handleDeadlineExpire} compact={true} />}
                  </div>
                </div>

                {/* Use Markdown renderer for description */}
                <MarkdownRenderer content={bounty.description} className="mb-6" />

                {/* Only show this button on mobile for open bounties */}
                {isOpen && (
                  <div className="lg:hidden">
                    <Button
                      size="lg"
                      className="w-full btn-gradient"
                      onClick={() => document.getElementById("submission-form")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Submit Now
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Submission Form Card */}
              <div className="premium-card p-8">
                {isInReview ? (
                  /* In Review Bounty Information */
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Task</h2>
                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-md backdrop-blur-sm">
                      <p className="text-amber-300 font-medium">
                        This bounty is currently under review and is not accepting new submissions.
                      </p>
                    </div>

                    {/* Rest of the in-review content */}
                    <div className="flex items-center gap-2 mb-6">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <p className="text-sm text-muted-foreground">
                        Our team is evaluating existing submissions. New applications cannot be submitted at this time.
                      </p>
                    </div>

                    <div className="border-t border-b border-gray-600 py-4">
                      <h2 className="text-xl font-bold text-foreground mb-4">Overview</h2>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                        <li>Our team reviews all submissions for completeness</li>
                        <li>Submissions are evaluated based on quality and requirements</li>
                        <li>The winner will be notified and payment processed</li>
                      </ol>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">Check out other available opportunities:</p>
                      <Button asChild className="btn-gradient">
                        <Link href="/bounties">Browse Open Bounties</Link>
                      </Button>
                    </div>
                  </div>
                ) : isClosed || deadlinePassed ? (
                  /* Closed Bounty Information */
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Bounty {isClosed ? "Closed" : "Deadline Passed"}</h2>

                    <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-gray-400" />
                        <p className="text-sm text-gray-300">
                          {isClosed
                            ? "This bounty has been completed and is no longer accepting submissions."
                            : "The deadline for this bounty has passed. No new submissions are being accepted."}
                        </p>
                      </div>
                    </div>

                    {isClosed && (
                      <div className="border-t border-b border-gray-600 py-4">
                        <h3 className="font-medium mb-2 text-foreground">Winner</h3>
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-amber-500" />
                          <div>
                            <p className="font-medium text-foreground">Alex Johnson</p>
                            <p className="text-xs text-muted-foreground">Stanford University</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">Check out other available opportunities:</p>
                      <Button asChild className="btn-gradient">
                        <Link href="/bounties">Browse Open Bounties</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Open Bounty - Show Submission Form */
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Submit Your Work</h2>
                    <SubmissionForm
                      bountyId={params.id}
                      bountyName={bounty.title}
                      status={bounty.status}
                      deadline={bounty.deadline}
                      isDetailsPage={true}
                    />
                  </>
                )}
              </div>

              {/* Similar Bounties Section - Moved here */}
              {similarBounties.length > 0 && (
                <div className="premium-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Similar Bounties</h3>
                  <div className="space-y-2">
                    {similarBounties.map(simBounty => (
                      <SimilarBountyCard key={simBounty.id} bounty={simBounty} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View All Bounties button */}
          <div className="mt-12 text-center">
            <Button variant="outline" asChild className="px-6 btn-outline-glass text-white">
              <Link href="/bounties">View All Bounties</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

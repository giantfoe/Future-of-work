"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import SubmissionForm from "@/components/submission-form"
import { CalendarDays, Clock, CheckCircle, Award, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import MarkdownRenderer from "@/components/markdown-renderer"
import type { Bounty } from "@/lib/types"
import { CategoryTags } from "@/components/category-tag"
import { StatusTag } from "@/components/status-tag"
import { CountdownTimer } from "@/components/countdown-timer"

export default function BountyDetailPage({ params }: { params: { id: string } }) {
  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deadlinePassed, setDeadlinePassed] = useState(false)
  const [prevBountyId, setPrevBountyId] = useState<string | null>(null)
  const [nextBountyId, setNextBountyId] = useState<string | null>(null)
  const [currentBountyIndex, setCurrentBountyIndex] = useState<number>(0)
  const [totalBounties, setTotalBounties] = useState<number>(0)
  const [allBounties, setAllBounties] = useState<Bounty[]>([])

  useEffect(() => {
    // First, fetch all bounties to get the navigation context
    async function fetchAllBounties() {
      try {
        const response = await fetch("/api/bounties")
        if (!response.ok) {
          throw new Error("Failed to fetch bounties list")
        }

        const bounties = await response.json()
        setAllBounties(bounties)
        setTotalBounties(bounties.length)

        // Now that we have all bounties, load the current one
        loadCurrentBounty(bounties)
      } catch (error) {
        console.error("Error fetching bounties:", error)
        setError("Failed to load bounties. Please try again.")
        setLoading(false)
      }
    }

    async function loadCurrentBounty(bounties: Bounty[]) {
      try {
        // Find the current bounty in the list
        const currentBounty = bounties.find((b) => b.id === params.id)

        if (!currentBounty) {
          // If we can't find the bounty by ID in our list, try to fetch it directly
          // This handles the case where the user navigates directly to a bounty URL
          const response = await fetch(`/api/bounties/${params.id}`)

          if (!response.ok) {
            throw new Error(`Could not find bounty with ID ${params.id}`)
          }

          const data = await response.json()
          setBounty(data)

          // Since this bounty wasn't in our initial list, we need to add it
          // and recalculate the navigation
          const updatedBounties = [...bounties, data]
          setAllBounties(updatedBounties)
          setTotalBounties(updatedBounties.length)

          // Find the index now that we've added it
          const currentIndex = updatedBounties.findIndex((b) => b.id === params.id)
          setCurrentBountyIndex(currentIndex)

          // Set previous and next bounty IDs
          if (currentIndex > 0) {
            setPrevBountyId(updatedBounties[currentIndex - 1].id)
          }

          if (currentIndex < updatedBounties.length - 1) {
            setNextBountyId(updatedBounties[currentIndex + 1].id)
          }
        } else {
          // We found the bounty in our list
          setBounty(currentBounty)

          // Find the index of the current bounty
          const currentIndex = bounties.findIndex((b) => b.id === params.id)
          setCurrentBountyIndex(currentIndex)

          // Set previous and next bounty IDs
          if (currentIndex > 0) {
            setPrevBountyId(bounties[currentIndex - 1].id)
          }

          if (currentIndex < bounties.length - 1) {
            setNextBountyId(bounties[currentIndex + 1].id)
          }
        }

        // Check if deadline has passed
        const deadline = new Date(currentBounty?.deadline || Date.now())
        const now = new Date()
        setDeadlinePassed(now > deadline)
      } catch (err) {
        console.error(`Error loading bounty ${params.id}:`, err)
        setError(err instanceof Error ? err.message : "Failed to load bounty")
      } finally {
        setLoading(false)
      }
    }

    fetchAllBounties()
  }, [params.id])

  // Render loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bounty Details Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 lg:col-span-2">
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
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Bounty</h3>
            <p className="text-gray-500 mb-4">{error}</p>
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
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium mb-2">Bounty not found</h3>
            <p className="text-gray-500 mb-4">The bounty you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/bounties">Browse Available Bounties</Link>
            </Button>
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
  const isInReview = bounty.status === "in-progress" || bounty.status === "in review"
  const isOpen = !isClosed && !isInReview && !deadlinePassed

  // Handle deadline expiration
  const handleDeadlineExpire = () => {
    setDeadlinePassed(true)
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
        {/* Status Banner for In Review */}
        {isInReview && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-white p-2 rounded-full">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-amber-800">This bounty is currently under review</h3>
                <p className="text-sm text-amber-700">
                  This bounty is in review and is not accepting submissions at the moment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Banner for Closed */}
        {isClosed && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gray-500 text-white p-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">This bounty has been closed</h3>
                <p className="text-sm text-gray-700">
                  This bounty has been completed and is no longer accepting submissions.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bounty Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 lg:col-span-2">
            <div className="flex items-start justify-between mb-3">
              <div>
                {/* Use the StatusTag component for consistent status display */}
                <StatusTag status={bounty.status} className="mb-3" />
                <h1 className="text-3xl font-bold">{bounty.title}</h1>
              </div>
              <div className="text-2xl font-bold text-primary">${bounty.reward}</div>
            </div>

            {/* Categories section */}
            <CategoryTags categories={bounty.category} size="lg" showIcon={false} className="mb-3 mt-3" />

            {/* Deadline and Status with Countdown Timer - Added directly beneath category pill */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 text-sm">
              <div className="flex items-center text-gray-600">
                <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
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
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`${
                        isClosed ? "text-gray-600" : isInReview ? "text-amber-600" : "text-emerald-600"
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
                  className="w-full"
                  onClick={() => document.getElementById("submission-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Submit Now
                </Button>
              </div>
            )}
          </div>

          {/* Right sidebar - conditionally show submission form or status info */}
          <div id="submission-form" className="bg-white rounded-xl shadow-sm border p-6 md:p-8 sticky top-6 h-fit">
            {isInReview ? (
              /* In Review Bounty Information */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Submissions Disabled</h2>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
                  <p className="text-amber-800 font-medium">
                    This bounty is currently under review and is not accepting new submissions.
                  </p>
                </div>

                {/* Rest of the in-review content */}
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-sm text-gray-700">
                    Our team is evaluating existing submissions. New applications cannot be submitted at this time.
                  </p>
                </div>

                <div className="border-t border-b py-4">
                  <h3 className="font-medium mb-3">Review Process</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                    <li>Our team reviews all submissions for completeness</li>
                    <li>Submissions are evaluated based on quality and requirements</li>
                    <li>The winner will be notified and payment processed</li>
                  </ol>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">Check out other available opportunities:</p>
                  <Button className="w-full" asChild>
                    <Link href="/bounties">Browse Open Bounties</Link>
                  </Button>
                </div>
              </div>
            ) : isClosed || deadlinePassed ? (
              /* Closed Bounty Information */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Bounty {isClosed ? "Closed" : "Deadline Passed"}</h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-gray-500" />
                    <p className="text-sm text-gray-800">
                      {isClosed
                        ? "This bounty has been completed and is no longer accepting submissions."
                        : "The deadline for this bounty has passed. No new submissions are being accepted."}
                    </p>
                  </div>
                </div>

                {isClosed && (
                  <div className="border-t border-b py-4">
                    <h3 className="font-medium mb-2">Winner</h3>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">Alex Johnson</p>
                        <p className="text-xs text-gray-500">Stanford University</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">Check out other available opportunities:</p>
                  <Button className="w-full" asChild>
                    <Link href="/bounties">Browse Open Bounties</Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Open Bounty - Show Submission Form */
              <>
                <h2 className="text-2xl font-bold mb-6">Submit Your Application</h2>
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
        </div>

        {/* Bounty Navigation */}
        <div className="mt-12 border-t pt-6">
          {/* Pagination with numbered page links */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-50 rounded-lg shadow-sm py-2 px-4 w-full max-w-md mx-auto">
              <div className="flex items-center justify-center">
                {/* Previous button */}
                <div>
                  {prevBountyId ? (
                    <Link
                      href={`/bounties/${prevBountyId}`}
                      className="flex items-center text-primary hover:underline group px-3 py-1"
                    >
                      <ChevronLeft className="h-5 w-5 mr-1 transition-transform group-hover:-translate-x-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Link>
                  ) : (
                    <span className="text-gray-400 flex items-center cursor-not-allowed px-3 py-1">
                      <ChevronLeft className="h-5 w-5 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </span>
                  )}
                </div>

                {/* Page numbers */}
                <div className="flex items-center space-x-1 mx-2">
                  {allBounties.length > 0 && (
                    <>
                      {allBounties.slice(0, Math.min(5, allBounties.length)).map((b, index) => (
                        <Link
                          key={b.id}
                          href={`/bounties/${b.id}`}
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors
                            ${
                              b.id === params.id
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          aria-current={b.id === params.id ? "page" : undefined}
                        >
                          {index + 1}
                        </Link>
                      ))}

                      {allBounties.length > 5 && <span className="text-gray-500 px-1">...</span>}
                    </>
                  )}
                </div>

                {/* Next button */}
                <div>
                  {nextBountyId ? (
                    <Link
                      href={`/bounties/${nextBountyId}`}
                      className="flex items-center text-primary hover:underline group px-3 py-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="text-gray-400 flex items-center cursor-not-allowed px-3 py-1">
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bounty position indicator */}
            {totalBounties > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Bounty {currentBountyIndex + 1} of {totalBounties}
                </p>
              </div>
            )}

            {/* View All Bounties button */}
            <div className="mt-4">
              <Button variant="outline" asChild className="px-6">
                <Link href="/bounties">View All Bounties</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

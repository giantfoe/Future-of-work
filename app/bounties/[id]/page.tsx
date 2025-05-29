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
import { parseCategories } from "@/components/category-tag"

export default function BountyDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
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
        const currentBounty = bounties.find((b) => b.id === id)

        if (!currentBounty) {
          // If we can't find the bounty by ID in our list, try to fetch it directly
          // This handles the case where the user navigates directly to a bounty URL
          const response = await fetch(`/api/bounties/${id}`)

          if (!response.ok) {
            throw new Error(`Could not find bounty with ID ${id}`)
          }

          const data = await response.json()
          setBounty(data)

          // Since this bounty wasn't in our initial list, we need to add it
          // and recalculate the navigation
          const updatedBounties = [...bounties, data]
          setAllBounties(updatedBounties)
          setTotalBounties(updatedBounties.length)

          // Find the index now that we've added it
          const currentIndex = updatedBounties.findIndex((b) => b.id === id)
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
          const currentIndex = bounties.findIndex((b) => b.id === id)
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
        // Ensure currentBounty is defined before accessing its properties
        const deadlineSource = currentBounty ? currentBounty.deadline : (bounty ? bounty.deadline : Date.now());
        const deadline = new Date(deadlineSource);
        const now = new Date()
        setDeadlinePassed(now > deadline)
      } catch (err) {
        console.error(`Error loading bounty ${id}:`, err)
        setError(err instanceof Error ? err.message : "Failed to load bounty")
      } finally {
        setLoading(false)
      }
    }

    fetchAllBounties()
  }, [id])

  useEffect(() => {
    if (!bounty || !allBounties.length) return

    // Extract categories from the current bounty
    const currentBountyCategories = parseCategories(bounty.category).map(cat => cat.toLowerCase().replace(/\s+/g, '-'))

    // Filter for similar bounties
    const filteredSimilarBounties = allBounties.filter(item => {
      // Exclude the current bounty
      if (item.id === bounty.id) return false

      // Check if any category overlaps
      const itemCategories = parseCategories(item.category).map(cat => cat.toLowerCase().replace(/\s+/g, '-'))
      return currentBountyCategories.some(cat => itemCategories.includes(cat))
    })

    // Limit to a maximum of 3 and shuffle for variety
    const limitedSimilarBounties = filteredSimilarBounties.sort(() => 0.5 - Math.random()).slice(0, 3)

    setSimilarBounties(limitedSimilarBounties)

  }, [bounty, allBounties]) // Rerun when bounty or allBounties changes

  // Render loading skeleton
  if (loading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen py-12">
        <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bounty Details Skeleton */}
            <div className="glass-card rounded-lg p-8 lg:col-span-2">
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
            <div className="glass-card rounded-lg p-8">
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
      <div className="bg-[#0A0A0A] min-h-screen py-12">
        <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
          <div className="text-center py-12 glass-card rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-[#FBF6E8]">Error Loading Bounty</h3>
            <p className="text-[#C4C9D2] mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  // Render not found state
  if (!bounty) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen py-12">
        <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
          <div className="text-center py-12 glass-card rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-[#FBF6E8]">Bounty not found</h3>
            <p className="text-[#C4C9D2]/40 mb-4">The bounty you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/bounties" className="bg-[#FBF6E8] text-[#091C2E] rounded-md transition-colors duration-200 ease-in-out hover:bg-[#f8eed7]">
                Browse Available Bounties
              </Link>
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
const isInReview = bounty.status === "in-progress"
  const isOpen = !isClosed && !isInReview && !deadlinePassed

  // Handle deadline expiration
  const handleDeadlineExpire = () => {
    setDeadlinePassed(true)
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen py-12">
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
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bounty Details Card */}
            <div className="glass-card rounded-lg p-8">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {/* Use the StatusTag component for consistent status display */}
                  <StatusTag status={bounty.status} className="mb-3" />
                  <h1 className="text-3xl font-bold text-[#FBF6E8]">{bounty.title}</h1>
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
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Submission Form Card */}
            <div className="glass-card rounded-lg p-8">
              {isInReview ? (
                /* In Review Bounty Information */
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#FBF6E8] mb-4">Task</h2>
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
                    <h2 className="text-xl font-bold text-[#FBF6E8] mb-4">Overview</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                      <li>Our team reviews all submissions for completeness</li>
                      <li>Submissions are evaluated based on quality and requirements</li>
                      <li>The winner will be notified and payment processed</li>
                    </ol>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">Check out other available opportunities:</p>
                    <Button asChild className="bg-[#FBF6E8] text-[#091C2E] rounded-md transition-colors duration-200 ease-in-out hover:bg-[#f8eed7]">
                      <Link href="/bounties">Browse Open Bounties</Link>
                    </Button>
                  </div>
                </div>
              ) : isClosed || deadlinePassed ? (
                /* Closed Bounty Information */
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#FBF6E8] mb-4">Bounty {isClosed ? "Closed" : "Deadline Passed"}</h2>

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
                    <Button asChild className="bg-[#FBF6E8] text-[#091C2E] rounded-md transition-colors duration-200 ease-in-out hover:bg-[#f8eed7]">
                      <Link href="/bounties">Browse Open Bounties</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Open Bounty - Show Submission Form */
                <>
                  <h2 className="text-2xl font-bold text-[#FBF6E8] mb-6">Submit Your Work</h2>
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
        </div>

        {/* Similar Bounties Section */}
        {similarBounties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#FBF6E8] mb-6 text-center">Similar Bounties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarBounties.map(simBounty => (
                <BountyCard key={simBounty.id} bounty={simBounty} />
              ))}
            </div>
          </div>
        )}

        {/* View All Bounties button - kept from original pagination section */}
        <div className="mt-12 text-center">
          <Button variant="outline" asChild className="px-6 bg-transparent border border-[#FBF6E8] text-[#FBF6E8] rounded-md transition-colors duration-200 hover:bg-[#FBF6E8] hover:text-[#091C2E]">
            <Link href="/bounties">View All Bounties</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

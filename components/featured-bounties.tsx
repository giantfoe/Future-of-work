"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock } from "lucide-react"
import CardMarkdownRenderer from "@/components/card-markdown-renderer"
import type { Bounty } from "@/lib/types"
import { CategoryTags } from "@/components/category-tag"
import { StatusTag } from "@/components/status-tag"

interface FeaturedBountiesProps {
  bounties: Bounty[]
}

export default function FeaturedBounties({ bounties }: FeaturedBountiesProps) {
  const router = useRouter()

  if (!bounties || bounties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No bounties available at the moment.</h3>
        <p className="text-gray-500 mt-2">Check back later for new opportunities.</p>
      </div>
    )
  }

  // Handle card click
  const handleCardClick = (bountyId: string) => {
    router.push(`/bounties/${bountyId}`)
  }

  // Handle button click without triggering the card click
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent the card click from triggering
    // The Link component will handle the navigation
  }

  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-[1200px] mx-auto">
      {bounties.map((bounty) => {
        // Calculate days left
        const deadline = new Date(bounty.deadline)
        const today = new Date()
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        // Check if bounty is closed or in review
        const isClosed = bounty.status === "closed"
        const isInReview = bounty.status === "in-progress"

        return (
          <div
            key={bounty.id}
            className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden h-auto flex flex-col cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:border-gray-300 font-sans"
            onClick={() => handleCardClick(bounty.id)}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${bounty.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCardClick(bounty.id)
              }
            }}
          >
            {/* Content container */}
            <div className="relative z-10 p-6 flex flex-col flex-1">
              {/* Status and Category Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4 font-sans">
                <StatusTag status={bounty.status} />
                <CategoryTags categories={bounty.category} size="sm" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 leading-tight font-sans">
                {bounty.title}
              </h3>

              {/* Description */}
              <CardMarkdownRenderer
                content={bounty.description}
                className="text-gray-600 mb-6 leading-relaxed font-sans text-sm"
                maxLines={3}
              />

              {/* Reward Section */}
              <div className="mb-4">
                <div className="inline-flex items-center">
                  <span className="text-lg font-bold text-black border-2 border-black rounded-full px-4 py-1 font-sans">
                    ${bounty.reward} USD
                  </span>
                </div>
              </div>

              {/* Deadline display */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 font-sans">Deadline</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 font-sans">
                    {new Date(bounty.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 font-sans">Time Remaining</span>
                  </div>
                  <span
                    className={`text-sm font-medium font-sans ${
                      isClosed || isInReview
                        ? "text-gray-600"
                        : daysLeft <= 0
                          ? "text-red-600"
                          : daysLeft <= 7
                            ? "text-red-600"
                            : daysLeft <= 14
                              ? "text-amber-600"
                              : "text-green-600"
                    }`}
                  >
                    {isClosed
                      ? "Closed"
                      : isInReview
                        ? "In Review"
                        : daysLeft <= 0
                          ? `${Math.abs(daysLeft)} days left`
                          : `${daysLeft} days left`}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="relative z-10 p-6 pt-0">
              <Link href={`/bounties/${bounty.id}`} onClick={handleButtonClick}>
                <Button
                  variant="default"
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-all duration-300 border-0 font-sans"
                >
                  {bounty.status === "closed" ? "View Details" : "Submit Now"}
                </Button>
              </Link>
            </div>

            {/* Invisible overlay to make the entire card clickable */}
            <span className="absolute inset-0 z-0" aria-hidden="true"></span>
          </div>
        )
      })}
    </div>
  )
}

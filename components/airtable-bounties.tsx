"use client"

import { useState, useEffect } from "react"
import { fetchBounties } from "@/lib/airtable-client"
import BountyCard from "@/components/bounty-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Bounty } from "@/lib/types"

export default function AirtableBounties() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBounties() {
      try {
        setLoading(true)
        const data = await fetchBounties()
        setBounties(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load bounties:", err)
        setError("Failed to load bounties. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadBounties()
  }, [])

  // Render loading skeletons
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden bg-white h-full flex flex-col">
            <div className="p-6 flex-1">
              <div className="mb-4">
                <Skeleton className="h-6 w-16 mb-3 rounded-full" />
                <Skeleton className="h-7 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <div className="space-y-2 mt-4">
                <Skeleton className="h-5 w-24" />
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Bounties</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Render empty state
  if (bounties.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-2">No Bounties Available</h3>
        <p className="text-muted-foreground">Check back later for new opportunities.</p>
      </div>
    )
  }

  // Render bounties
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bounties.map((bounty) => (
        <BountyCard key={bounty.id} bounty={bounty} />
      ))}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { StatusFilter } from "@/components/status-filter"
import { StatusLegend } from "@/components/status-legend"
import BountyCard from "@/components/bounty-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { Bounty } from "@/lib/types"

// Add imports for the new components
import { SyncButton } from "@/components/sync-button"
import { LastSynced } from "@/components/last-synced"
import { AutoSync } from "@/components/auto-sync"

export default function AirtableBountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [filteredBounties, setFilteredBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"open" | "in-progress" | "closed" | null>(null)

  // Fetch bounties
  const fetchBounties = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/airtable")

      if (!response.ok) {
        throw new Error(`Failed to fetch bounties: ${response.status}`)
      }

      const data = await response.json()
      setBounties(data)
      setFilteredBounties(data)
      setError(null)
    } catch (err) {
      console.error("Failed to load bounties:", err)
      setError(err instanceof Error ? err.message : "Failed to load bounties")
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchBounties()
  }, [])

  // Filter bounties when status filter changes
  useEffect(() => {
    if (statusFilter) {
      setFilteredBounties(bounties.filter((bounty) => bounty.status === statusFilter))
    } else {
      setFilteredBounties(bounties)
    }
  }, [statusFilter, bounties])

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bounties/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`)
      }

      // Update the bounty in the local state
      setBounties((prevBounties) =>
        prevBounties.map((bounty) => (bounty.id === id ? { ...bounty, status: newStatus } : bounty)),
      )

      return true
    } catch (error) {
      console.error("Error updating bounty status:", error)
      throw error
    }
  }

  // Calculate status counts
  const statusCounts = {
    open: bounties.filter((b) => b.status === "open").length,
    inProgress: bounties.filter((b) => b.status === "in-progress").length,
    closed: bounties.filter((b) => b.status === "closed").length,
  }

  // Enable auto-sync with a 5-second interval
  return (
    <div className="min-h-screen bg-white py-12">
      {/* Add AutoSync component with refresh callback */}
      <AutoSync interval={5000} onSync={fetchBounties} />

      <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Airtable Bounties</h1>
            <p className="text-gray-500">
              These bounties are fetched directly from Airtable using the real API integration.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <SyncButton onSuccess={fetchBounties} />
            <LastSynced className="mt-2" />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
        ) : error ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Bounties</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => fetchBounties()}>Try Again</Button>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium mb-2">No Bounties Available</h3>
            <p className="text-gray-500">No bounties were found in the Airtable database.</p>
            <p className="text-gray-500 mt-2">
              Try adding some bounties to your Airtable base or check your environment variables.
            </p>
          </div>
        ) : (
          <>
            {/* Status Legend */}
            <StatusLegend />

            {/* Status Filter */}
            <StatusFilter counts={statusCounts} onFilterChange={setStatusFilter} currentFilter={statusFilter} />

            {filteredBounties.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-lg font-medium mb-2">No Bounties Match Filter</h3>
                <p className="text-gray-500 mb-4">Try selecting a different status filter.</p>
                <Button onClick={() => setStatusFilter(null)}>Show All Bounties</Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBounties.map((bounty) => (
                  <BountyCard
                    key={bounty.id}
                    bounty={bounty}
                    onStatusChange={handleStatusChange}
                    allowStatusChange={true}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

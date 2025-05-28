"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Bounty } from "@/lib/types"

export default function StatusDebugPage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const response = await fetch("/api/bounties")
        const data = await response.json()
        setBounties(data)

        // Count statuses
        const counts: Record<string, number> = {}
        data.forEach((bounty: Bounty) => {
          const status = String(bounty.status || "unknown").toLowerCase()
          counts[status] = (counts[status] || 0) + 1
        })
        setStatusCounts(counts)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching bounties:", error)
        setLoading(false)
      }
    }

    fetchBounties()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Status Debug Page</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status Counts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading status counts...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-sm">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">All Bounties with Status</h2>

      {loading ? (
        <p>Loading bounties...</p>
      ) : (
        <div className="grid gap-4">
          {bounties.map((bounty) => (
            <Card key={bounty.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{bounty.title}</h3>
                    <p className="text-sm text-gray-500">ID: {bounty.id}</p>
                  </div>
                  <Badge>{bounty.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button onClick={() => (window.location.href = "/bounties")}>Back to Bounties</Button>
      </div>
    </div>
  )
}

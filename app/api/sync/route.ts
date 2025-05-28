import { NextResponse } from "next/server"
import { getBounties } from "@/lib/airtable-service"

// Store the last known state
let lastKnownBounties: any[] = []
let lastSyncTimestamp: string | null = null

/**
 * POST /api/sync
 * Syncs data from Airtable to the application
 */
export async function POST(request: Request) {
  try {
    // Check for admin API key for protected routes
    const authHeader = request.headers.get("authorization")
    const apiKey = process.env.ADMIN_API_KEY

    // If ADMIN_API_KEY is set, require authentication
    if (apiKey && (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the latest data from Airtable
    const bounties = await getBounties()
    const timestamp = new Date().toISOString()

    // Check if there are changes
    let hasChanges = false

    // If this is the first sync, consider it a change
    if (lastKnownBounties.length === 0) {
      hasChanges = true
    } else if (bounties.length !== lastKnownBounties.length) {
      // Different number of bounties means there are changes
      hasChanges = true
    } else {
      // Compare each bounty to see if there are changes
      for (let i = 0; i < bounties.length; i++) {
        const newBounty = bounties[i]
        const oldBounty = lastKnownBounties.find((b) => b.id === newBounty.id)

        if (!oldBounty) {
          // New bounty found
          hasChanges = true
          break
        }

        // Check if any fields have changed
        if (
          newBounty.title !== oldBounty.title ||
          newBounty.description !== oldBounty.description ||
          newBounty.requirements !== oldBounty.requirements ||
          newBounty.reward !== oldBounty.reward ||
          newBounty.deadline !== oldBounty.deadline ||
          newBounty.category !== oldBounty.category ||
          newBounty.status !== oldBounty.status
        ) {
          hasChanges = true
          break
        }
      }
    }

    // Update the last known state
    lastKnownBounties = bounties
    lastSyncTimestamp = timestamp

    return NextResponse.json({
      success: true,
      message: hasChanges ? "Changes detected and synced" : "No changes detected",
      timestamp,
      count: bounties.length,
      hasChanges,
    })
  } catch (error) {
    console.error("Error syncing data:", error)
    return NextResponse.json(
      { error: "Failed to sync data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

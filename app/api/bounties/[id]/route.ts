import { NextResponse } from "next/server"
import { getBountyById } from "@/lib/airtable-service"

/**
 * GET /api/bounties/[id]
 * Fetches a single bounty by ID from Airtable
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`API route: Fetching bounty with ID ${id}`)

    // Add cache control headers for better performance
    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    }

    const bounty = await getBountyById(id)

    if (!bounty) {
      console.log(`API route: Bounty with ID ${id} not found`)
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 })
    }

    console.log(`API route: Successfully fetched bounty ${id}`)
    return NextResponse.json(bounty, { headers })
  } catch (error) {
    console.error(`Error in bounty/${params.id} API route:`, error)
    return NextResponse.json(
      { error: "Failed to fetch bounty", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { getBounties } from "@/lib/airtable-service"

/**
 * GET /api/bounties
 * Fetches all bounties from Airtable
 */
export async function GET() {
  try {
    console.log("API route: Fetching all bounties")

    // Add cache control headers for better performance
    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    }

    const bounties = await getBounties()
    console.log(`API route: Successfully fetched ${bounties.length} bounties`)

    return NextResponse.json(bounties, { headers })
  } catch (error) {
    console.error("Error in bounties API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch bounties", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

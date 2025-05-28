import { NextResponse } from "next/server"
import type { Bounty } from "@/lib/types"

// Base URL for Airtable API
const AIRTABLE_API_URL = "https://api.airtable.com/app15IobIPfU3YDf0/tblakfzUZvuvWKbdI"

/**
 * GET /api/airtable/[id]
 * Fetches a specific bounty by ID from Airtable
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get environment variables
    const baseId = process.env.AIRTABLE_BASE_ID
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN
    const bountiesTable = process.env.AIRTABLE_BOUNTIES_TABLE_ID || "Bounties"

    // Validate environment variables
    if (!baseId || !accessToken) {
      console.error("Missing required environment variables: AIRTABLE_BASE_ID or AIRTABLE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Server configuration error. Missing Airtable credentials." }, { status: 500 })
    }

    console.log(`Fetching bounty with ID: ${id}`)

    // Fetch the bounty from Airtable
    const response = await fetch(`${AIRTABLE_API_URL}/${baseId}/${bountiesTable}/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`Error fetching bounty ${id}:`, errorData)

      if (response.status === 404) {
        return NextResponse.json({ error: "Bounty not found" }, { status: 404 })
      }

      return NextResponse.json(
        { error: "Failed to fetch bounty from Airtable", details: errorData },
        { status: response.status },
      )
    }

    const record = await response.json()

    // Transform the Airtable record to our Bounty type
    const bounty: Bounty = {
      id: record.id,
      title: record.fields.Title || "Untitled Bounty",
      description: record.fields.Description || "",
      requirements: record.fields.Requirements || "",
      reward: Number(record.fields.Reward) || 0,
      deadline: record.fields.Deadline || new Date().toISOString(),
      category: record.fields.Category || "Other",
      status: record.fields.Status?.toLowerCase() || "open",
    }

    // Add cache control headers for better performance
    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    }

    return NextResponse.json(bounty, { headers })
  } catch (error) {
    console.error(`Error in GET /api/airtable/${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch bounty", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

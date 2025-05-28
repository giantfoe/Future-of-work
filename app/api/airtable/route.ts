import { NextResponse } from "next/server"
import type { Bounty, BountySubmission } from "@/lib/types"

// Base URL for Airtable API
const AIRTABLE_API_URL = "https://api.airtable.com/v0"

/**
 * Sanitize and prepare Markdown content from Airtable
 */
function sanitizeMarkdownContent(content: string | undefined): string {
  if (!content) return ""

  // If content is already in Markdown format, return it as is
  if (typeof content === "string" && !content.startsWith("<")) {
    return content
  }

  // If content is in HTML format (from Airtable rich text), return it as is
  // Our Markdown renderer can handle HTML with rehype-raw
  return content
}

/**
 * GET /api/airtable
 * Fetches bounties from Airtable
 */
export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    // Get environment variables
    const baseId = process.env.AIRTABLE_BASE_ID
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN
    const bountiesTable = process.env.AIRTABLE_BOUNTIES_TABLE_ID || "tblakfzUZvuvWKbdI"

    // Validate environment variables
    if (!baseId || !accessToken) {
      console.error("Missing required environment variables: AIRTABLE_BASE_ID or AIRTABLE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Server configuration error. Missing Airtable credentials." }, { status: 500 })
    }

    // Set up headers for Airtable API requests
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }

    // If an ID is provided, return a specific bounty
    if (id) {
      console.log(`Fetching bounty with ID: ${id}`)

      const response = await fetch(`${AIRTABLE_API_URL}/${baseId}/${bountiesTable}/${id}`, {
        headers,
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

      return NextResponse.json(bounty)
    }

    // Otherwise, return all bounties
    console.log("Fetching all bounties")

    // Build query parameters
    const params = new URLSearchParams()

    // Add sorting by deadline
    params.append("sort[0][field]", "Deadline")
    params.append("sort[0][direction]", "asc")

    // Specify fields to return
    const fields = ["Title", "Description", "Requirements", "Reward", "Deadline", "Category", "Status"]
    fields.forEach((field) => {
      params.append("fields[]", field)
    })

    const response = await fetch(`${AIRTABLE_API_URL}/${baseId}/${bountiesTable}?${params.toString()}`, {
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error fetching bounties:", errorData)

      return NextResponse.json(
        { error: "Failed to fetch bounties from Airtable", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Transform the Airtable records to our Bounty type
    const bounties: Bounty[] = data.records.map((record: any) => ({
      id: record.id,
      title: record.fields.Title || record.fields.Tiltle || "Untitled Bounty",
      description: sanitizeMarkdownContent(record.fields.Description || ""),
      requirements: sanitizeMarkdownContent(record.fields.Requirements || ""),
      reward: Number(record.fields.Reward || record.fields.Rewards) || 0,
      deadline: record.fields.Deadline || new Date().toISOString(),
      category: record.fields.Category || "Other",
      status: ((record.fields.Status || record.fields.Select || "open") as string).toLowerCase(),
    }))

    // Add cache control headers for better performance
    const headers_response = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    }

    return NextResponse.json(bounties, { headers: headers_response })
  } catch (error) {
    console.error("Error in GET /api/airtable:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

/**
 * POST /api/airtable
 * Submits a bounty application to Airtable
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const submission: BountySubmission = await request.json()

    // Get environment variables
    const baseId = process.env.AIRTABLE_BASE_ID
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN
    const submissionsTable = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || "Submissions"

    // Validate environment variables
    if (!baseId || !accessToken) {
      console.error("Missing required environment variables: AIRTABLE_BASE_ID or AIRTABLE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Server configuration error. Missing Airtable credentials." }, { status: 500 })
    }

    // Validate the submission
    if (
      !submission.fullName ||
      !submission.university ||
      !submission.bountyId ||
      !submission.bountyName ||
      !submission.submissionLink ||
      !submission.walletAddress
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Prepare data for Airtable
    const submissionData = {
      fields: {
        "Full Name": submission.fullName,
        University: submission.university,
        "Bounty ID": submission.bountyId,
        "Bounty Name": submission.bountyName,
        "Submission Link": submission.submissionLink,
        "Wallet Address": submission.walletAddress,
      },
    }

    console.log("Submitting application to Airtable:", submissionData)

    // Send to Airtable
    const response = await fetch(`${AIRTABLE_API_URL}/${baseId}/${submissionsTable}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error submitting to Airtable:", errorData)

      return NextResponse.json(
        { error: "Failed to submit application to Airtable", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Submission successful:", data)

    return NextResponse.json({
      success: true,
      message: "Submission received successfully",
      id: data.id,
    })
  } catch (error) {
    console.error("Error in POST /api/airtable:", error)
    return NextResponse.json(
      { error: "Failed to process submission", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

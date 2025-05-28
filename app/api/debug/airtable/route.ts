import { NextResponse } from "next/server"
import { debugAirtableConnection } from "@/lib/airtable-service"

/**
 * GET /api/debug/airtable
 * Debug endpoint to check Airtable configuration and connectivity
 */
export async function GET() {
  try {
    // Check environment variables
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN || process.env.ADMIN_API_KEY
    const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID

    const config = {
      accessTokenExists: !!accessToken,
      accessTokenFirstChars: accessToken
        ? `${accessToken.substring(0, 8)}...${accessToken.substring(accessToken.length - 8)}`
        : null,
      baseId: process.env.AIRTABLE_BASE_ID || "app15IobIPfU3YDf0",
      bountiesTableId: process.env.AIRTABLE_BOUNTIES_TABLE_ID || "tblakfzUZvuvWKbdI",
      submissionsTableId,
    }

    // Test connection to Airtable
    const connectionResult = await debugAirtableConnection()

    return NextResponse.json({
      config,
      connectionStatus: connectionResult.success ? "Success" : "Failed",
      connectionDetails: connectionResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      {
        error: "Failed to check Airtable configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

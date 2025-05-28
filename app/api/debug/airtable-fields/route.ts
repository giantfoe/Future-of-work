import { NextResponse } from "next/server"
import Airtable from "airtable"

/**
 * GET /api/debug/airtable-fields
 * Debug endpoint to check Airtable field names
 */
export async function GET() {
  try {
    // Get environment variables
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN || process.env.ADMIN_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID || "app15IobIPfU3YDf0"
    const tableId = process.env.AIRTABLE_BOUNTIES_TABLE_ID || "tblakfzUZvuvWKbdI"

    if (!accessToken) {
      return NextResponse.json({ error: "AIRTABLE_ACCESS_TOKEN is not defined" }, { status: 500 })
    }

    // Configure Airtable
    Airtable.configure({
      apiKey: accessToken,
    })

    const base = Airtable.base(baseId)

    // Fetch a single record to examine its structure
    const records = await base(tableId)
      .select({
        maxRecords: 1,
      })
      .firstPage()

    if (records.length === 0) {
      return NextResponse.json({ error: "No records found in the table" }, { status: 404 })
    }

    // Get the first record
    const record = records[0]

    // Extract field names and their values
    const fields = Object.keys(record.fields).map((key) => ({
      name: key,
      value: record.fields[key],
      type: typeof record.fields[key],
    }))

    return NextResponse.json({
      success: true,
      recordId: record.id,
      fields,
      rawRecord: {
        id: record.id,
        fields: record.fields,
      },
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch Airtable fields",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

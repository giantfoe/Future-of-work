import { NextResponse } from "next/server"
import { debugAirtableConnection } from "@/lib/airtable-service"

export async function GET() {
  try {
    const result = await debugAirtableConnection()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to test Airtable connection",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

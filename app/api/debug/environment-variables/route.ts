import { NextResponse } from "next/server"

export async function GET() {
  // Safely check if environment variables exist without exposing their values
  return NextResponse.json({
    hasToken: !!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
    hasBaseId: !!process.env.AIRTABLE_BASE_ID,
    hasBountiesTableId: !!process.env.AIRTABLE_BOUNTIES_TABLE_ID,
    hasSubmissionsTableId: !!process.env.AIRTABLE_SUBMISSIONS_TABLE_ID,
  })
}

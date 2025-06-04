import { type NextRequest, NextResponse } from "next/server"
import { hasUserSubmittedForBounty } from "@/lib/airtable-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const bountyId = searchParams.get("bountyId")

    if (!userId || !bountyId) {
      return NextResponse.json(
        { error: "Both userId and bountyId are required" },
        { status: 400 }
      )
    }

    const hasSubmitted = await hasUserSubmittedForBounty(userId, bountyId)

    return NextResponse.json({
      hasSubmitted,
      userId,
      bountyId,
    })
  } catch (error) {
    console.error("Error checking submission status:", error)
    return NextResponse.json(
      { error: "Failed to check submission status" },
      { status: 500 }
    )
  }
} 
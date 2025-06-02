import { type NextRequest, NextResponse } from "next/server"
import { getSubmissionsByUser } from "@/lib/airtable-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("=== User Submissions API Debug ===")
    console.log("Received userId:", userId)

    if (!userId) {
      console.log("ERROR: No userId provided")
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    console.log(`Calling getSubmissionsByUser with userId: "${userId}"`)
    
    const submissions = await getSubmissionsByUser(userId)
    
    console.log(`Found ${submissions.length} submissions for user ${userId}`)
    console.log("Submissions data:", JSON.stringify(submissions, null, 2))
    
    return NextResponse.json({
      success: true,
      submissions,
      count: submissions.length,
      debug: {
        userId,
        submissionsFound: submissions.length
      }
    })
  } catch (error) {
    console.error("ERROR in user submissions API:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch user submissions",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 
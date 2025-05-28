import { NextResponse } from "next/server"
import { getBounties } from "@/lib/airtable-service"

/**
 * POST /api/webhook/airtable
 * Webhook endpoint for Airtable changes
 * This can be called by services like Zapier or Make when changes occur in Airtable
 */
export async function POST(request: Request) {
  try {
    // Check for webhook secret for security
    const authHeader = request.headers.get("authorization")
    const webhookSecret = process.env.WEBHOOK_SECRET

    // If WEBHOOK_SECRET is set, require authentication
    if (
      webhookSecret &&
      (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== webhookSecret)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the webhook payload
    const payload = await request.json().catch(() => ({}))
    console.log("Received webhook from Airtable:", payload)

    // Get the latest data from Airtable
    const bounties = await getBounties()

    // In a real implementation, you might store this data in a database
    // For now, we'll just return the fetched data

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      timestamp: new Date().toISOString(),
      count: bounties.length,
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Failed to process webhook", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

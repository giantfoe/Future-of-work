import { NextResponse } from "next/server"
import { updateBountyStatus } from "@/lib/airtable-service"

/**
 * PATCH /api/bounties/[id]/status
 * Updates the status of a bounty
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Parse the request body
    const { status } = await request.json()

    // Validate the status
    if (!status || !["open", "in-progress", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be one of: open, in-progress, closed" }, { status: 400 })
    }

    console.log(`Updating bounty ${id} status to: ${status}`)

    // Update the bounty in Airtable
    const updatedBounty = await updateBountyStatus(id, status)

    if (!updatedBounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Bounty status updated to ${status}`,
      id: updatedBounty.id,
      status,
    })
  } catch (error) {
    console.error(`Error in PATCH /api/bounties/${params.id}/status:`, error)
    return NextResponse.json(
      { error: "Failed to update bounty status", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { submitBountyApplication } from "@/lib/airtable-service"
import { getBase64 } from "@/lib/utils"

export async function POST(request: NextRequest, { params }: { params: { bountyId: string } }) {
  try {
    const bountyId = params.bountyId

    // Parse the multipart form data
    const formData = await request.formData()

    // Extract text fields
    const fullName = formData.get("fullName") as string
    const university = formData.get("university") as string
    const bountyName = formData.get("bountyName") as string
    const submissionLink = formData.get("submissionLink") as string
    const walletAddress = formData.get("walletAddress") as string

    // Extract files
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof File) {
        files.push(value)
      }
    }

    // Process files for Airtable (convert to base64)
    const fileAttachments = await Promise.all(
      files.map(async (file) => {
        const base64 = await getBase64(file)
        return {
          filename: file.name,
          content: base64,
          type: file.type,
        }
      }),
    )

    // Submit to Airtable
    const result = await submitBountyApplication({
      fullName,
      university,
      bountyId,
      bountyName,
      submissionLink,
      walletAddress,
      fileAttachments,
    })

    if (!result.success) {
      return NextResponse.json({ message: result.message || "Failed to submit application" }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        id: result.id,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in submission API:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

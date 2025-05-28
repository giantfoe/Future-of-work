import { type NextRequest, NextResponse } from "next/server"
import { submitBountyApplication } from "@/lib/airtable-service"
import { uploadFile, getResourceType } from "@/lib/cloudinary-service"

// Maximum file size in bytes (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024
// Maximum total size for all attachments (50MB)
const MAX_TOTAL_SIZE = 50 * 1024 * 1024

// Define allowed file types
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData()

    // Extract basic submission data
    const fullName = formData.get("fullName") as string
    const university = formData.get("university") as string
    const bountyId = formData.get("bountyId") as string
    const bountyName = formData.get("bountyName") as string
    const submissionLink = formData.get("submissionLink") as string
    const walletAddress = formData.get("walletAddress") as string

    // Validate required fields
    if (!fullName || !university || !bountyId || !bountyName || !submissionLink || !walletAddress) {
      return NextResponse.json({ success: false, message: "All required fields must be provided" }, { status: 400 })
    }

    // Handle file uploads to Cloudinary
    const fileAttachments = []
    const fileKeys = Array.from(formData.keys()).filter((key) => key.startsWith("file-"))
    const skippedFiles: { name: string; reason: string }[] = []
    let totalFileSize = 0

    if (fileKeys.length > 0) {
      for (const key of fileKeys) {
        const file = formData.get(key) as File
        if (!file) continue

        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`)

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          console.warn(`File ${file.name} has unsupported type: ${file.type}, skipping`)
          skippedFiles.push({ name: file.name, reason: `Unsupported file type: ${file.type}` })
          continue
        }

        // Skip files that are too large
        if (file.size > MAX_FILE_SIZE) {
          console.warn(`File ${file.name} exceeds maximum size of 20MB, skipping`)
          skippedFiles.push({ name: file.name, reason: "File size exceeds the 20MB limit" })
          continue
        }

        // Check if adding this file would exceed the total size limit
        if (totalFileSize + file.size > MAX_TOTAL_SIZE) {
          console.warn(`Adding file ${file.name} would exceed total size limit of 50MB, skipping`)
          skippedFiles.push({ name: file.name, reason: "Total attachment size would exceed 50MB limit" })
          continue
        }

        totalFileSize += file.size

        try {
          // Read the file as an ArrayBuffer and convert to base64
          const arrayBuffer = await file.arrayBuffer()
          const base64Data = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`

          // Create a unique folder path for this submission
          const folderPath = `bounty-submissions/${bountyId}/${Date.now()}`

          // Generate a safe public ID from the file name
          const publicId = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")

          // Sanitize context values to avoid signature issues
          const sanitizedContext = {
            bounty_id: bountyId,
            // Remove special characters from bounty name that could cause signature issues
            bounty_name: bountyName.replace(/[&=|]/g, "-"),
            submitter: fullName.replace(/[&=|]/g, "-"),
            university: university.replace(/[&=|]/g, "-"),
          }

          // Determine the appropriate resource type for this file
          const resourceType = getResourceType(file.type)

          // Upload to Cloudinary with the correct resource type
          const uploadResult = await uploadFile(base64Data, {
            fileName: file.name,
            folder: folderPath,
            publicId: publicId,
            tags: ["bounty-submission", bountyId],
            context: sanitizedContext,
            resourceType: resourceType,
          })

          if (uploadResult.success && uploadResult.result) {
            // Add the Cloudinary URL to the attachments
            fileAttachments.push({
              filename: file.name,
              url: uploadResult.result.secure_url,
              cloudinaryPublicId: uploadResult.result.public_id,
              fileType: file.type,
              resourceType: resourceType,
            })
          } else {
            console.error("File upload failed:", uploadResult.error)
            skippedFiles.push({ name: file.name, reason: `Upload failed: ${uploadResult.error}` })
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          skippedFiles.push({
            name: file.name,
            reason: `Processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
          })
        }
      }
    }

    console.log(`Successfully processed ${fileAttachments.length} file attachments`)
    console.log(`Skipped ${skippedFiles.length} files`)

    // Submit to Airtable with Cloudinary URLs
    const result = await submitBountyApplication({
      fullName,
      university,
      bountyId,
      bountyName,
      submissionLink,
      walletAddress,
      cloudinaryAttachments: fileAttachments, // Pass Cloudinary URLs instead of file content
    })

    if (result.success) {
      // Create a detailed success message
      let successMessage = "Your submission has been received! We'll review it and get back to you soon."

      // Add information about skipped files if any
      if (skippedFiles.length > 0) {
        successMessage += ` Note: ${skippedFiles.length} file(s) were not included due to size limitations or upload issues.`
      }

      // Add information about successful uploads
      if (fileAttachments.length > 0) {
        const storedCount = Math.min(fileAttachments.length, 3)
        successMessage += ` Successfully uploaded ${storedCount} file(s).`

        // Add warning if more than 3 files were uploaded
        if (fileAttachments.length > 3) {
          successMessage += ` Note: Only the first 3 files are stored in Airtable.`
        }
      }

      return NextResponse.json({
        success: true,
        message: successMessage,
        id: result.id,
        filesProcessed: fileAttachments.length,
        filesSkipped: skippedFiles.length,
        skippedDetails: skippedFiles,
        attachments: fileAttachments.map((att) => att.url),
      })
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing submission:", error)
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? `Error: ${error.message}`
            : "An unexpected error occurred while processing your submission.",
      },
      { status: 500 },
    )
  }
}

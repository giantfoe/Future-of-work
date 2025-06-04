import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Define the Cloudinary upload response type
interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  [key: string]: any
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(request: NextRequest) {
  try {
    const { base64Data, userId } = await request.json()

    if (!base64Data) {
      return NextResponse.json({ success: false, message: "No image data provided" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // Generate a unique public ID using the user's DID
    const publicId = `profile_${userId.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`

    // Upload to Cloudinary using the SDK (server-side)
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: "profile-images",
      public_id: publicId,
      tags: ["profile-image", userId],
      resource_type: "image" as const,
      overwrite: true, // Allow overwriting existing images
    }) as CloudinaryUploadResponse

    if (uploadResult && typeof uploadResult === 'object' && 'secure_url' in uploadResult) {
      return NextResponse.json({
        success: true,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      })
    } else {
      return NextResponse.json(
        { success: false, message: "Upload failed - no result returned" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error uploading profile image:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during upload",
      },
      { status: 500 }
    )
  }
}
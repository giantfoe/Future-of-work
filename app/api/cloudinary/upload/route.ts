import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(request: NextRequest) {
  try {
    const { base64Data, fileName, folder, publicId, tags, context } = await request.json()

    if (!base64Data) {
      return NextResponse.json({ success: false, message: "No file data provided" }, { status: 400 })
    }

    // Upload to Cloudinary using the SDK (this runs server-side where Node.js APIs are available)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder || "bounty-submissions",
        public_id: publicId,
        tags: tags || [],
        context: context || {},
      }

      cloudinary.uploader.upload(base64Data, uploadOptions, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

    return NextResponse.json({ success: true, result: uploadResult })
  } catch (error) {
    console.error("Error in Cloudinary upload API:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during upload",
      },
      { status: 500 },
    )
  }
}

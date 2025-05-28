import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Get the API secret from environment variables
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!apiSecret) {
      return NextResponse.json({ error: "Missing Cloudinary API secret" }, { status: 500 })
    }

    // Parse the request body
    const body = await request.json()

    // Create a params object with all parameters
    const params: Record<string, string> = {
      timestamp: body.timestamp.toString(),
    }

    // Add optional parameters if they exist
    if (body.folder) params.folder = body.folder
    if (body.publicId) params.public_id = body.publicId

    // Handle tags properly
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      params.tags = body.tags.join(",")
    }

    // Handle context properly - this is critical for the signature
    if (body.context && typeof body.context === "object") {
      // Format context as key=value|key=value
      const contextStr = Object.entries(body.context)
        .map(([key, value]) => {
          // Ensure value is a string and encode special characters
          const safeValue = String(value).replace(/=/g, "%3D").replace(/\|/g, "%7C")
          return `${key}=${safeValue}`
        })
        .join("|")

      if (contextStr) {
        params.context = contextStr
      }
    }

    // Sort parameters alphabetically by key as required by Cloudinary
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, string>, key) => {
        result[key] = params[key]
        return result
      }, {})

    // Build the signature string exactly as Cloudinary expects
    let signatureString = ""

    Object.entries(sortedParams).forEach(([key, value]) => {
      signatureString += `${key}=${value}&`
    })

    // Remove the trailing '&' if it exists
    if (signatureString.endsWith("&")) {
      signatureString = signatureString.slice(0, -1)
    }

    // Append the API secret (without a separator)
    signatureString += apiSecret

    console.log("String to sign:", signatureString)

    // Generate the SHA-1 hash
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex")

    // Return the signature and the sorted params for debugging
    return NextResponse.json({
      signature,
      params: sortedParams,
    })
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

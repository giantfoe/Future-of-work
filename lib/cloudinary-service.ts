/**
 * Cloudinary Service
 *
 * This service handles file uploads to Cloudinary using the Upload API directly
 * without relying on the Node.js SDK to avoid crypto.createHash errors
 */

// Define the upload options interface
interface UploadOptions {
  fileName?: string
  folder?: string
  publicId?: string
  tags?: string[]
  context?: Record<string, string>
  resourceType?: string
}

// Define the upload result interface
interface UploadResult {
  public_id: string
  secure_url: string
  format: string
  resource_type: string
  created_at: string
  bytes: number
  width?: number
  height?: number
  original_filename: string
}

/**
 * Determine the appropriate resource type for Cloudinary based on file MIME type
 */
export function getResourceType(mimeType: string): string {
  // Default to "auto" which lets Cloudinary determine the resource type
  if (!mimeType) return "auto"

  // For images
  if (mimeType.startsWith("image/")) return "image"

  // For videos
  if (mimeType.startsWith("video/")) return "video"

  // For PDFs and other document types
  if (
    mimeType === "application/pdf" ||
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "raw"
  }

  // For all other types
  return "auto"
}

/**
 * Upload a file to Cloudinary using the Upload API directly
 * This avoids using the Node.js SDK which requires crypto.createHash
 */
export async function uploadFile(
  fileData: string,
  options: UploadOptions = {},
): Promise<{ success: boolean; result?: UploadResult; error?: string }> {
  try {
    // Get Cloudinary credentials from environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY

    if (!cloudName || !apiKey) {
      throw new Error("Missing Cloudinary credentials")
    }

    // Extract file type from the data URL if available
    const mimeType = fileData.split(";")[0].split(":")[1]

    // Determine the resource type based on the file's MIME type
    const resourceType = options.resourceType || getResourceType(mimeType)

    console.log(`Uploading file with MIME type: ${mimeType}, using resource_type: ${resourceType}`)

    // Generate a timestamp for the signature
    const timestamp = Math.floor(Date.now() / 1000).toString()

    // Prepare parameters for signature generation
    const signatureParams = {
      timestamp,
      folder: options.folder,
      publicId: options.publicId,
      tags: options.tags,
      context: options.context,
      resourceType,
    }

    // Get signature from our API endpoint
    const signatureResponse = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signatureParams),
    })

    if (!signatureResponse.ok) {
      const errorData = await signatureResponse.json()
      throw new Error(`Failed to generate signature: ${errorData.error || "Unknown error"}`)
    }

    const { signature, params } = await signatureResponse.json()

    // Create a FormData object for the upload
    const formData = new FormData()

    // Add the file data
    formData.append("file", fileData)

    // Add the API key
    formData.append("api_key", apiKey)

    // Add the signature
    formData.append("signature", signature)

    // Add all parameters from the signature generation
    Object.entries(params).forEach(([key, value]) => {
      if (key !== "resourceType") {
        // Skip resourceType as it's part of the URL
        formData.append(key, value as string)
      }
    })

    // Make the upload request to Cloudinary
    // Note: resource_type is part of the URL path, not a form parameter
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || JSON.stringify(errorData)}`)
    }

    const result = await uploadResponse.json()

    return {
      success: true,
      result: result as UploadResult,
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred during upload",
    }
  }
}

/**
 * Generate a Cloudinary URL with transformations
 */
export function generateImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: number
    format?: string
  } = {},
) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.error("Missing Cloudinary cloud name")
    return ""
  }

  // Build the transformation string
  const transformations = []

  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)
  if (options.crop) transformations.push(`c_${options.crop}`)
  if (options.quality) transformations.push(`q_${options.quality}`)
  if (options.format) transformations.push(`f_${options.format}`)

  const transformationString = transformations.length > 0 ? `${transformations.join(",")}` : ""

  // Build the final URL
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`
}

/**
 * Generate a URL for a non-image file (PDF, DOCX, etc.)
 */
export function generateFileUrl(publicId: string, resourceType = "raw") {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.error("Missing Cloudinary cloud name")
    return ""
  }

  // Build the final URL
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`
}

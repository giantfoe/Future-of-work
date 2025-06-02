/**
 * Airtable Service Layer
 *
 * Implementation based on the official Airtable API documentation
 */

import Airtable from "airtable"
import type { Bounty } from "./types"

// Initialize Airtable with Personal Access Token
const initAirtable = () => {
  // Check for Personal Access Token (starts with "pat")
  const accessToken = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

  if (!accessToken) {
    console.error("AIRTABLE_PERSONAL_ACCESS_TOKEN is not defined in environment variables")
    throw new Error("AIRTABLE_PERSONAL_ACCESS_TOKEN is not defined in environment variables")
  }

  // Validate token format
  if (!accessToken.startsWith("pat")) {
    console.warn(
      "Warning: AIRTABLE_PERSONAL_ACCESS_TOKEN does not start with 'pat'. Airtable Personal Access Tokens should start with 'pat'.",
    )
  }

  // Log token format for debugging (first 6 chars only for security)
  console.log(`Using Airtable token starting with: ${accessToken.substring(0, 6)}...`)

  // Configure Airtable with the Personal Access Token
  Airtable.configure({
    apiKey: accessToken, // Airtable SDK uses 'apiKey' parameter even for PATs
    requestTimeout: 300000, // Increase timeout to 5 minutes for large file uploads
  })

  return Airtable
}

// Get the base with the specific ID
const getBase = () => {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID || "app15IobIPfU3YDf0"

    if (!baseId) {
      throw new Error("AIRTABLE_BASE_ID is not defined in environment variables")
    }

    console.log(`Connecting to Airtable base: ${baseId}`)
    const airtable = initAirtable()
    return airtable.base(baseId)
  } catch (error) {
    console.error("Error getting Airtable base:", error)
    throw error
  }
}

/**
 * Sanitize and prepare Markdown content from Airtable
 * This ensures that the content is properly formatted for Markdown rendering
 */
function sanitizeMarkdownContent(content: string | undefined): string {
  if (!content) return ""

  // If content is already in Markdown format, return it as is
  if (typeof content === "string" && !content.startsWith("<")) {
    return content
  }

  // If content is in HTML format (from Airtable rich text), return it as is
  // Our Markdown renderer can handle HTML with rehype-raw
  return content
  return content
}

// Update the transformBountyRecord function to normalize status values
function transformBountyRecord(record: any): Bounty {
  // Get the raw status value
  const rawStatus = (record.fields.Status || record.fields.Select || "open") as string

  // Normalize the status value
  let normalizedStatus: "open" | "in-progress" | "closed"
  const statusLower = rawStatus.toLowerCase()

  if (statusLower === "open") {
    normalizedStatus = "open"
  } else if (statusLower === "closed" || statusLower === "completed") {
    normalizedStatus = "closed"
  } else if (
    statusLower === "in-progress" ||
    statusLower === "in progress" ||
    statusLower === "inprogress" ||
    statusLower === "in_progress" ||
    statusLower === "review" ||
    statusLower === "in review"
  ) {
    normalizedStatus = "in-progress"
  } else {
    // Default to open if status is unknown
    normalizedStatus = "open"
  }

  // Log the status transformation for debugging
  console.log(`Status transformation: "${rawStatus}" -> "${normalizedStatus}"`)

  return {
    id: record.id,
    title: record.fields.Title || record.fields.Tiltle || "Untitled Bounty",
    description: sanitizeMarkdownContent(record.fields.Description || ""),
    requirements: sanitizeMarkdownContent(record.fields.Requirements || ""),
    reward: Number(record.fields.Reward || record.fields.Rewards) || 0,
    deadline: record.fields.Deadline || new Date().toISOString(),
    category: record.fields.Category || "Other",
    status: normalizedStatus,
  }
}

/**
 * Debug Airtable connection
 */
export async function debugAirtableConnection() {
  try {
    const accessToken = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID || "app15IobIPfU3YDf0"
    const bountiesTableId = process.env.AIRTABLE_BOUNTIES_TABLE_ID || "tblakfzUZvuvWKbdI"
    const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || "Submissions"

    console.log("Testing Airtable connection with the following config:")
    console.log("Access Token exists:", !!accessToken)
    console.log("Access Token format valid:", accessToken?.startsWith("pat"))
    console.log("Access Token length:", accessToken?.length)
    console.log("Base ID:", baseId)
    console.log("Bounties Table ID:", bountiesTableId)
    console.log("Submissions Table ID:", submissionsTableId)

    if (!accessToken) {
      throw new Error("AIRTABLE_PERSONAL_ACCESS_TOKEN is missing. Please check your environment variables.")
    }

    // Test connection by trying to get a single record
    try {
      const base = getBase()

      // Try to get a single record from the bounties table
      console.log(`Attempting to fetch a record from table: ${bountiesTableId}`)
      const query = await base(bountiesTableId)
        .select({
          maxRecords: 1,
        })
        .firstPage()

      console.log(`Successfully connected to Airtable base! Found ${query.length} records.`)

      return {
        success: true,
        message: "Successfully connected to Airtable",
        recordCount: query.length,
      }
    } catch (error) {
      console.error("Error connecting to Airtable:", error)

      // Log detailed error information
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        })
      }

      // Try to provide more specific error information
      if (error instanceof Error) {
        if (error.message.includes("NOT_FOUND")) {
          return {
            success: false,
            error: "Base or table not found. Please check your Base ID and Table ID.",
            details: error.message,
          }
        } else if (error.message.includes("UNAUTHORIZED") || error.message.includes("valid api key")) {
          return {
            success: false,
            error:
              "Personal Access Token is invalid or doesn't have access to this base. Please check your token and permissions.",
            details: error.message,
          }
        } else if (error.message.includes("RATE_LIMITED")) {
          return {
            success: false,
            error: "Rate limited by Airtable API. Please try again later.",
            details: error.message,
          }
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: JSON.stringify(error),
      }
    }
  } catch (error) {
    console.error("Error testing Airtable connection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: JSON.stringify(error),
    }
  }
}

/**
 * Get all bounties from Airtable
 */
export async function getBounties(): Promise<Bounty[]> {
  try {
    console.log("Starting getBounties function")

    const base = getBase()
    const tableId = process.env.AIRTABLE_BOUNTIES_TABLE_ID || "tblakfzUZvuvWKbdI"

    console.log(`Using table ID: ${tableId}`)

    // First, test the connection
    const connectionTest = await debugAirtableConnection()
    if (!connectionTest.success) {
      console.error("Failed to connect to Airtable:", connectionTest.error)
      console.error("Error details:", connectionTest.details)
      console.log("Using mock bounty data due to connection failure")
      return getMockBounties() // Return mock data instead of throwing
    }

    const records = await base(tableId)
      .select({
        maxRecords: 100,
        view: "Grid view",
      })
      .all()

    console.log(`Successfully fetched ${records.length} records from Airtable`)

    // Log the first record to see its structure
    if (records.length > 0) {
      console.log("First record fields:", records[0].fields)
    }

    // Transform records to Bounty objects with better error handling
    return records.map((record) => {
      try {
        return transformBountyRecord(record)
      } catch (error) {
        console.error(`Error transforming record ${record.id}:`, error)
        console.log("Record fields:", record.fields)

        // Return a default bounty object if transformation fails
        return {
          id: record.id,
          title: "Error Loading Bounty",
          description: "There was an error loading this bounty's details.",
          requirements: "",
          reward: 0,
          deadline: new Date().toISOString(),
          category: "Other",
          status: "open",
        }
      }
    })
  } catch (error) {
    console.error("Error getting bounties:", error)
    // Return mock data instead of throwing to prevent page crashes
    console.log("Using mock bounty data due to error")
    return getMockBounties()
  }
}

/**
 * Get a single bounty by ID
 */
export async function getBountyById(id: string): Promise<Bounty | null> {
  try {
    console.log(`Starting getBountyById for ID: ${id}`)

    // Check if this looks like a mock ID (1, 2, 3)
    if (["1", "2", "3"].includes(id)) {
      console.warn(`ID "${id}" looks like mock data ID. This suggests the bounty list is using mock data.`)
    }

    const base = getBase()
    const tableId = process.env.AIRTABLE_BOUNTIES_TABLE_ID || "tblakfzUZvuvWKbdI"

    console.log(`Fetching record from table: ${tableId}`)

    const record = await base(tableId).find(id)

    if (!record) {
      console.log(`No record found with ID: ${id}`)
      return null
    }

    // Log the record fields to debug
    console.log(`Found record ${id} with fields:`, record.fields)

    const bounty = transformBountyRecord(record)

    console.log(`Returning bounty object:`, bounty)
    return bounty
  } catch (error) {
    console.error(`Error getting bounty with ID ${id}:`, error)
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
      });
    }
    
    // Fallback to mock data but log that we're doing so
    console.log(`Falling back to mock data for ID: ${id}`)
    const bounty = getMockBounties().find((b) => b.id === id)
    return bounty || null
  }
}

/**
 * Update a bounty's status
 */
export async function updateBountyStatus(id: string, status: string): Promise<Bounty | null> {
  try {
    const base = getBase()
    const tableId = process.env.AIRTABLE_BOUNTIES_TABLE_ID || "tblakfzUZvuvWKbdI"

    // Update the correct field name (Select instead of Status)
    const record = await base(tableId).update(id, {
      Select: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    })

    if (!record) {
      return null
    }

    return transformBountyRecord(record)
  } catch (error) {
    console.error(`Error updating bounty status for ID ${id}:`, error)
    return null
  }
}

// Update the submitBountyApplication function to use the correct field name

interface SubmissionData {
  fullName: string
  university: string
  bountyId: string
  bountyName: string
  submissionLink: string
  walletAddress: string
  userId: string
  cloudinaryAttachments?: Array<{
    filename: string
    url: string
    cloudinaryPublicId: string
    fileType: string
  }>
}

/**
 * Check if a user has already submitted for a specific bounty
 */
export async function hasUserSubmittedForBounty(userId: string, bountyId: string): Promise<boolean> {
  try {
    const base = getBase()
    const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || "Submissions"

    const records = await base(submissionsTableId)
      .select({
        filterByFormula: `AND({User ID} = "${userId}", {Bounty ID} = "${bountyId}")`,
        fields: ["User ID", "Bounty ID"],
        maxRecords: 1,
      })
      .all()

    return records.length > 0
  } catch (error) {
    console.error(`Error checking existing submission for user ${userId} and bounty ${bountyId}:`, error)
    return false // Return false on error to allow submission attempt
  }
}

export async function submitBountyApplication(
  data: SubmissionData,
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    console.log("Starting submitBountyApplication with:", {
      fullName: data.fullName,
      university: data.university,
      userId: data.userId,
      bountyId: data.bountyId,
      bountyName: data.bountyName,
      hasCloudinaryAttachments: !!data.cloudinaryAttachments && data.cloudinaryAttachments.length > 0,
      attachmentCount: data.cloudinaryAttachments?.length || 0,
    })

    // Check if user has already submitted for this bounty
    const hasAlreadySubmitted = await hasUserSubmittedForBounty(data.userId, data.bountyId)
    if (hasAlreadySubmitted) {
      return {
        success: false,
        message: "You have already submitted for this bounty. Only one submission per user is allowed.",
      }
    }

    const base = getBase()
    const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || "Submissions"

    // Prepare the record data including User ID
    const recordData: any = {
      "Full Name": data.fullName,
      University: data.university,
      "User ID": data.userId,
      "Bounty ID": data.bountyId,
      "Bounty Name": data.bountyName,
      "Submission Link": data.submissionLink,
      "Wallet Address": data.walletAddress,
    }

    // If we have Cloudinary attachments, add them to the record
    if (data.cloudinaryAttachments && data.cloudinaryAttachments.length > 0) {
      // Store each attachment in a separate field (up to 3 attachments)
      data.cloudinaryAttachments.forEach((attachment, index) => {
        // Only use up to 3 attachment fields (Attachment 1, 2, 3)
        if (index < 3) {
          recordData[`Attachment ${index + 1}`] = attachment.url
        }
      })

      // Log what we're trying to do
      console.log(
        "Storing Cloudinary URLs in separate attachment fields:",
        data.cloudinaryAttachments
          .slice(0, 3)
          .map((a, i) => `Attachment ${i + 1}: ${a.url}`)
          .join("\n"),
      )

      // Log if any attachments were skipped due to the 3-attachment limit
      if (data.cloudinaryAttachments.length > 3) {
        console.warn(
          `Note: ${data.cloudinaryAttachments.length - 3} attachment(s) were not stored because only 3 attachment fields are available.`,
        )
      }
    }

    // Log the record data we're about to send to Airtable
    console.log("Submitting to Airtable with record data:", recordData)

    // Create the record with a longer timeout
    const initialRecord = await new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Airtable request timed out after 120 seconds"))
      }, 120000) // 2 minute timeout for initial record creation

      base(submissionsTableId).create(recordData, (err: any, record: any) => {
        clearTimeout(timeoutId)
        if (err) {
          console.error("Airtable create record error:", err)
          reject(err)
        } else {
          resolve(record)
        }
      })
    })

    console.log("Record created successfully in Airtable with ID:", initialRecord.id)

    return {
      success: true,
      message: "Your submission has been received! We'll review it and get back to you soon.",
      id: initialRecord.id,
    }
  } catch (error) {
    console.error("Error submitting to Airtable:", error)

    // Provide more specific error messages based on the error
    let errorMessage = "Failed to submit application. Please try again."

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes("Unknown field name")) {
        // Extract the field name from the error message
        const fieldMatch = error.message.match(/Unknown field name: "([^"]+)"/)
        const fieldName = fieldMatch ? fieldMatch[1] : "unknown field"

        console.error(`Field name error: "${fieldName}" doesn't exist in the Airtable schema`)
        errorMessage = `Submission failed due to a configuration issue. Please contact support and mention: Unknown field "${fieldName}".`
      } else if (error.message.includes("cannot accept the provided value")) {
        // Extract the field name from the error message
        const fieldMatch = error.message.match(/Field "([^"]+)" cannot accept the provided value/)
        const fieldName = fieldMatch ? fieldMatch[1] : "unknown field"

        console.error(`Field value error: "${fieldName}" cannot accept the provided value`)
        errorMessage = `Submission failed due to a configuration issue. Please contact support and mention: Invalid value for field "${fieldName}".`
      } else if (error.message.includes("INVALID_PERMISSIONS_ERROR")) {
        errorMessage = "Permission error: The Airtable token doesn't have write access to this table."
      } else if (error.message.includes("NOT_FOUND")) {
        errorMessage = "The submission table could not be found. Please check your Airtable configuration."
      } else if (error.message.includes("RATE_LIMITED")) {
        errorMessage = "Submission rate limited by Airtable. Please try again in a few minutes."
      } else if (error.message.includes("timed out")) {
        errorMessage = "The submission took too long to process. This might be due to network issues."
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }

    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * Get submissions for a specific bounty
 */
export async function getSubmissionsForBounty(bountyId: string): Promise<any[]> {
  try {
    const base = getBase()
    const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || "Submissions"

    const records = await base(submissionsTableId)
      .select({
        filterByFormula: `{Bounty ID} = "${bountyId}"`,
        // Remove sort by Created At
      })
      .all()

    return records.map((record) => ({
      id: record.id,
      userName: record.fields["Full Name"] || "",
      university: record.fields["University"] || "",
      userId: record.fields["User ID"] || "",
      bountyId: record.fields["Bounty ID"] || "",
      bountyName: record.fields["Bounty Name"] || "",
      submissionLink: record.fields["Submission Link"] || "",
      attachments: record.fields["Attachments"] || [],
      walletAddress: record.fields["Wallet Address"] || "",
      status: record.fields["Status"] || "Submitted",
      createdAt: record.fields["Created At"] || new Date().toISOString(),
    }))
  } catch (error) {
    console.error(`Error getting submissions for bounty ${bountyId}:`, error)
    return []
  }
}

/**
 * Get all submissions by a specific user
 */
export async function getSubmissionsByUser(userId: string): Promise<any[]> {
  try {
    const base = getBase()
    const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || "Submissions"

    const records = await base(submissionsTableId)
      .select({
        filterByFormula: `{User ID} = "${userId}"`,
        sort: [{ field: "Created At", direction: "desc" }],
      })
      .all()

    return records.map((record) => ({
      id: record.id,
      userName: record.fields["Full Name"] || "",
      university: record.fields["University"] || "",
      userId: record.fields["User ID"] || "",
      bountyId: record.fields["Bounty ID"] || "",
      bountyName: record.fields["Bounty Name"] || "",
      submissionLink: record.fields["Submission Link"] || "",
      attachments: record.fields["Attachments"] || [],
      walletAddress: record.fields["Wallet Address"] || "",
      status: record.fields["Status"] || "Submitted",
      createdAt: record.fields["Created At"] || new Date().toISOString(),
    }))
  } catch (error) {
    console.error(`Error getting submissions for user ${userId}:`, error)
    return []
  }
}

/**
 * Get all unique categories from Airtable bounties
 */
export async function getCategories(): Promise<string[]> {
  try {
    console.log("Fetching categories from Airtable")

    // Get all bounties
    const bounties = await getBounties()

    // Extract unique categories
    const categorySet = new Set<string>()

    bounties.forEach((bounty) => {
      if (bounty.category) {
        // Handle comma-separated categories
        const categories = String(bounty.category).split(",")
        categories.forEach((category) => {
          const trimmedCategory = category.trim()
          if (trimmedCategory) {
            categorySet.add(trimmedCategory)
          }
        })
      }
    })

    // Convert to array and sort
    const allCategories = Array.from(categorySet).sort()

    // Filter to include only the specified categories
    const requiredCategories = ["Content creation", "Design", "Engineering", "Journalism", "Media", "Product"]

    // Filter categories to only include the required ones
    // If a required category doesn't exist in Airtable, we'll still include it
    const filteredCategories = requiredCategories.filter(
      (category) => allCategories.some((c) => c.toLowerCase() === category.toLowerCase()) || true,
    )

    console.log("Fetched categories:", filteredCategories)
    return filteredCategories
  } catch (error) {
    console.error("Error fetching categories:", error)

    // Return default categories if there's an error
    return ["Content creation", "Design", "Engineering", "Journalism", "Media", "Product"]
  }
}

/**
 * Get mock bounties for fallback
 */
export function getMockBounties(): Bounty[] {
  return [
    {
      id: "1",
      title: "Create a Web3 Landing Page",
      description:
        "Design and develop a modern landing page for a Web3 project. The page should be responsive, include animations, and have a clean, professional look.",
      requirements: `
        <ul>
          <li>Design must be responsive and mobile-friendly</li>
          <li>Include hero section, features, and call-to-action</li>
          <li>Provide both light and dark mode versions</li>
          <li>Deliverables: Figma file with all design assets</li>
        </ul>
      `,
      reward: 500,
      deadline: "2025-05-22",
      category: "Design",
      status: "open",
    },
    {
      id: "2",
      title: "Develop Smart Contract for NFT Marketplace",
      description:
        "Create a secure and efficient smart contract for an NFT marketplace. The contract should handle minting, buying, selling, and royalties.",
      requirements: `
        <ul>
          <li>Implement listing, buying, and selling functions</li>
          <li>Include royalty support for creators</li>
          <li>Write comprehensive tests</li>
          <li>Deliverables: Code repository with documentation</li>
        </ul>
      `,
      reward: 1200,
      deadline: "2025-05-29",
      category: "Engineering",
      status: "open",
    },
    {
      id: "3",
      title: "Write Technical Documentation for DeFi Protocol",
      description:
        "Create comprehensive technical documentation for a new DeFi protocol. The documentation should be clear, accurate, and accessible to developers of all skill levels.",
      requirements: `
        <ul>
          <li>Cover protocol architecture and components</li>
          <li>Include API documentation and examples</li>
          <li>Provide implementation guides</li>
          <li>Deliverables: Markdown files with diagrams</li>
        </ul>
      `,
      reward: 800,
      deadline: "2025-05-18",
      category: "Content creation",
      status: "open",
    },
  ]
}

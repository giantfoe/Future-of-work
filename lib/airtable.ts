import type { Bounty, Winner, PlatformStats, Activity } from "./types"

// Base URL for Airtable API
const AIRTABLE_API_URL = "https://api.airtable.com/v0"

// Initialization: Create a function to initialize the Airtable connection
function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const bountiesTableId = process.env.AIRTABLE_BOUNTIES_TABLE_ID
  const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID

  // Instead of throwing errors, log warnings and return null when environment variables are missing
  if (!apiKey || !baseId) {
    console.warn("Airtable API key or Base ID is missing. Falling back to mock data.")
    return null
  }

  if (!bountiesTableId || !submissionsTableId) {
    console.warn("Airtable table IDs are missing. Falling back to mock data.")
    return null
  }

  return {
    apiKey,
    baseId,
    tableIds: {
      bounties: bountiesTableId,
      submissions: submissionsTableId,
    },
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  }
}

// Add a debug function to help diagnose Airtable API issues

// Add this function near the top of the file, after the imports
async function debugAirtableConnection() {
  try {
    const config = getAirtableConfig()
    console.log("Testing Airtable connection with the following config:")
    console.log("Base ID:", config.baseId)
    console.log("Bounties Table ID:", config.tableIds.bounties)
    console.log("Submissions Table ID:", config.tableIds.submissions)

    // Test if we can access the base metadata (doesn't require table access)
    const metadataUrl = `${AIRTABLE_API_URL}/${config.baseId}/`
    const metadataResponse = await fetch(metadataUrl, { headers: config.headers })

    if (metadataResponse.ok) {
      console.log("Successfully connected to Airtable base!")
    } else {
      const errorData = await metadataResponse.json().catch(() => ({}))
      console.error("Failed to connect to Airtable base:", errorData)
    }

    return metadataResponse.ok
  } catch (error) {
    console.error("Error testing Airtable connection:", error)
    return false
  }
}

// Helper function to handle API errors
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`
    console.error("Airtable API error:", errorMessage, errorData)
    throw new Error(errorMessage)
  }
  return response.json()
}

// Data Fetching: Function to fetch records from a table with filtering, sorting, and pagination
async function fetchRecords<T>(
  tableId: string,
  options: {
    filterByFormula?: string
    sort?: Array<{ field: string; direction: "asc" | "desc" }>
    maxRecords?: number
    pageSize?: number
    view?: string
    fields?: string[]
  } = {},
): Promise<T[]> {
  try {
    const config = getAirtableConfig()

    // If config is null, throw an error to be caught by the calling function
    if (!config) {
      throw new Error("Airtable configuration is missing. Check environment variables.")
    }

    // Build query parameters
    const params = new URLSearchParams()

    if (options.filterByFormula) {
      params.append("filterByFormula", options.filterByFormula)
    }

    if (options.sort && options.sort.length > 0) {
      // Airtable expects sort to be formatted as sort[0][field]=Name&sort[0][direction]=asc
      options.sort.forEach((sortOption, index) => {
        params.append(`sort[${index}][field]`, sortOption.field)
        params.append(`sort[${index}][direction]`, sortOption.direction)
      })
    }

    if (options.maxRecords) {
      params.append("maxRecords", options.maxRecords.toString())
    }

    if (options.pageSize) {
      params.append("pageSize", options.pageSize.toString())
    }

    if (options.view) {
      params.append("view", options.view)
    }

    if (options.fields && options.fields.length > 0) {
      // Airtable expects fields to be formatted as fields[]=Field1&fields[]=Field2
      options.fields.forEach((field) => {
        params.append("fields[]", field)
      })
    }

    // Construct the URL using table ID from environment variables
    const url = `${AIRTABLE_API_URL}/${config.baseId}/${tableId}?${params.toString()}`

    console.log("Fetching from URL:", url)

    // Make the request
    const response = await fetch(url, { headers: config.headers })
    const data = await handleResponse(response)

    return data.records
  } catch (error) {
    console.error(`Error fetching records from table ${tableId}:`, error)
    // Re-throw the error for the caller to handle or provide fallback
    throw error
  }
}

// Data Transformation: Function to transform Airtable records to application model
// Updated to match the specified fields in the Bounties table
function transformBountyRecord(record: any): Bounty {
  return {
    id: record.id,
    title: record.fields.Title || "Untitled Bounty",
    description: record.fields.Description || "",
    requirements: record.fields.Requirements || "",
    reward: Number(record.fields.Reward) || 0, // Changed from "Rewards" to "Reward"
    deadline: record.fields.Deadline || new Date().toISOString(),
    category: record.fields.Category || "Other",
    status: record.fields.Status?.toLowerCase() || "open",
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  // For older dates, return the formatted date
  return date.toLocaleDateString()
}

// Function to get all bounties
export async function getBounties(): Promise<Bounty[]> {
  try {
    const config = getAirtableConfig()

    // If config is null, fall back to mock data immediately
    if (!config) {
      console.log("Using mock bounty data due to missing environment variables")
      return mockBounties
    }

    // Test the connection first
    await debugAirtableConnection()

    const records = await fetchRecords<any>(config.tableIds.bounties, {
      // Use simpler sorting to avoid potential issues
      sort: [{ field: "Deadline", direction: "asc" }],
      // Make sure these field names exactly match your Airtable column names
      fields: ["Title", "Description", "Requirements", "Reward", "Deadline", "Category", "Status"],
    })

    return records.map(transformBountyRecord)
  } catch (error) {
    console.error("Error getting bounties:", error)
    // Fallback to mock data in case of error
    return mockBounties
  }
}

// Function to get a single bounty by ID
export async function getBountyById(id: string): Promise<Bounty | null> {
  try {
    const config = getAirtableConfig()

    // If config is null, fall back to mock data immediately
    if (!config) {
      console.log(`Using mock data for bounty ID ${id} due to missing environment variables`)
      const bounty = mockBounties.find((b) => b.id === id)
      return bounty || null
    }

    // Using table ID from environment variables
    const url = `${AIRTABLE_API_URL}/${config.baseId}/${config.tableIds.bounties}/${id}`

    const response = await fetch(url, { headers: config.headers })
    const record = await handleResponse(response)

    return transformBountyRecord(record)
  } catch (error) {
    console.error(`Error getting bounty with ID ${id}:`, error)
    // Fallback to mock data in case of error
    const bounty = mockBounties.find((b) => b.id === id)
    return bounty || null
  }
}

// Function to submit a bounty application
// Updated to match the specified fields in the Submissions table
export async function submitBountyApplication(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const config = getAirtableConfig()

    // Extract data from FormData
    const fullName = formData.get("fullName") as string
    const university = formData.get("university") as string
    const bountyId = formData.get("bountyId") as string
    const bountyName = formData.get("bountyName") as string
    const submissionLink = formData.get("submissionLink") as string
    const walletAddress = formData.get("walletAddress") as string

    // Validate required fields
    if (!fullName || !university || !bountyId || !bountyName || !submissionLink || !walletAddress) {
      throw new Error("All fields are required")
    }

    // Prepare data for Airtable with the correct field names
    const submissionData = {
      fields: {
        "User Name": fullName,
        University: university,
        "Bounty Name": bountyName,
        Title: bountyName, // Title is derived from Bounty Name
        "Submission Link": submissionLink,
        "Wallet Address": walletAddress,
        Status: "Submitted", // Default status for new submissions
        "Created At": new Date().toISOString(),
      },
    }

    // Submit to Airtable using table ID from environment variables
    const url = `${AIRTABLE_API_URL}/${config.baseId}/${config.tableIds.submissions}`
    const response = await fetch(url, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify(submissionData),
    })

    await handleResponse(response)

    return {
      success: true,
      message: "Your submission has been received! We'll review it and get back to you soon.",
    }
  } catch (error) {
    console.error("Error submitting bounty application:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
    }
  }
}

// Function to get submissions for a specific bounty
export async function getSubmissionsForBounty(bountyName: string): Promise<any[]> {
  try {
    const config = getAirtableConfig()

    // Create a filter formula to get submissions for a specific bounty
    const filterByFormula = encodeURIComponent(`{Bounty Name} = "${bountyName}"`)

    const records = await fetchRecords<any>(config.tableIds.submissions, {
      filterByFormula,
      sort: [{ field: "Created At", direction: "desc" }],
      fields: [
        "User Name",
        "University",
        "Bounty Name",
        "Title",
        "Submission Link",
        "Attachments",
        "Wallet Address",
        "Status",
        "Created At",
      ],
    })

    return records.map((record) => ({
      id: record.id,
      userName: record.fields["User Name"] || "",
      university: record.fields["University"] || "",
      bountyName: record.fields["Bounty Name"] || "",
      title: record.fields["Title"] || "",
      submissionLink: record.fields["Submission Link"] || "",
      attachments: record.fields["Attachments"] || [],
      walletAddress: record.fields["Wallet Address"] || "",
      status: record.fields["Status"] || "Submitted",
      createdAt: record.fields["Created At"] || new Date().toISOString(),
    }))
  } catch (error) {
    console.error(`Error getting submissions for bounty ${bountyName}:`, error)
    return []
  }
}

// The following functions now return mock data since we're only using bounties and submissions tables
// This maintains compatibility with the rest of the application

// Function to get recent winners (using mock data)
export async function getWinners(): Promise<Winner[]> {
  return mockWinners
}

// Function to get platform statistics (using mock data)
export async function getPlatformStats(): Promise<PlatformStats> {
  return mockStats
}

// Function to get recent activities (using mock data)
export async function getRecentActivities(): Promise<Activity[]> {
  return mockActivities
}

// Mock data for fallback in case of API errors and for functions that don't use Airtable
const mockBounties: Bounty[] = [
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
    category: "Development",
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
    category: "Content",
    status: "open",
  },
  {
    id: "4",
    title: "Create UI/UX Design for Crypto Wallet",
    description:
      "Design a user-friendly interface for a cryptocurrency wallet application. The design should be intuitive, visually appealing, and follow best practices.",
    requirements: `
      <ul>
        <li>Design all key screens (dashboard, send/receive, settings)</li>
        <li>Create a consistent design system</li>
        <li>Include both light and dark themes</li>
        <li>Deliverables: Figma file with all screens and components</li>
      </ul>
    `,
    reward: 700,
    deadline: "2025-05-15",
    category: "Design",
    status: "open",
  },
  {
    id: "5",
    title: "Develop Token Staking Feature",
    description:
      "Implement a token staking feature for an existing DeFi platform. The feature should allow users to stake tokens and earn rewards.",
    requirements: `
      <ul>
        <li>Implement staking and unstaking functionality</li>
        <li>Create a rewards distribution mechanism</li>
        <li>Ensure security best practices</li>
        <li>Deliverables: Smart contract code and frontend integration</li>
      </ul>
    `,
    reward: 1500,
    deadline: "2025-06-07",
    category: "Development",
    status: "open",
  },
  {
    id: "6",
    title: "Create Educational Content on Blockchain",
    description:
      "Develop a series of educational articles or videos explaining blockchain technology to beginners. Content should be clear, engaging, and accurate.",
    requirements: `
      <ul>
        <li>Cover key blockchain concepts</li>
        <li>Include examples and illustrations</li>
        <li>Make content accessible to non-technical audience</li>
        <li>Deliverables: 5-7 articles or 3-5 videos</li>
      </ul>
    `,
    reward: 600,
    deadline: "2025-05-23",
    category: "Content",
    status: "in-progress",
  },
]

const mockWinners: Winner[] = [
  {
    id: "1",
    name: "Alex Johnson",
    timeAgo: "2 days ago",
    bountyTitle: "Create a Web3 Landing Page",
    category: "Design",
    reward: 500,
  },
  {
    id: "2",
    name: "Morgan Smith",
    timeAgo: "3 days ago",
    bountyTitle: "Develop Smart Contract for NFT Marketplace",
    category: "Development",
    reward: 1200,
  },
  {
    id: "3",
    name: "Jordan Lee",
    timeAgo: "5 days ago",
    bountyTitle: "Write Technical Documentation for DeFi Protocol",
    category: "Content",
    reward: 800,
  },
  {
    id: "4",
    name: "Taylor Kim",
    timeAgo: "01/05/2025",
    bountyTitle: "Create UI/UX Design for Crypto Wallet",
    category: "Design",
    reward: 700,
  },
]

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "new_bounty",
    bountyTitle: "Build a DeFi Dashboard",
    amount: 1800,
    timeAgo: "1 hour ago",
  },
  {
    id: "2",
    type: "payment",
    userName: "Alex Johnson",
    bountyTitle: "Create a Web3 Landing Page",
    amount: 500,
    timeAgo: "2 days ago",
  },
  {
    id: "3",
    type: "application",
    userName: "Jamie Wilson",
    bountyTitle: "Develop Token Staking Feature",
    timeAgo: "3 hours ago",
  },
  {
    id: "4",
    type: "submission",
    userName: "Casey Parker",
    bountyTitle: "Write Technical Documentation for DeFi Protocol",
    timeAgo: "1 day ago",
  },
  {
    id: "5",
    type: "new_bounty",
    bountyTitle: "Create a Tokenomics Model",
    amount: 900,
    timeAgo: "2 days ago",
  },
  {
    id: "6",
    type: "application",
    userName: "Riley Thompson",
    bountyTitle: "Create UI/UX Design for Crypto Wallet",
    timeAgo: "4 hours ago",
  },
  {
    id: "7",
    type: "submission",
    userName: "Morgan Smith",
    bountyTitle: "Develop Smart Contract for NFT Marketplace",
    timeAgo: "3 days ago",
  },
  {
    id: "8",
    type: "payment",
    userName: "Jordan Lee",
    bountyTitle: "Write Technical Documentation for DeFi Protocol",
    amount: 800,
    timeAgo: "5 days ago",
  },
]

const mockStats: PlatformStats = {
  totalEarned: "1.3M",
  availableOpportunities: 349,
  totalAvailable: "424.1K",
  activeUsers: "12.5K",
  completionRate: 87,
}

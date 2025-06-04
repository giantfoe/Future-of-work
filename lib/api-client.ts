/**
 * Client-side API utilities
 *
 * This module provides functions for interacting with the API routes
 * from client components.
 */

import type { Bounty } from "./types"

// Define the BountySubmission interface with optional files
export interface BountySubmission {
  fullName: string
  university: string
  userId: string
  bountyId: string
  bountyName: string
  submissionLink: string
  walletAddress: string
  files?: File[]
}

/**
 * Fetch all bounties
 * @returns Promise resolving to an array of Bounty objects
 */
export async function fetchBounties(): Promise<Bounty[]> {
  try {
    const response = await fetch("/api/bounties", {
      // Use cache: 'no-store' for real-time data or 'force-cache' for static data
      cache: "no-store",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to fetch bounties: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching bounties:", error)
    throw error
  }
}

/**
 * Fetch a single bounty by ID
 * @param id Bounty ID
 * @returns Promise resolving to a Bounty object
 */
export async function fetchBountyById(id: string): Promise<Bounty> {
  try {
    const response = await fetch(`/api/bounties/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to fetch bounty: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching bounty ${id}:`, error)
    throw error
  }
}

/**
 * Submit a bounty application
 * @param submission Submission data including optional files
 * @returns Promise resolving to the submission result
 */
export async function submitApplication(
  submission: BountySubmission,
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    console.log("Submitting application with files:", submission.files?.length || 0)

    // Create FormData for file uploads
    const formData = new FormData()

    // Add text fields
    formData.append("fullName", submission.fullName)
    formData.append("university", submission.university)
    formData.append("userId", submission.userId)
    formData.append("bountyId", submission.bountyId)
    formData.append("bountyName", submission.bountyName)
    formData.append("submissionLink", submission.submissionLink)
    formData.append("walletAddress", submission.walletAddress)

    // Add files if they exist
    if (submission.files && submission.files.length > 0) {
      submission.files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })
      formData.append("fileCount", submission.files.length.toString())
    }

    const response = await fetch("/api/submissions", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header when using FormData
      // The browser will set it automatically with the correct boundary
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || `Failed to submit application: ${response.status}`)
    }

    return {
      success: true,
      message: "Your submission has been received! We'll review it and get back to you soon.",
      id: result.id,
    }
  } catch (error) {
    console.error("Error submitting application:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
    }
  }
}

/**
 * Fetch submissions for a specific bounty
 * @param bountyId Bounty ID
 * @returns Promise resolving to an array of submission objects
 */
export async function fetchSubmissionsForBounty(bountyId: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/submissions/${bountyId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to fetch submissions: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching submissions for bounty ${bountyId}:`, error)
    throw error
  }
}

/**
 * Client-side utility functions for interacting with Airtable
 * These functions are designed to be used in React components
 */

import type { Bounty } from "./types"

/**
 * Fetches bounties from Airtable
 * @returns Promise<Bounty[]> Array of bounty objects
 */
export async function fetchBounties(): Promise<Bounty[]> {
  try {
    // Fetch bounties from our API endpoint
    const response = await fetch("/api/bounties")

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch bounties: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching bounties:", error)
    throw error
  }
}

/**
 * Fetches a single bounty by ID
 * @param id Bounty ID
 * @returns Promise<Bounty> Bounty object
 */
export async function fetchBountyById(id: string): Promise<Bounty> {
  try {
    const response = await fetch(`/api/bounties/${id}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch bounty: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching bounty ${id}:`, error)
    throw error
  }
}

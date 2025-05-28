"use server"

import { revalidatePath } from "next/cache"
import type { BountySubmission } from "./types"

export async function submitBountyApplication(formData: FormData): Promise<void> {
  // Validate the form data
  const fullName = formData.get("fullName") as string
  const university = formData.get("university") as string
  const bountyId = formData.get("bountyId") as string
  const bountyName = formData.get("bountyName") as string
  const submissionLink = formData.get("submissionLink") as string
  const walletAddress = formData.get("walletAddress") as string

  if (!fullName || !university || !bountyId || !bountyName || !submissionLink || !walletAddress) {
    throw new Error("All fields are required")
  }

  // Handle file uploads
  // In a real implementation, you would upload files to a storage service
  // and store the URLs in Airtable
  const files = formData.getAll("files") as File[]

  // Create the submission object
  const submission: BountySubmission = {
    fullName,
    university,
    bountyId,
    bountyName,
    submissionLink,
    walletAddress,
    createdAt: new Date().toISOString(),
  }

  // In a real implementation, this would send data to Airtable API
  // Example:
  // const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Submissions`, {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     fields: {
  //       "Full Name": submission.fullName,
  //       "University": submission.university,
  //       "Bounty ID": submission.bountyId,
  //       "Bounty Name": submission.bountyName,
  //       "Submission Link": submission.submissionLink,
  //       "Wallet Address": submission.walletAddress,
  //       "Created At": submission.createdAt
  //     }
  //   })
  // })

  // For now, just log the submission
  console.log("Submission received:", submission)

  // Add a small delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Revalidate the bounty page to show updated data
  revalidatePath(`/bounties/${bountyId}`)
}

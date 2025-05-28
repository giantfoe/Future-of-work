import { NextResponse } from "next/server"
import Airtable from "airtable"

export async function GET() {
  try {
    // Initialize Airtable with Personal Access Token
    const accessToken = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID || "app15IobIPfU3YDf0"
    const submissionsTableId = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID || "Submissions"

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "AIRTABLE_PERSONAL_ACCESS_TOKEN is not defined" },
        { status: 500 },
      )
    }

    console.log("Testing Airtable attachment functionality")
    console.log(`Using base ID: ${baseId}`)
    console.log(`Using table ID: ${submissionsTableId}`)
    console.log(`Token exists and starts with: ${accessToken.substring(0, 6)}...`)

    // Configure Airtable
    Airtable.configure({
      apiKey: accessToken,
      requestTimeout: 30000,
    })

    const base = Airtable.base(baseId)

    // Create a test record with a small attachment
    const testAttachment = {
      filename: "test-attachment.txt",
      content: "VGhpcyBpcyBhIHRlc3QgYXR0YWNobWVudCBmb3IgQWlydGFibGUu", // Base64 for "This is a test attachment for Airtable."
      type: "text/plain",
    }

    // Create a test record
    const record = await new Promise((resolve, reject) => {
      base(submissionsTableId).create(
        {
          "Full Name": "Debug Test User",
          University: "Debug University",
          "Bounty ID": "debug-test",
          "Bounty Name": "Debug Test Bounty",
          "Submission Link": "https://example.com/debug",
          "Wallet Address": "debug-wallet-address",
          "Attachments (Optional)": [
            {
              filename: testAttachment.filename,
              type: testAttachment.type,
              url: `data:${testAttachment.type};base64,${testAttachment.content}`,
            },
          ],
        },
        (err: any, record: any) => {
          if (err) {
            console.error("Error creating test record:", err)
            reject(err)
          } else {
            resolve(record)
          }
        },
      )
    })

    return NextResponse.json({
      success: true,
      message: "Test attachment created successfully",
      recordId: (record as any).id,
    })
  } catch (error) {
    console.error("Error testing Airtable attachment:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: JSON.stringify(error),
      },
      { status: 500 },
    )
  }
}

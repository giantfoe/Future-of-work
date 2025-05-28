"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SyncButton } from "@/components/sync-button"

export default function AirtableDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        setLoading(true)
        const response = await fetch("/api/debug/airtable")

        if (!response.ok) {
          throw new Error(`Failed to fetch debug info: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setDebugInfo(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load debug info:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchDebugInfo()
  }, [])

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[800px] mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline mb-4 inline-flex items-center">
            ← Back to Home
          </Link>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold mt-4 mb-2">Airtable Debug</h1>
            <SyncButton />
          </div>
          <p className="text-gray-500">This page helps troubleshoot Airtable integration issues.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading debug information...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Access Token:</p>
                  <p className="text-gray-700">
                    {debugInfo.config.accessTokenExists ? (
                      <span className="text-green-600">✓ Set ({debugInfo.config.accessTokenFirstChars})</span>
                    ) : (
                      <span className="text-red-600">✗ Missing</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Base ID:</p>
                  <p className="text-gray-700">
                    <span className="text-green-600">✓ Set ({debugInfo.config.baseId})</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium">Bounties Table ID:</p>
                  <p className="text-gray-700">
                    <span className="text-green-600">✓ Set ({debugInfo.config.bountiesTableId})</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium">Submissions Table ID:</p>
                  <p className="text-gray-700">
                    {debugInfo.config.submissionsTableId ? (
                      <span className="text-green-600">✓ Set ({debugInfo.config.submissionsTableId})</span>
                    ) : (
                      <span className="text-red-600">✗ Missing</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Status:</p>
                  <p className="text-gray-700">
                    {debugInfo.connectionStatus === "Success" ? (
                      <span className="text-green-600">✓ Connected successfully</span>
                    ) : (
                      <span className="text-red-600">✗ Connection failed</span>
                    )}
                  </p>
                </div>
                {debugInfo.connectionDetails?.error && (
                  <div>
                    <p className="font-medium">Error:</p>
                    <pre className="text-red-600 bg-red-50 p-3 rounded overflow-auto text-sm">
                      {typeof debugInfo.connectionDetails.error === "object"
                        ? JSON.stringify(debugInfo.connectionDetails.error, null, 2)
                        : debugInfo.connectionDetails.error}
                    </pre>

                    {debugInfo.connectionDetails.error.includes("NOT_FOUND") && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="font-medium text-yellow-800">Possible Solutions:</p>
                        <ul className="list-disc list-inside mt-2 text-yellow-700">
                          <li>Double-check your Base ID (app15IobIPfU3YDf0)</li>
                          <li>Double-check your Table ID (tblakfzUZvuvWKbdI)</li>
                          <li>Make sure your Personal Access Token has access to this base</li>
                          <li>Try creating a new Personal Access Token with full access to all bases</li>
                        </ul>
                      </div>
                    )}

                    {debugInfo.connectionDetails.error.includes("UNAUTHORIZED") && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="font-medium text-yellow-800">Possible Solutions:</p>
                        <ul className="list-disc list-inside mt-2 text-yellow-700">
                          <li>Your Personal Access Token is invalid or expired</li>
                          <li>Generate a new Personal Access Token from your Airtable account</li>
                          <li>Make sure your Personal Access Token has access to this base</li>
                        </ul>
                      </div>
                    )}

                    {debugInfo.connectionDetails.error.includes("valid api key") && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="font-medium text-yellow-800">Possible Solutions:</p>
                        <ul className="list-disc list-inside mt-2 text-yellow-700">
                          <li>
                            You're using a Personal Access Token but the code is expecting it in a different format
                          </li>
                          <li>Make sure you're using the AIRTABLE_ACCESS_TOKEN environment variable</li>
                          <li>Try generating a new Personal Access Token with full permissions</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <p className="font-medium">Timestamp:</p>
                  <p className="text-gray-700">{debugInfo.timestamp}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {!debugInfo.config.accessTokenExists && (
                  <li>
                    Set the <code className="bg-gray-100 px-1 py-0.5 rounded">AIRTABLE_ACCESS_TOKEN</code> environment
                    variable with your Personal Access Token
                  </li>
                )}
                {!debugInfo.config.submissionsTableId && (
                  <li>
                    Set the <code className="bg-gray-100 px-1 py-0.5 rounded">AIRTABLE_SUBMISSIONS_TABLE_ID</code>{" "}
                    environment variable
                  </li>
                )}
                {debugInfo.connectionStatus !== "Success" && debugInfo.config.accessTokenExists && (
                  <>
                    <li>Check that your Personal Access Token is correct and has access to the specified base</li>
                    <li>Verify that the base ID and table IDs are correct</li>
                    <li>
                      Try using the{" "}
                      <Link href="/setup" className="text-primary hover:underline">
                        setup page
                      </Link>{" "}
                      to generate new environment variables
                    </li>
                  </>
                )}
                {debugInfo.connectionStatus === "Success" && (
                  <li>
                    <Link href="/airtable-bounties" className="text-primary hover:underline">
                      View Airtable Bounties
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

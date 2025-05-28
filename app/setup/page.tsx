"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function SetupPage() {
  const [accessToken, setAccessToken] = useState(
    "pat8J8TRW6SeqKvbR.bb20d9f95dad7701bdaec636839a01042fa3e48bfd8c35ec975657d85c03fb7c",
  )
  const [baseId, setBaseId] = useState("app15IobIPfU3YDf0")
  const [bountiesTableId, setBountiesTableId] = useState("tblakfzUZvuvWKbdI")
  const [submissionsTableId, setSubmissionsTableId] = useState("Submissions")
  const [copied, setCopied] = useState(false)

  const generateEnvFile = () => {
    return `AIRTABLE_PERSONAL_ACCESS_TOKEN=${accessToken}
AIRTABLE_BASE_ID=${baseId}
AIRTABLE_BOUNTIES_TABLE_ID=${bountiesTableId}
AIRTABLE_SUBMISSIONS_TABLE_ID=${submissionsTableId}`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEnvFile())
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[800px] mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline mb-4 inline-flex items-center">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Airtable Setup</h1>
          <p className="text-gray-500">Configure your Airtable integration by entering the required information.</p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <p className="text-gray-500 mb-6">
            Enter your Airtable credentials below. This information will be used to generate environment variables for
            your application.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessToken">Personal Access Token</Label>
              <Input
                id="accessToken"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="pat..."
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Your Airtable Personal Access Token. Find it at{" "}
                <a
                  href="https://airtable.com/create/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  airtable.com/create/tokens
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseId">Base ID</Label>
              <Input
                id="baseId"
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                placeholder="app..."
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Your Airtable Base ID. Find it in the URL when viewing your base: https://airtable.com/
                <strong>baseId</strong>/...
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bountiesTableId">Bounties Table ID</Label>
              <Input
                id="bountiesTableId"
                value={bountiesTableId}
                onChange={(e) => setBountiesTableId(e.target.value)}
                placeholder="tbl..."
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                The ID of your Bounties table. Often this is just the table name (e.g., "Bounties").
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionsTableId">Submissions Table ID</Label>
              <Input
                id="submissionsTableId"
                value={submissionsTableId}
                onChange={(e) => setSubmissionsTableId(e.target.value)}
                placeholder="tbl..."
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                The ID of your Submissions table. Often this is just the table name (e.g., "Submissions").
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generated Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm font-mono">{generateEnvFile()}</pre>
          <div className="mt-4">
            <Button onClick={copyToClipboard}>{copied ? "Copied!" : "Copy to Clipboard"}</Button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Copy the generated environment variables</li>
            <li>
              Add them to your <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file in the root of
              your project
            </li>
            <li>Restart your development server</li>
            <li>
              Visit the{" "}
              <Link href="/debug/airtable" className="text-primary hover:underline">
                debug page
              </Link>{" "}
              to verify your connection
            </li>
          </ol>
        </div>

        <div className="bg-white border rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Webhook Setup</h2>
          <p className="text-gray-500 mb-4">
            For real-time updates, you can set up webhooks to automatically sync changes from Airtable.
          </p>
          <Link href="/setup/webhooks">
            <Button variant="outline">Webhook Setup Guide</Button>
          </Link>
        </div>

        <div className="bg-white border rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Airtable Field Names</h2>
          <p className="text-gray-500 mb-4">Make sure your Airtable field names match what the application expects.</p>
          <Link href="/setup/airtable-fields">
            <Button variant="outline">Airtable Fields Guide</Button>
          </Link>
        </div>

        {copied && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <AlertDescription>Environment variables copied to clipboard!</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

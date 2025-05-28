"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function AirtableConnectionDebug() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    details?: any
    recordCount?: number
  } | null>(null)
  const [envVars, setEnvVars] = useState<{
    hasToken: boolean
    hasBaseId: boolean
    hasBountiesTableId: boolean
    hasSubmissionsTableId: boolean
  } | null>(null)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/airtable-connection")
      const data = await response.json()
      setConnectionStatus(data)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: "Failed to test connection",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEnvironmentVariables = async () => {
    try {
      const response = await fetch("/api/debug/environment-variables")
      const data = await response.json()
      setEnvVars(data)
    } catch (error) {
      console.error("Failed to check environment variables:", error)
    }
  }

  useEffect(() => {
    testConnection()
    checkEnvironmentVariables()
  }, [])

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline mb-4 inline-flex items-center">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4">Airtable Connection Diagnostics</h1>
          <p className="text-gray-500 mt-2">
            This page helps diagnose issues with your Airtable connection. It checks your environment variables and
            tests the connection to your Airtable base.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Environment Variables Check */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Checking if required environment variables are set</CardDescription>
            </CardHeader>
            <CardContent>
              {envVars ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {envVars.hasToken ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>AIRTABLE_PERSONAL_ACCESS_TOKEN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {envVars.hasBaseId ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>AIRTABLE_BASE_ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {envVars.hasBountiesTableId ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>AIRTABLE_BOUNTIES_TABLE_ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {envVars.hasSubmissionsTableId ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>AIRTABLE_SUBMISSIONS_TABLE_ID</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Checking environment variables...</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {envVars && !Object.values(envVars).every(Boolean) && (
                <Alert className="w-full bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-800" />
                  <AlertTitle className="text-yellow-800">Missing environment variables</AlertTitle>
                  <AlertDescription className="text-yellow-800">
                    Some required environment variables are missing. Please add them to your .env.local file or Vercel
                    project settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>

          {/* Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Test</CardTitle>
              <CardDescription>Testing connection to Airtable</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Testing connection...</span>
                </div>
              ) : connectionStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {connectionStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>{connectionStatus.message}</span>
                  </div>
                  {connectionStatus.success && connectionStatus.recordCount !== undefined && (
                    <div className="text-sm text-gray-500">
                      Found {connectionStatus.recordCount} records in the bounties table.
                    </div>
                  )}
                  {!connectionStatus.success && connectionStatus.details && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertTitle className="text-red-800">Error Details</AlertTitle>
                      <AlertDescription className="text-red-800 whitespace-pre-wrap font-mono text-xs">
                        {typeof connectionStatus.details === "string"
                          ? connectionStatus.details
                          : JSON.stringify(connectionStatus.details, null, 2)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No connection test results available.</div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={testConnection} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection Again"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Troubleshooting Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Guide</CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Invalid Personal Access Token</h3>
                  <p className="text-sm text-gray-500">
                    Ensure your Personal Access Token is valid and has the necessary permissions. Create a new token at{" "}
                    <a
                      href="https://airtable.com/create/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      airtable.com/create/tokens
                    </a>
                    .
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Incorrect Base ID</h3>
                  <p className="text-sm text-gray-500">
                    Verify your Base ID is correct. You can find it in the URL when viewing your base:
                    https://airtable.com/<strong>baseId</strong>/...
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Incorrect Table IDs</h3>
                  <p className="text-sm text-gray-500">
                    Make sure your table IDs are correct. These are often just the table names (e.g., "Bounties",
                    "Submissions").
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Permission Issues</h3>
                  <p className="text-sm text-gray-500">
                    Ensure your Personal Access Token has the necessary scopes:
                    <ul className="list-disc list-inside mt-2">
                      <li>data.records:read</li>
                      <li>data.records:write</li>
                      <li>schema.bases:read</li>
                    </ul>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

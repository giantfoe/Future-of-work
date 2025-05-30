"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function PrivyDebugPage() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPrivyConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/privy")
      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      setDebugResult({
        success: false,
        error: "Failed to test Privy connection",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mt-4">Privy Connection Diagnostics</h1>
        <p className="text-gray-500">
          This page helps diagnose issues with your Privy connection. It checks your environment variables and
          tests the connection to your Privy app.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Privy Connection</CardTitle>
          <CardDescription>Click the button below to test your Privy API connection</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testPrivyConnection} disabled={loading}>
            {loading ? "Testing..." : "Test Privy Connection"}
          </Button>
        </CardContent>
      </Card>

      {debugResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(debugResult.success)}
              Connection Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={debugResult.success ? "default" : "destructive"}>
                {debugResult.success ? "Success" : "Failed"}
              </Badge>
            </div>

            {debugResult.config && (
              <div>
                <h3 className="font-semibold mb-2">Environment Variables</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugResult.config.hasAppId)}
                    <span>PRIVY_APP_ID</span>
                    {debugResult.config.hasAppId && (
                      <span className="text-gray-500">({debugResult.config.appIdLength} chars)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugResult.config.hasAppSecret)}
                    <span>PRIVY_APP_SECRET</span>
                    {debugResult.config.hasAppSecret && (
                      <span className="text-gray-500">({debugResult.config.appSecretLength} chars)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {debugResult.connectionTest && (
              <div>
                <h3 className="font-semibold mb-2">API Connection Test</h3>
                <div className="text-sm space-y-1">
                  <div>Status: {debugResult.connectionTest.status} {debugResult.connectionTest.statusText}</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugResult.connectionTest.ok)}
                    <span>{debugResult.connectionTest.ok ? "Connected" : "Connection Failed"}</span>
                  </div>
                </div>
              </div>
            )}

            {debugResult.appData && (
              <div>
                <h3 className="font-semibold mb-2">App Information</h3>
                <div className="text-sm space-y-1">
                  <div>App ID: {debugResult.appData.id}</div>
                  <div>App Name: {debugResult.appData.name}</div>
                  <div>Created: {new Date(debugResult.appData.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            {debugResult.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                  <AlertCircle className="h-4 w-4" />
                  Error
                </div>
                <div className="text-red-600 text-sm">{debugResult.error}</div>
                {debugResult.details && (
                  <details className="mt-2">
                    <summary className="text-red-600 text-sm cursor-pointer">Show Details</summary>
                    <pre className="text-xs mt-1 bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(debugResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {!debugResult.success && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h4 className="font-medium text-blue-700 mb-2">Troubleshooting Steps:</h4>
                <ul className="text-blue-600 text-sm space-y-1 list-disc list-inside">
                  <li>Check that your PRIVY_APP_ID and PRIVY_APP_SECRET are set in your .env.local file</li>
                  <li>Verify your credentials are correct in your Privy dashboard</li>
                  <li>Make sure your Privy app is active and not suspended</li>
                  <li>Check your network connection</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
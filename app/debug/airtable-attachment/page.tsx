"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AirtableAttachmentDebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string; details?: string } | null>(
    null,
  )

  const testAttachment = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/debug/airtable-attachment")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Error testing attachment",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Airtable Attachment Debug</CardTitle>
          <CardDescription>
            Test the Airtable attachment functionality by creating a test record with an attachment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{result.message}</p>
                  {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                  {result.details && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">{result.details}</pre>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testAttachment} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Attachment Upload"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

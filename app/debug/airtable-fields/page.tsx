"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AirtableFieldsDebugPage() {
  const [fieldInfo, setFieldInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFieldInfo() {
      try {
        setLoading(true)
        const response = await fetch("/api/debug/airtable-fields")

        if (!response.ok) {
          throw new Error(`Failed to fetch field info: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setFieldInfo(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load field info:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchFieldInfo()
  }, [])

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-[800px] mx-auto">
        <div className="mb-8">
          <Link href="/debug/airtable" className="text-primary hover:underline mb-4 inline-flex items-center">
            ← Back to Airtable Debug
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Airtable Fields Debug</h1>
          <p className="text-gray-500">This page shows the field names from your Airtable table.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading field information...</p>
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
              <h2 className="text-xl font-semibold mb-4">Record Information</h2>
              <p className="text-gray-700">
                <span className="font-medium">Record ID:</span> {fieldInfo.recordId}
              </p>
            </div>

            <div className="bg-white border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Field Names</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Field Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fieldInfo.fields.map((field: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof field.value === "object" ? JSON.stringify(field.value) : String(field.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Raw Record Data</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(fieldInfo.rawRecord, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

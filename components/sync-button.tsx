"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface SyncButtonProps {
  onSuccess?: () => void
}

export function SyncButton({ onSuccess }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    try {
      setIsSyncing(true)

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sync data")
      }

      const result = await response.json()

      // Store the last synced time in localStorage
      const timestamp = result.timestamp || new Date().toISOString()
      localStorage.setItem("lastSynced", timestamp)

      toast({
        title: "Sync Successful",
        description: `Synced ${result.count} bounties at ${new Date(timestamp).toLocaleTimeString()}`,
      })

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error syncing data:", error)
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync data",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing}>
      {isSyncing ? "Syncing..." : "Sync Now"}
    </Button>
  )
}

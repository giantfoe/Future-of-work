"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface AutoSyncProps {
  interval?: number // Sync interval in milliseconds, default is 5 seconds
  enabled?: boolean // Whether auto-sync is enabled
  onSync?: () => void // Callback when sync happens
}

export function AutoSync({ interval = 5000, enabled = true, onSync }: AutoSyncProps) {
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!enabled) return

    // Get the last synced time from localStorage
    const storedTime = localStorage.getItem("lastSynced")
    if (storedTime) {
      setLastSynced(storedTime)
    }

    // Function to sync data
    const syncData = async () => {
      try {
        console.log("Checking for Airtable updates...")
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
        setLastSynced(timestamp)

        // If there were changes, refresh the data
        if (result.hasChanges) {
          console.log("Changes detected, updating UI...")

          // Call the onSync callback if provided
          if (onSync) {
            onSync()
          } else {
            // Otherwise, refresh the page to show updated data
            window.location.reload()
          }

          toast({
            title: "Updates Available",
            description: `New changes from Airtable have been applied`,
          })
        }
      } catch (error) {
        console.error("Error auto-syncing data:", error)
        // Don't show toast for auto-sync failures to avoid spamming the user
      }
    }

    // Run the sync immediately on mount
    syncData()

    // Set up interval for auto-sync
    const syncInterval = setInterval(syncData, interval)

    // Clean up interval on unmount
    return () => {
      clearInterval(syncInterval)
    }
  }, [enabled, interval, toast, onSync])

  // This component doesn't render anything
  return null
}

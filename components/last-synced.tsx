"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface LastSyncedProps {
  className?: string
}

export function LastSynced({ className }: LastSyncedProps) {
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  useEffect(() => {
    // Get the last synced time from localStorage
    const storedTime = localStorage.getItem("lastSynced")
    if (storedTime) {
      setLastSynced(storedTime)
    }

    // Set up an event listener for sync events
    const handleSync = (event: StorageEvent) => {
      if (event.key === "lastSynced") {
        setLastSynced(event.newValue)
      }
    }

    window.addEventListener("storage", handleSync)

    return () => {
      window.removeEventListener("storage", handleSync)
    }
  }, [])

  if (!lastSynced) {
    return null
  }

  return (
    <div className={`flex items-center text-xs text-gray-500 ${className}`}>
      <Clock className="h-3 w-3 mr-1" />
      <span>Last synced: {new Date(lastSynced).toLocaleString()}</span>
    </div>
  )
}

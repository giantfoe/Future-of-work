"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  deadline: string | Date
  onExpire?: () => void
  className?: string
  compact?: boolean
}

export function CountdownTimer({ deadline, onExpire, className = "", compact = false }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const targetDate = new Date(deadline)
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        // Deadline has passed
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        })
        if (onExpire) onExpire()
        return
      }

      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false,
      })
    }

    // Calculate initial time
    calculateTimeRemaining()

    // Set up interval to update every second
    const intervalId = setInterval(calculateTimeRemaining, 1000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [deadline, onExpire])

  // Format the time units with leading zeros
  const formatTimeUnit = (value: number): string => {
    return value.toString().padStart(2, "0")
  }

  if (timeRemaining.expired) {
    return (
      <div className={`flex items-center text-red-600 font-medium ${className}`}>
        <Clock className="h-4 w-4 mr-2" />
        <span>Deadline passed</span>
      </div>
    )
  }

  // Compact version that matches the existing design
  if (compact) {
    const showDays = timeRemaining.days > 0
    // Change color to red when 5 days or less remaining
    const isRunningLow = timeRemaining.days <= 5
    const timerColor = isRunningLow ? "text-red-600" : "text-gray-700"

    return (
      <div className={`flex items-center ${className}`}>
        <div className={`flex items-center ${timerColor}`}>
          <Clock className={`h-4 w-4 mr-1.5 ${timerColor}`} />
          <span className="font-medium">
            {showDays ? `${timeRemaining.days}d:` : ""}
            {formatTimeUnit(timeRemaining.hours)}h:
            {formatTimeUnit(timeRemaining.minutes)}m:
            {formatTimeUnit(timeRemaining.seconds)}s
          </span>
        </div>
      </div>
    )
  }

  // Full version with grid layout
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center text-gray-700 font-medium mb-1">
        <Clock className="h-4 w-4 mr-2 text-gray-500" />
        <span>Time remaining:</span>
      </div>
      <div className="grid grid-cols-4 gap-1 text-center">
        <div className="flex flex-col">
          <span className="text-lg font-bold">{timeRemaining.days}</span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">{formatTimeUnit(timeRemaining.hours)}</span>
          <span className="text-xs text-gray-500">hours</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">{formatTimeUnit(timeRemaining.minutes)}</span>
          <span className="text-xs text-gray-500">mins</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">{formatTimeUnit(timeRemaining.seconds)}</span>
          <span className="text-xs text-gray-500">secs</span>
        </div>
      </div>
    </div>
  )
}

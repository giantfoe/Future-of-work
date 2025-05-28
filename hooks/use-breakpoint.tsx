"use client"

import { useState, useEffect } from "react"

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xs")
  const [width, setWidth] = useState(0)

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    const handleResize = () => {
      const currentWidth = window.innerWidth
      setWidth(currentWidth)

      if (currentWidth >= breakpoints["2xl"]) {
        setBreakpoint("2xl")
      } else if (currentWidth >= breakpoints.xl) {
        setBreakpoint("xl")
      } else if (currentWidth >= breakpoints.lg) {
        setBreakpoint("lg")
      } else if (currentWidth >= breakpoints.md) {
        setBreakpoint("md")
      } else if (currentWidth >= breakpoints.sm) {
        setBreakpoint("sm")
      } else {
        setBreakpoint("xs")
      }
    }

    // Set initial values
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { breakpoint, width, isAboveLg: width >= breakpoints.lg }
}

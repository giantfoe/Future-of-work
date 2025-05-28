"use client"

import { useState, useEffect, useRef } from "react"

interface ScrollManagerOptions {
  threshold?: number
  scrollToTopThreshold?: number
}

export function useScrollManager(options: ScrollManagerOptions = {}) {
  const { threshold = 10, scrollToTopThreshold = 500 } = options

  const [scrolled, setScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // Determine scroll direction
          if (currentScrollY > lastScrollY.current) {
            setScrollDirection("down")
          } else if (currentScrollY < lastScrollY.current) {
            setScrollDirection("up")
          }

          // Show/hide scroll to top button
          if (currentScrollY > scrollToTopThreshold) {
            setShowScrollTop(true)
          } else {
            setShowScrollTop(false)
          }

          // Add shadow to header when scrolled
          if (currentScrollY > threshold) {
            setScrolled(true)
          } else {
            setScrolled(false)
          }

          setScrollPosition(currentScrollY)
          lastScrollY.current = currentScrollY
          ticking.current = false
        })

        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [threshold, scrollToTopThreshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return {
    scrolled,
    showScrollTop,
    scrollDirection,
    scrollPosition,
    scrollToTop,
    scrollToElement,
  }
}

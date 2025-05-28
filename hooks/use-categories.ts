"use client"

import { useState, useEffect } from "react"

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const response = await fetch("/api/categories")

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`)
        }

        const data = await response.json()

        // Normalize categories to lowercase for consistent filtering
        const normalizedCategories = data.map((category: string) => ({
          original: category,
          normalized: category.toLowerCase().replace(/\s+/g, "-"),
        }))

        setCategories(normalizedCategories)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch categories")

        // Fallback to default categories
        setCategories([
          { original: "Content creation", normalized: "content-creation" },
          { original: "Design", normalized: "design" },
          { original: "Engineering", normalized: "engineering" },
          { original: "Journalism", normalized: "journalism" },
          { original: "Media", normalized: "media" },
          { original: "Product", normalized: "product" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

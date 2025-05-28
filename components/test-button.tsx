"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function TestButton() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4 border rounded-lg">
      <p className="mb-2">Click count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Click me</Button>
    </div>
  )
}

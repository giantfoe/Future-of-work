import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-gray-500 mb-8 text-center">The bounty you're looking for doesn't exist or has been removed.</p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  )
}

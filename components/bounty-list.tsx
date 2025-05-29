import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock } from "lucide-react"
import type { Bounty } from "@/lib/types"

interface BountyListProps {
  bounties: Bounty[]
  featured?: boolean
}

export default function BountyList({ bounties, featured = false }: BountyListProps) {
  if (!bounties || bounties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No bounties available at the moment.</h3>
        <p className="text-muted-foreground mt-2">Check back later for new opportunities.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {bounties.map((bounty) => {
        // Calculate days left
        const deadline = new Date(bounty.deadline)
        const today = new Date()
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        return (
          <Card key={bounty.id} className="overflow-hidden border rounded-lg">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="inline-block bg-black text-white text-xs font-medium px-2.5 py-1 rounded mb-3">
                  open
                </div>
                <h3 className="text-xl font-bold mb-2">{bounty.title}</h3>
                <p className="text-gray-600 line-clamp-3 mb-4">{bounty.description}</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>Deadline: {new Date(bounty.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{daysLeft} days left</span>
                </div>
                <div className="text-xl font-bold text-primary">${bounty.reward} USD</div>
              </div>

              <Link href={`/bounties/${bounty.id}`}>
                <Button variant="default" className="w-full">
                  Submit Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

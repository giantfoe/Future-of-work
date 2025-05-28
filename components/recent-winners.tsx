import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Clock } from "lucide-react"
import type { Winner } from "@/lib/types"

interface RecentWinnersProps {
  winners: Winner[]
}

export default function RecentWinners({ winners }: RecentWinnersProps) {
  if (!winners || winners.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No winners yet.</h3>
        <p className="text-gray-500 mt-2">Be the first to complete a bounty!</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {winners.map((winner) => (
            <div key={winner.id} className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-100 text-gray-800">
                    {winner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{winner.name}</p>
                  <span className="text-primary font-bold text-sm">${winner.reward}</span>
                </div>
                <p className="text-sm text-gray-800 mt-1">
                  <Trophy className="h-3 w-3 text-yellow-500 inline-block mr-1" />
                  {winner.bountyTitle}
                </p>
                <div className="flex items-center mt-1">
                  <Clock className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{winner.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

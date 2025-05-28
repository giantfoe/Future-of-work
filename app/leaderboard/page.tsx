import { getWinners } from "@/lib/airtable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"

export default async function LeaderboardPage() {
  const winners = await getWinners()

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-gray-500">Top contributors and bounty winners</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Winners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {winners.map((winner, index) => (
                <div key={winner.id} className="flex items-center justify-between p-4 border-b last:border-0">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 font-bold mr-4">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarFallback className="bg-gray-100 text-gray-800">
                        {winner.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{winner.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Trophy className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{winner.bountyTitle}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary font-bold">${winner.reward}</div>
                    <div className="text-xs text-gray-500">{winner.timeAgo}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

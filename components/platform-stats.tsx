import { DollarSign, Users, TrendingUp, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { PlatformStats } from "@/lib/types"

interface PlatformStatsProps {
  stats: PlatformStats
}

export default function PlatformStats({ stats }: PlatformStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center mr-4">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <h3 className="text-2xl font-bold">${stats.totalEarned}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center mr-4">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Opportunities</p>
            <h3 className="text-2xl font-bold">{stats.availableOpportunities}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center mr-4">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Available</p>
            <h3 className="text-2xl font-bold">${stats.totalAvailable}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center mr-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center mr-4">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <h3 className="text-2xl font-bold">{stats.completionRate}%</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

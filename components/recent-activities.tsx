import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, FileText, DollarSign, Send, CheckCircle } from "lucide-react"
import type { Activity } from "@/lib/types"

interface RecentActivitiesProps {
  activities: Activity[]
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No recent activities yet.</h3>
        <p className="text-muted-foreground mt-2">Activities will appear here as users interact with the platform.</p>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_bounty":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "payment":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "application":
        return <Send className="h-4 w-4 text-purple-500" />
      case "submission":
        return <CheckCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case "new_bounty":
        return (
          <span>
            <span className="font-medium">{activity.bountyTitle}</span> was posted with a reward of ${activity.amount}
          </span>
        )
      case "payment":
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> received ${activity.amount} for completing{" "}
            <span className="font-medium">{activity.bountyTitle}</span>
          </span>
        )
      case "application":
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> applied for{" "}
            <span className="font-medium">{activity.bountyTitle}</span>
          </span>
        )
      case "submission":
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> submitted work for{" "}
            <span className="font-medium">{activity.bountyTitle}</span>
          </span>
        )
      default:
        return <span>{activity.message}</span>
    }
  }

  return (
    <div className="bg-background">
      <Card className="w-full shadow-none">
        <CardContent className="p-6">
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {activity.userName ? (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="glass-card text-muted-foreground">
                        {activity.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full glass-card flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">{getActivityMessage(activity)}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

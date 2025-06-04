"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, FileText, DollarSign, Send, CheckCircle, Activity as ActivityIcon, Zap } from "lucide-react"
import type { Activity } from "@/lib/types"
import { motion } from "framer-motion"

interface RecentActivitiesProps {
  activities: Activity[]
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No recent activities yet.</h3>
        <p className="text-muted-foreground mt-2">No recent activities to display.</p>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_bounty":
        return <FileText className="h-4 w-4 text-white" />
      case "payment":
        return <DollarSign className="h-4 w-4 text-white" />
      case "application":
        return <Send className="h-4 w-4 text-white" />
      case "submission":
        return <CheckCircle className="h-4 w-4 text-white" />
      default:
        return <Clock className="h-4 w-4 text-white" />
    }
  }

  const getActivityDotColor = (type: string) => {
    switch (type) {
      case "new_bounty":
        return "bg-blue-500"
      case "payment":
        return "bg-green-500"
      case "application":
        return "bg-purple-500"
      case "submission":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getActivityGradient = (type: string) => {
    switch (type) {
      case "new_bounty":
        return "from-blue-500/10 via-blue-500/5 to-transparent"
      case "payment":
        return "from-green-500/10 via-green-500/5 to-transparent"
      case "application":
        return "from-purple-500/10 via-purple-500/5 to-transparent"
      case "submission":
        return "from-orange-500/10 via-orange-500/5 to-transparent"
      default:
        return "from-gray-500/10 via-gray-500/5 to-transparent"
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
      <div className="w-full premium-card hover:transform hover:scale-[1.02] transition-all duration-500">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 mr-3">
              <ActivityIcon className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
            <div className="ml-auto">
              <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
            </div>
          </div>
          
          {/* Timeline Container */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-700 to-transparent opacity-60" />
            
            {/* Timeline Items */}
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative flex items-start group"
                >
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getActivityDotColor(activity.type)} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {getActivityIcon(activity.type)}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${getActivityGradient(activity.type)} animate-pulse`} />
                  </div>
                  
                  {/* Content Card */}
                  <div className="ml-6 flex-1">
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${getActivityGradient(activity.type)} border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:translateX-2 shadow-sm hover:shadow-md`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 ring-2 ring-white/20">
                            <AvatarFallback className="bg-white/10 text-foreground font-semibold text-xs">
                              {activity.userName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-semibold text-foreground">
                            {activity.userName || "Anonymous"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{activity.timeAgo}</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {getActivityMessage(activity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

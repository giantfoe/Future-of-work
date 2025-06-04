"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Clock, Star, Award, Crown } from "lucide-react"
import type { Winner } from "@/lib/types"
import { motion } from "framer-motion"

interface RecentWinnersProps {
  winners: Winner[]
}

export default function RecentWinners({ winners }: RecentWinnersProps) {
  if (!winners || winners.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No winners yet.</h3>
        <p className="text-muted-foreground mt-2">Be the first to complete a bounty!</p>
      </div>
    )
  }

  const getWinnerIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-4 w-4 text-white" />
      case 1:
        return <Award className="h-4 w-4 text-white" />
      case 2:
        return <Trophy className="h-4 w-4 text-white" />
      default:
        return <Star className="h-4 w-4 text-white" />
    }
  }

  const getWinnerDotColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 2:
        return "bg-gradient-to-r from-amber-600 to-amber-800"
      default:
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
    }
  }

  const getWinnerGradient = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-500/15 via-yellow-500/8 to-transparent"
      case 1:
        return "from-gray-500/15 via-gray-500/8 to-transparent"
      case 2:
        return "from-amber-500/15 via-amber-500/8 to-transparent"
      default:
        return "from-orange-500/15 via-orange-500/8 to-transparent"
    }
  }

  return (
    <div className="bg-background">
      <div className="w-full premium-card hover:transform hover:scale-[1.02] transition-all duration-500">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 mr-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Recent Winners</h3>
            <div className="ml-auto">
              <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
          </div>
          
          {/* Timeline Container */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-yellow-200 dark:via-yellow-700 to-transparent opacity-60" />
            
            {/* Timeline Items */}
            <div className="space-y-6">
              {winners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative flex items-start group"
                >
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getWinnerDotColor(index)} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {getWinnerIcon(index)}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${getWinnerGradient(index)} animate-pulse`} />
                  </div>
                  
                  {/* Content Card */}
                  <div className="ml-6 flex-1">
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${getWinnerGradient(index)} border border-white/10 hover:border-yellow-500/30 transition-all duration-300 hover:transform hover:translateX-2 shadow-sm hover:shadow-md`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 ring-2 ring-yellow-500/30">
                            <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-600 font-semibold text-xs">
                              {winner.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {winner.name}
                            </p>
                            {index < 3 && (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                  {index === 0 ? "🥇 1st Place" : index === 1 ? "🥈 2nd Place" : "🥉 3rd Place"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                            ${winner.reward}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{winner.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed flex items-center">
                        <Trophy className="h-3 w-3 text-yellow-500 mr-2" />
                        {winner.bountyTitle}
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

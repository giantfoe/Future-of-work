"use client"

import { Card, CardContent, CardHeader, CardTitle, CardTicker } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import CardMarkdownRenderer from "@/components/card-markdown-renderer"
import type { Bounty } from "@/lib/types"
import { getCategoryColors } from "@/components/category-tag"

interface RecentBountiesTickerProps {
  bounties: Bounty[]
}

export default function RecentBountiesTicker({ bounties }: RecentBountiesTickerProps) {
  if (!bounties || bounties.length === 0) {
    return null
  }

  // No need for a separate function as we'll use the utility function

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Recent Bounties</CardTitle>
      </CardHeader>
      <CardContent ticker={true} className="pb-4">
        <CardTicker>
          {/* Duplicate the bounties for continuous scrolling effect */}
          {[...bounties, ...bounties].map((bounty, index) => (
            <Link href={`/bounties/${bounty.id}`} key={`${bounty.id}-${index}`} className="mr-6 inline-block">
              <div className="w-64 border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  {typeof bounty.category === "string" && bounty.category.includes(",")
                    ? // Multiple categories - show only the first one in the ticker for space reasons
                      (() => {
                        const firstCategory = bounty.category.split(",")[0].trim()
                        const { bg, text } = getCategoryColors(firstCategory)
                        return (
                          <Badge variant="outline" className={`${bg} ${text} border-0`}>
                            {firstCategory.charAt(0).toUpperCase() + firstCategory.slice(1)}
                          </Badge>
                        )
                      })()
                    : // Single category
                      (() => {
                        const category = typeof bounty.category === "string" ? bounty.category : "Other"
                        const { bg, text } = getCategoryColors(category)
                        return (
                          <Badge variant="outline" className={`${bg} ${text} border-0`}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Badge>
                        )
                      })()}
                  <span className="text-sm font-medium text-muted-foreground">${bounty.reward}</span>
                </div>
                {/* Use Markdown renderer for title with single line */}
                <CardMarkdownRenderer content={bounty.title} className="font-medium text-sm" maxLines={1} />
              </div>
            </Link>
          ))}
        </CardTicker>
      </CardContent>
    </Card>
  )
}

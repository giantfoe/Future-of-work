import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function StatusLegend() {
  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Status Legend</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-1">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Bounties progress through these statuses</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
          <div>
            <p className="text-sm font-medium">Open</p>
            <p className="text-xs text-muted-foreground">Available for submissions</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
          <div>
            <p className="text-sm font-medium">In Review</p>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-gray-500 mr-2"></div>
          <div>
            <p className="text-sm font-medium">Closed</p>
            <p className="text-xs text-muted-foreground">Bounty has been awarded</p>
          </div>
        </div>
      </div>
    </div>
  )
}

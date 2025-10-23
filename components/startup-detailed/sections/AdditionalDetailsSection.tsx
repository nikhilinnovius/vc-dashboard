import { Calendar, Clipboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "../SectionHeader"
import { StatItem } from "../StatItem"
import type { StartupData } from "@/lib/data-utils"

interface AdditionalDetailsSectionProps {
  data: StartupData
}

export function AdditionalDetailsSection({ data }: AdditionalDetailsSectionProps) {
  const hasAdditionalDetails = data.conferences || data.expectedRaise || data.workflowTriggers || data.offshoreData
  
  if (!hasAdditionalDetails) return null

  return (
    <section className="bg-[#1f3b1d]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader className="mb-4" icon={<Clipboard className="h-5 w-5 text-white" />} title="Additional Details" />
      <div className="space-y-2">
        {data.conferences && (
          <StatItem
            label="Conferences"
            value={data.conferences}
            icon={<Calendar className="h-4 w-4 text-white" />}
          />
        )}

        {data.expectedRaise && (
          <StatItem
            label="Expected Raise"
            value={data.expectedRaise}
            icon={<Calendar className="h-4 w-4 text-white" />}
          />
        )}

        {data.workflowTriggers && (
          <StatItem
            label="Workflow Triggers"
            value={(() => {
              try {
                // Handle Python dict format by converting single quotes to double quotes
                const jsonString = data.workflowTriggers
                  .trim()
                  .replace(/'/g, '"');
                const parsed = JSON.parse(jsonString);
                return parsed?.text || data.workflowTriggers;
              } catch {
                return data.workflowTriggers;
              }
            })()}
            icon={<Clipboard className="h-4 w-4 text-white" />}
          />
        )}

        {data.offshoreData && (
          <div className="flex flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-white" />
              <span className="text-white/70 font-medium">Offshore Data</span>
            </div>
            <div className="flex flex-wrap gap-2">
            {data.offshoreData.split("; ").map((item: string, index: number) => (
              <Badge
                key={`offshore-${index}`}
                className="bg-white/5 hover:bg-white/10 text-white border-0 px-3 py-1"
              >
                {item.trim()}
              </Badge>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

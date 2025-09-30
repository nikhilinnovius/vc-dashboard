import { Calendar, Clipboard } from "lucide-react"
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
      <SectionHeader icon={<Clipboard className="h-5 w-5 text-white" />} title="Additional Details" />
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
          <StatItem
            label="Offshore Data"
            value={data.offshoreData}
            icon={<Clipboard className="h-4 w-4 text-white" />}
          />
        )}
      </div>
    </section>
  )
}

import { Info, Building, Target, Briefcase } from "lucide-react"
import { SectionHeader } from "../SectionHeader"
import { StatItem } from "../StatItem"
import type { StartupData } from "@/lib/data-utils"

interface KeyDetailsSectionProps {
  data: StartupData
}

export function KeyDetailsSection({ data }: KeyDetailsSectionProps) {
  const hasKeyDetails = data.businessModel || data.endMarket || data.subVertical || data.description

  if (!hasKeyDetails) return null

  return (
    <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader icon={<Info className="h-5 w-5 text-white" />} title="Key Details" />
      <div className="space-y-2">
        {data.businessModel && (
          <StatItem
            label="Business Model"
            value={data.businessModel}
            icon={<Briefcase className="h-4 w-4 text-white" />}
          />
        )}

        {data.endMarket && (
          <StatItem
            label="End Market"
            value={data.endMarket}
            icon={<Target className="h-4 w-4 text-white" />}
          />
        )}

        {data.subVertical && (
          <StatItem
            label="Sub Vertical"
            value={data.subVertical}
            icon={<Building className="h-4 w-4 text-white" />}
          />
        )}
      </div>
    </section>
  )
}

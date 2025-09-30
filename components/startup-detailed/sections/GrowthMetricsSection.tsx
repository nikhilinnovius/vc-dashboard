import { BarChart, Users, TrendingUp, Globe } from "lucide-react"
import { SectionHeader } from "../SectionHeader"
import { StatItem } from "../StatItem"
import { getGrowthStatus } from "@/utils/startup-utils"
import type { StartupData } from "@/lib/data-utils"

interface GrowthMetricsSectionProps {
  data: StartupData
}

export function GrowthMetricsSection({ data }: GrowthMetricsSectionProps) {
  return (
    <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader icon={<BarChart className="h-5 w-5 text-white" />} title="Growth Metrics" />
      <div className="space-y-2">
        {data.headcount180dPct !== undefined && data.headcount180dPct !== null && (
          <StatItem
            label="180d Headcount %"
            value={`${data.headcount180dPct}%`}
            icon={<Users className="h-4 w-4 text-white" />}
            {...getGrowthStatus(String(data.headcount180dPct))}
          />
        )}

        {data.headcount1yPct !== undefined && data.headcount1yPct !== null && (
          <StatItem
            label="1 Year Headcount %"
            value={`${data.headcount1yPct}%`}
            icon={<Users className="h-4 w-4 text-white" />}
            {...getGrowthStatus(String(data.headcount1yPct))}
          />
        )}

        {data.sales1yPct !== undefined && data.sales1yPct !== null && (
          <StatItem
            label="1 Year Sales %"
            value={`${data.sales1yPct}%`}
            icon={<TrendingUp className="h-4 w-4 text-white" />}
            {...getGrowthStatus(String(data.sales1yPct))}
          />
        )}

        {data.webTraffic1yPct !== undefined && data.webTraffic1yPct !== null && (
          <StatItem
            label="1 Year Web Traffic %"
            value={`${data.webTraffic1yPct}%`}
            icon={<Globe className="h-4 w-4 text-white" />}
            {...getGrowthStatus(String(data.webTraffic1yPct))}
          />
        )}

        {data.webTraffic180dPct !== undefined && data.webTraffic180dPct !== null && (
          <StatItem
            label="180d Web Traffic %"
            value={`${data.webTraffic180dPct}%`}
            icon={<Globe className="h-4 w-4 text-white" />}
            {...getGrowthStatus(String(data.webTraffic180dPct))}
          />
        )}

        {data.sales180dPct !== undefined && data.sales180dPct !== null && (
          <StatItem
            label="180d Sales Growth %"
            value={`${data.sales180dPct}%`}
            icon={<TrendingUp className="h-4 w-4 text-white" />}
            {...getGrowthStatus(String(data.sales180dPct))}
          />
        )}
      </div>
    </section>
  )
}

import { Building2, Link } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "../SectionHeader"
import { StatItem } from "../StatItem"
import type { StartupData } from "@/lib/data-utils"

interface CurrentInvestorsSectionProps {
  data: StartupData
}

export function CurrentInvestorsSection({ data }: CurrentInvestorsSectionProps) {
  const hasInvestorData = data.currentInvestors || data.innoviusInvestorConnections || data.innoviusConnected

  if (!hasInvestorData) return null

  return (
    <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader
        icon={<Building2 className="h-5 w-5 text-white" />}
        title="Current Investors"
      />
      <div className="space-y-3">
        {data.currentInvestors && (
          <div className="space-y-2">
            {/* <div className="text-sm text-white/60">Current Investors</div> */}
            <div className="flex flex-wrap gap-2">
               {data.currentInvestors.map((investor, index) => (
                 <Badge
                   key={`investor-${index}`}
                   variant="outline"
                   className="bg-white/5 hover:bg-white/10 text-white border-0 px-4 py-2 text-sm"
                 >
                   {investor}
                 </Badge>
               ))}
            </div>
          </div>
        )}
  
        {data.innoviusInvestorConnections && (
          <StatItem
            label="Innovius Investor Connections"
            value={data.innoviusInvestorConnections}
            icon={<Link className="h-4 w-4 text-white" />}
          />
        )}
  
        {data.innoviusConnected && (
          <StatItem
            label="Connected with Company"
            value={data.innoviusConnected ? "Yes" : "No"}
            icon={<Link className="h-4 w-4 text-white" />}
            positive={data.innoviusConnected}
          />
        )}
  
        {data.innoviusConnected !== undefined && (
          <StatItem
            label="Innovius Connected"
            value={data.innoviusConnected ? "Yes" : "No"}
            icon={<Link className="h-4 w-4 text-white" />}
            positive={data.innoviusConnected}
            negative={!data.innoviusConnected}
          />
        )}
      </div>
    </section>
  )
}

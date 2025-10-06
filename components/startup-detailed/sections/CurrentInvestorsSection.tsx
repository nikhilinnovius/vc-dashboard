import { Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "../SectionHeader"
import type { StartupData } from "@/lib/data-utils"

interface CurrentInvestorsSectionProps {
  data: StartupData
}

export function CurrentInvestorsSection({ data }: CurrentInvestorsSectionProps) {
  const hasInvestorData = data.currentInvestors || data.innoviusConnected

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
            <div className="flex flex-wrap gap-2">
              {data.currentInvestors.map((investor, index) => {
                const innoviusConnectionsRaw = data.innoviusInvestorConnections
                const innoviusConnectionsList = Array.isArray(innoviusConnectionsRaw)
                  ? innoviusConnectionsRaw
                  : (innoviusConnectionsRaw || "")
                      .split(";")
                      .map((s) => s.trim())
                      .filter(Boolean)

                const innoviusSet = new Set(
                  innoviusConnectionsList.map((name) => name.toLowerCase()),
                )
                const isInnoviusConnected = innoviusSet.has(investor.toLowerCase())

                return (
                  <Badge
                    key={`investor-${index}`}
                    variant="outline"
                    className={
                      isInnoviusConnected
                        ? "bg-white text-black border-0 px-4 py-2 text-sm"
                        : "bg-white/5 hover:bg-white/10 text-white border-0 px-4 py-2 text-sm"
                    }
                  >
                    {investor}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

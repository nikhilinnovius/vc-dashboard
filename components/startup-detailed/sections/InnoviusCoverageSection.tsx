import { Clipboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "../SectionHeader"
import type { StartupData } from "@/lib/data-utils"

interface InnoviusCoverageSectionProps {
  data: StartupData
}

export function InnoviusCoverageSection({ data }: InnoviusCoverageSectionProps) {
  if (!data.innoviusCoverage) return null
  
  return (
    <section className="bg-[#1f3b1d]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader icon={<Clipboard className="h-5 w-5 text-white" />} title="Innovius Coverage" />
      <div className="flex flex-wrap gap-2">
        {data.innoviusCoverage.split(";").map((person: string, index: number) => (
          <Badge
            key={`coverage-${index}`}
            variant="outline"
            className="bg-white/5 hover:bg-white/10 text-white border-0 px-3 py-1"
          >
            {person.trim()}
          </Badge>
        ))}
      </div>
    </section>
  )
}

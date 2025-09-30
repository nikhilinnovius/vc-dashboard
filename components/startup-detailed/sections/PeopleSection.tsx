import { Users } from "lucide-react"
import { SectionHeader } from "../SectionHeader"
import { AffinityPeople } from "@/components/affinity-people"
import type { StartupData } from "@/lib/data-utils"

interface PeopleSectionProps {
  data: StartupData
}

export function PeopleSection({ data }: PeopleSectionProps) {
  return (
    <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader icon={<Users className="h-5 w-5 text-white" />} title="People" />
      <AffinityPeople domain={data.website || ""} />
    </section>
  )
}

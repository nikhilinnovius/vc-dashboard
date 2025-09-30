import { User, Linkedin } from "lucide-react"
import { SectionHeader } from "../SectionHeader"
import type { StartupData } from "@/types/startup"

interface CEOLinkedInSectionProps {
  ceoLinkedin: string
}

export function CEOLinkedInSection({ ceoLinkedin }: CEOLinkedInSectionProps) {
  if (!ceoLinkedin) return null

  return (
    <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader icon={<User className="h-5 w-5 text-white" />} title="CEO LinkedIn" />
      <div className="flex flex-col space-y-2">
        {ceoLinkedin.split(",").map((url, index) => {
          const profileName = url.trim().split("/").pop()?.replace(/\/$/, "")
          return (
            <a
              key={index}
              href={url.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="bg-white/20 text-white rounded-full p-2">
                <Linkedin className="h-5 w-5" />
              </div>
              <div className="font-medium text-white break-all">{profileName}</div>
            </a>
          )
        })}
      </div>
    </section>
  )
}

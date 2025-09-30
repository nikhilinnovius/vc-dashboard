import { Award } from "lucide-react"
import { SectionHeader } from "../SectionHeader"
import { formatScoreReasoning } from "@/utils/score-formatting"

interface ScoreReasoningSectionProps {
  scoreReasoning: string
}

export function ScoreReasoningSection({ scoreReasoning }: ScoreReasoningSectionProps) {
  if (!scoreReasoning) return null

  return (
    <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
      <SectionHeader icon={<Award className="h-5 w-5 text-large text-white" />} title="Score Reasoning" />
      <div className="bg-white/5 p-4 rounded-lg whitespace-pre-wrap leading-relaxed text-white">
        {formatScoreReasoning(scoreReasoning)}
      </div>
    </section>
  )
}

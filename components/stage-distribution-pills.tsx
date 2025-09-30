"use client"

import { Badge } from "@/components/ui/badge"

interface StageDistributionPillsProps {
  stageDistribution: string
}

// Define colors for different stages
const getStageColor = (stage: string): string => {
  const normalizedStage = stage.toLowerCase().trim()

  if (normalizedStage.includes("seed")) {
    return "bg-green-500/20 text-green-300 border-green-500/30"
  } else if (normalizedStage.includes("series a") || normalizedStage.includes("series-a")) {
    return "bg-blue-500/20 text-blue-300 border-blue-500/30"
  } else if (normalizedStage.includes("series b") || normalizedStage.includes("series-b")) {
    return "bg-purple-500/20 text-purple-300 border-purple-500/30"
  } else if (normalizedStage.includes("series c") || normalizedStage.includes("series-c")) {
    return "bg-orange-500/20 text-orange-300 border-orange-500/30"
  } else if (normalizedStage.includes("series d") || normalizedStage.includes("series-d")) {
    return "bg-red-500/20 text-red-300 border-red-500/30"
  } else if (normalizedStage.includes("growth") || normalizedStage.includes("late")) {
    return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
  } else if (normalizedStage.includes("pre-seed") || normalizedStage.includes("preseed")) {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  } else {
    return "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }
}

export function StageDistributionPills({ stageDistribution }: StageDistributionPillsProps) {
  if (!stageDistribution || stageDistribution.trim() === "") {
    return null
  }

  // Parse the stage distribution string
  // Format: "SERIES C (5); SERIES A (3); SEED (2)"
  const stages = stageDistribution
    .split(";")
    .map((stage) => stage.trim())
    .filter((stage) => stage.length > 0)
    .map((stage) => {
      // Extract stage name and count
      const match = stage.match(/^(.+?)\s*$$(\d+)$$$/)
      if (match) {
        return {
          name: match[1].trim(),
          count: Number.parseInt(match[2], 10),
        }
      }
      return {
        name: stage,
        count: 0,
      }
    })
    .filter((stage) => stage.name.length > 0)

  if (stages.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {stages.map((stage, index) => (
        <Badge
          key={index}
          variant="outline"
          className={`text-xs font-medium border ${getStageColor(stage.name)} hover:opacity-80 transition-opacity`}
        >
          {stage.name} {stage.count > 0 && `(${stage.count})`}
        </Badge>
      ))}
    </div>
  )
}

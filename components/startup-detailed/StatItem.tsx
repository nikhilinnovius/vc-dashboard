import type React from "react"
import { cn } from "@/lib/utils"

interface StatItemProps {
  label: string
  value: string
  icon?: React.ReactNode
  positive?: boolean
  negative?: boolean
}

export function StatItem({ label, value, icon, positive = false, negative = false }: StatItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-[#1f3b1d]/80 hover:bg-[#184618]/90 transition-colors">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white/70">{label}</span>
      </div>
      <span className="font-medium text-white">
        {value}
      </span>
    </div>
  )
}

import type React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  className?: string
}

export function SectionHeader({ icon, title, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center space-x-2 mb-3", className)}>
      {icon}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  )
}

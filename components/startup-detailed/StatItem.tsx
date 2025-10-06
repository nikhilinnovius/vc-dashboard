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
  // Check if value is numeric and determine color
  const numericValue = parseFloat(value)
  const isNumeric = !isNaN(numericValue) && isFinite(numericValue)
  const isPositive = isNumeric && numericValue > 0
  
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-[#1f3b1d]/80 hover:bg-[#184618]/90 transition-colors">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white/70">{label}</span>
      </div>
      {!isNumeric && <span className="font-medium text-white">{value}</span>} {/* Show value as white text if not numeric */}
      {isNumeric && <span className={isPositive ? "font-medium text-green-500" : "font-medium text-red-500"}> {/* Switch between green and red based on positive or negative */}
        {value}
      </span>}
    </div>
  )
}

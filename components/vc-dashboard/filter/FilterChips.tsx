"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterChip {
  id: string
  label: string
  category: string
}

interface FilterChipsProps {
  filters: FilterChip[]
  onRemoveFilter: (id: string) => void
  onClearAll: () => void
  className?: string
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  className
}) => {
  if (filters.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1 text-xs"
        >
          <span className="font-medium text-muted-foreground">{filter.category}:</span>
          <span>{filter.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(filter.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs text-white hover:text-white hover:bg-gray-600"
      >
        Clear all
      </Button>
    </div>
  )
}

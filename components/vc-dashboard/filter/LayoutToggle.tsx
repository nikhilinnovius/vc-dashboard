import React from 'react'
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LayoutToggleProps {
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  className?: string
}

export const LayoutToggle = ({ 
  layout, 
  onLayoutChange, 
  className = "" 
}: LayoutToggleProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Button
        variant={layout === 'grid' ? 'default' : 'outline'}
        size="icon"
        onClick={() => onLayoutChange('grid')}
        className={layout == 'grid' 
          ? 'bg-white text-black hover:bg-gray-100 h-9 w-9 rounded-l-md rounded-r-none' 
          : 'bg-transparent text-white hover:bg-white/20 border border-white/30 h-9 w-9 rounded-l-md rounded-r-none'
        }
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={layout === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => onLayoutChange('list')}
        className={layout == 'list' 
          ? 'bg-white text-black hover:bg-gray-100 h-9 w-9 rounded-r-md rounded-l-none' 
          : 'bg-transparent text-white hover:bg-white/20 border border-white/30 h-9 w-9 rounded-r-md rounded-l-none'
        }
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectDropdownProps {
  label: string
  options: string[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter(v => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }


  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full sm:w-48 justify-between text-left font-normal bg-background/30 border-border/60 hover:bg-background/50 hover:border-border transition-colors",
        )}
      >
        <span className="truncate text-white">
          {placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full sm:w-48 z-50 mt-1 bg-background/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="p-2">
            {/* Individual Options */}
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-md cursor-pointer transition-colors"
                onClick={() => handleToggle(option)}
              >
                <Checkbox
                  checked={selectedValues.includes(option)}
                />
                <span className="text-sm text-black">{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

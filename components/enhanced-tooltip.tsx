"use client"

import type React from "react"

import { Info } from "lucide-react"
import { useState, useRef, useEffect, type ReactNode } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

interface EnhancedTooltipProps {
  title: string
  description: string
  children: ReactNode
}

export function EnhancedTooltip({ title, description, children }: EnhancedTooltipProps) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const tooltipTriggerRef = useRef<HTMLDivElement>(null)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Handle click for mobile devices
  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault()
      e.stopPropagation()
      setOpen(!open)
    }
  }

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isMobile) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (tooltipTriggerRef.current && !tooltipTriggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("click", handleOutsideClick)
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick)
    }
  }, [open, isMobile])

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen} delayDuration={isMobile ? 0 : 300}>
        <TooltipPrimitive.Trigger asChild>
          <div
            ref={tooltipTriggerRef}
            className="group inline-flex items-center gap-1 cursor-help"
            onClick={handleClick}
          >
            {children}
            <Info className="h-3.5 w-3.5 text-muted-foreground/70 opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align="end"
            sideOffset={8}
            alignOffset={-10}
            className={cn(
              "z-[9999] overflow-visible",
              "rounded-lg border bg-gradient-to-br from-card/95 to-card/80 px-4 py-3",
              "backdrop-blur-md border-muted/30 shadow-xl",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            )}
          >
            <div className="max-w-xs space-y-2">
              <h4 className="font-semibold text-base border-b border-muted/20 pb-1 mb-1">{title}</h4>
              <p className="leading-relaxed text-sm text-muted-foreground whitespace-normal">{description}</p>
            </div>
            <TooltipPrimitive.Arrow className="fill-border" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

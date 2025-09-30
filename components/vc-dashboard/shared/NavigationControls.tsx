import React from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, ChevronLeft, ChevronRight } from "lucide-react"

interface BackButtonProps {
  onBack: () => void
  label?: string
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  onBack, 
  label = "Back", 
  variant = "outline",
  className = "bg-white/10 text-white hover:bg-white/20 border-white/20"
}) => (
  <Button
    variant={variant}
    onClick={onBack}
    className={className}
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    {label}
  </Button>
)

interface HomeButtonProps {
  onHome: () => void
  label?: string
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export const HomeButton: React.FC<HomeButtonProps> = ({ 
  onHome, 
  label = "Home", 
  variant = "outline",
  className = "bg-white/10 text-white hover:bg-white/20 border-white/20"
}) => (
  <Button
    variant={variant}
    onClick={onHome}
    className={className}
  >
    <Home className="mr-2 h-4 w-4" />
    {label}
  </Button>
)

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}) => {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="bg-white/10 text-white hover:bg-white/20 border-white/20 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <span className="text-white text-sm px-3">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="bg-white/10 text-white hover:bg-white/20 border-white/20 disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface BreadcrumbProps {
  items: Array<{
    label: string
    onClick?: () => void
    isActive?: boolean
  }>
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => (
  <nav className={`flex items-center space-x-2 text-sm ${className}`}>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="text-white/40">/</span>}
        {item.onClick ? (
          <button
            onClick={item.onClick}
            className={`hover:text-white transition-colors ${
              item.isActive ? "text-white font-medium" : "text-white/60"
            }`}
          >
            {item.label}
          </button>
        ) : (
          <span className={item.isActive ? "text-white font-medium" : "text-white/60"}>
            {item.label}
          </span>
        )}
      </React.Fragment>
    ))}
  </nav>
)

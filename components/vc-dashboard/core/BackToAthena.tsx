import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackToAthenaButtonProps {
  className?: string
}

/**
 * BackToAthenaButton Component
 * 
 * A reusable navigation button that directs users back to the Athena homepage.
 * Designed to be prominently displayed and visually appealing while maintaining
 * consistency with the application's design system.
 * 
 * Features:
 * - Responsive design that adapts to various screen sizes
 * - Consistent styling with the application's theme
 * - Clear visual indication of navigation purpose
 * - Accessible with proper ARIA labels
 */
export function BackToAthenaButton({ className = "" }: BackToAthenaButtonProps) {
  /**
   * Handles navigation to the Athena homepage
   * Navigates to the main Athena landing page at athena.innoviuscapital.com
   */
  const handleBackToAthena = () => {
    window.location.href = "https://athena.innoviuscapital.com/"
  }

  return (
    <Button
      onClick={handleBackToAthena}
      variant="outline"
      className={`
        bg-white/10 text-white hover:bg-white/20 border-white/20 
        transition-all duration-200 hover:scale-105 
        flex items-center gap-2 font-medium
        h-10 px-3 py-2 text-sm
        ${className}
      `}
      aria-label="Navigate back to Athena homepage"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden md:inline">Back to Athena</span>
      <span className="md:hidden">Home</span>
    </Button>
  )
}

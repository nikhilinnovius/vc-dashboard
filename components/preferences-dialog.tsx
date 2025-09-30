"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Define theme options
const themeOptions = [
  {
    id: "default",
    name: "Default Blue",
    gradient: "from-[#3870a7] to-[#dddddd]",
    preview: "bg-gradient-to-br from-[#3870a7] to-[#dddddd]",
  },
  {
    id: "purple",
    name: "Purple Haze",
    gradient: "from-[#6b46c1] to-[#d6bcfa]",
    preview: "bg-gradient-to-br from-[#6b46c1] to-[#d6bcfa]",
  },
  {
    id: "green",
    name: "Forest Green",
    gradient: "from-[#2f855a] to-[#c6f6d5]",
    preview: "bg-gradient-to-br from-[#2f855a] to-[#c6f6d5]",
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    gradient: "from-[#dd6b20] to-[#feebc8]",
    preview: "bg-gradient-to-br from-[#dd6b20] to-[#feebc8]",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    gradient: "from-[#2c5282] to-[#90cdf4]",
    preview: "bg-gradient-to-br from-[#2c5282] to-[#90cdf4]",
  },
  {
    id: "dark",
    name: "Dark Mode",
    gradient: "from-[#1a202c] to-[#4a5568]",
    preview: "bg-gradient-to-br from-[#1a202c] to-[#4a5568]",
  },
  // Add the new color schemes
  {
    id: "fightingIrish",
    name: "Fighting Irish",
    gradient: "from-[#041E3E] to-[#CA9800]",
    preview: "bg-gradient-to-br from-[#041E3E] to-[#CA9800]",
  },
  {
    id: "yellowJackets",
    name: "Yellow Jackets",
    gradient: "from-[#BFAC73] to-[#023059]",
    preview: "bg-gradient-to-br from-[#BFAC73] to-[#023059]",
  },
  {
    id: "lordJeffs",
    name: "Lord Jeffs",
    gradient: "from-[#470A77] to-[#dddddd]",
    preview: "bg-gradient-to-br from-[#470A77] to-[#dddddd]",
  },
  {
    id: "columbians",
    name: "Columbians",
    gradient: "from-[#59B2E7] to-[#023059]",
    preview: "bg-gradient-to-br from-[#59B2E7] to-[#023059]",
  },
  {
    id: "quakers",
    name: "Quakers",
    gradient: "from-[#8C0303] to-[#022859]",
    preview: "bg-gradient-to-br from-[#8C0303] to-[#022859]",
  },
  {
    id: "cardinals",
    name: "Cardinals",
    gradient: "from-[#8C1616] to-[#02735E]",
    preview: "bg-gradient-to-br from-[#8C1616] to-[#02735E]",
  },
  {
    id: "huskies",
    name: "Huskies",
    gradient: "from-[#D90404] to-[#000000]",
    preview: "bg-gradient-to-br from-[#D90404] to-[#000000]",
  },
]

interface PreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTheme: string
  onThemeChange: (themeId: string) => void
}

export function PreferencesDialog({ open, onOpenChange, currentTheme, onThemeChange }: PreferencesDialogProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)

  // Add this useEffect to update selectedTheme when currentTheme changes
  useEffect(() => {
    setSelectedTheme(currentTheme)
  }, [currentTheme])
  const { toast } = useToast()

  const handleSave = () => {
    onThemeChange(selectedTheme)
    onOpenChange(false)
    toast({
      title: "Preferences saved",
      description: "Your dashboard appearance has been updated.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Appearance Preferences</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedTheme}
            onValueChange={setSelectedTheme}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {themeOptions.map((theme) => (
              <div key={theme.id} className="relative">
                <RadioGroupItem value={theme.id} id={theme.id} className="sr-only peer" />
                <Label
                  htmlFor={theme.id}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className={`w-full h-24 rounded-md mb-2 ${theme.preview}`}></div>
                  <div className="font-medium">{theme.name}</div>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

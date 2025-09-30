"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define theme options
export const themeOptions = {
  default: "from-[#3870a7] to-[#dddddd]",
  purple: "from-[#6b46c1] to-[#d6bcfa]",
  green: "from-[#2f855a] to-[#c6f6d5]",
  sunset: "from-[#dd6b20] to-[#feebc8]",
  ocean: "from-[#2c5282] to-[#90cdf4]",
  dark: "from-[#1a202c] to-[#4a5568]",
  // Add the new color schemes
  fightingIrish: "from-[#041E3E] to-[#CA9800]",
  yellowJackets: "from-[#BFAC73] to-[#023059]",
  lordJeffs: "from-[#470A77] to-[#dddddd]",
  columbians: "from-[#59B2E7] to-[#023059]",
  quakers: "from-[#8C0303] to-[#022859]",
  cardinals: "from-[#8C1616] to-[#02735E]",
  huskies: "from-[#D90404] to-[#000000]",
}

type ThemeContextType = {
  theme: string
  themeGradient: string
  setTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<string>("green")

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("vc-dashboard-theme")
    if (savedTheme && themeOptions[savedTheme as keyof typeof themeOptions]) {
      setTheme(savedTheme)
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("vc-dashboard-theme", theme)
  }, [theme])

  const themeGradient = themeOptions[theme as keyof typeof themeOptions] || themeOptions.default

  return <ThemeContext.Provider value={{ theme, themeGradient, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

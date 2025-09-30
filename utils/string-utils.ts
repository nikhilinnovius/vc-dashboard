/**
 * Utility functions for string manipulation
 */

export const capitalizeFirstLetter = (string: string): string => {
  if (!string) return ""
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const formatLocationCount = (locations: string[], filterType: "state" | "city"): string => {
  return `${locations.length} ${filterType === "state" ? "States" : "Cities"}`
}

export const formatStartupCount = (count: number): string => {
  return `${count} ${count === 1 ? "startup" : "startups"}`
}

export const formatFirmCount = (count: number): string => {
  return `${count} ${count === 1 ? "firm" : "firms"}`
}

export const generateVCId = (vcName: string): string => {
  return `vc-${vcName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export const formatAUM = (aum: string | undefined): string => {
  if (!aum) return ""
  return `AUM: ${aum}`
}

export const formatPortfolioScore = (score: number | undefined): string => {
  if (!score) return ""
  return `Score: ${Math.round(score)}`
}

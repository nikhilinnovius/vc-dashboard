// Helper functions for startup data processing and formatting

export function getRaisePredictionColor(predictor: string | undefined): string {
  if (!predictor || predictor.trim() === "") return "bg-gray-500"

  const predictorLower = predictor.toLowerCase().trim()

  if (
    predictorLower == "n/a" ||
    predictorLower == "not available"
  ) {
    return "bg-black"
  }
  if (predictorLower.startsWith("no")) return "bg-red-500"
  if (predictorLower.startsWith("yes")) return "bg-green-500"
  if (predictorLower.startsWith("maybe")) return "bg-yellow-500"

  return "bg-gray-500"
}

export function getRaisePredictionTooltip(predictor: string | undefined): string {
  if (!predictor || predictor.trim() === "") return "Raise Prediction: Unknown"

  const predictorLower = predictor.toLowerCase().trim()

  if (
    predictorLower == "n/a" ||
    predictorLower == "not available"
  ) {
    return "Raise Prediction: Not Available or N/A"
  }

  return `Raise Prediction: ${predictor}`
}

export function getCompanyScoreColor(score: number | undefined): string {
  if (!score || isNaN(score)) return "text-gray-500"

  return score > 0 ? "text-green-500" : "text-red-500"  // Green for positive, red for negative

}

export function getRaisePredictionTextColor(predictor: string | undefined): string {
  if (!predictor || predictor.trim() === "") return "text-gray-500"

  const predictorLower = predictor.toLowerCase().trim()

  if (
    predictorLower == "n/a" ||
    predictorLower == "not available"
  ) {
    return "text-black"
  }
  if (predictorLower.includes("no")) return "text-red-500"
  if (predictorLower.includes("yes")) return "text-green-500"
  if (predictorLower.includes("maybe")) return "text-yellow-500"

  return "text-gray-500"
}

export function formatNumber(num: string | number): string {
  const parsedNum = typeof num == "string" ? Number(num) : num
  return Math.round(parsedNum).toLocaleString("en-US")

}

export function formatEmployeeCount(count: string | undefined): string {
  if (!count) return ""
  const parsedCount = typeof count == "string" ? Number(count) : count
  return Math.round(Number(parsedCount)).toLocaleString("en-US")
}

export function getGrowthStatus(value: string | undefined) {
  if (!value) return {}
  const numValue = Number(value)
  if (Number.isNaN(numValue)) return {}
  return {
    positive: numValue > 0,
    negative: numValue < 0,
  }
}

export function extractVCName(vcId: string | undefined): string | null {
  if (!vcId) return null

  const vcIdParts = vcId.split("-")
  if (vcIdParts.length < 2 || vcIdParts[0] !== "vc") return null

  return vcIdParts
    .slice(1)
    .join("-")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Status color mapping and utilities
export const STATUS_COLORS: Record<string, string> = {
    Cold: "#9b9ea7",
    "In Queue": "#e0e3ea",
    "Tracking - Too Early": "#e0e3ea",
    Contracted: "#f37d00",
    Engaged: "#f37d00",
    Nurture: "#f37d00",
    "Meeting Booked": "#f37d00",
    "1st Meeting": "#126bf5",
    "Follow-up meeting(s)": "#126bf5",
    "Data Room": "#126bf5",
    "IC 1": "#5726da",
    "IC 2": "#5726da",
    "IC 3": "#5726da",
    "Term Sheet": "#5726da",
    Portfolio: "#008a68",
    Closed: "#dc4041",
    Paused: "#f37d00",
  }
  
export function getStatusColor(status: string): string {
    return STATUS_COLORS[status] || "#9b9ea7"
}
  

// Function to get Tailwind color name for status
export function getStatusTailwindColor(status: string): string {
  const statusTailwindMap: Record<string, string> = {
    "Cold": "gray", // Gray
    "In Queue": "gray", // Light gray
    "Tracking - Too Early": "gray", // Light gray
    "Contacted": "orange", // Orange
    "Engaged": "orange", // Orange
    "Nurture": "orange", // Orange
    "Meeting Booked": "orange", // Orange
    "1st Meeting": "blue", // Blue
    "Follow-up meeting(s)": "blue", // Blue
    "Data Room": "blue", // Blue
    "IC 1": "purple", // Purple
    "Not Available": "gray", // Gray
    "IC 2": "purple", // Purple
    "IC 3": "purple", // Purple
    "Term Sheet": "purple", // Purple
    "Portfolio": "green", // Green
    "Closed": "red", // Red
    "Paused": "orange", // Orange
  }
  
  return statusTailwindMap[status] || "gray"
}

export function formatStartupDate(date: string): string {
  // format "2014-12-31" to "12/31/2014"
  if (!date) return ""
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  return ""
}
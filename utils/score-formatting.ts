// Score reasoning formatting utilities

export function formatScoreReasoning(reasoning: string): string {
  if (!reasoning) return ""

  // Handle the "Top 3 drivers" format (GOOD)
  if (reasoning.includes("Top 3 drivers")) {
    return formatGoodScoreReasoning(reasoning)
  }
  // Handle the BAD score format
  else if (reasoning.includes("BAD")) {
    return formatBadScoreReasoning(reasoning)
  }
  // Handle the MIDDLE score format
  else if (reasoning.includes("MIDDLE")) {
    return formatMiddleScoreReasoning(reasoning)
  }

  // Default case: return the original text with basic formatting
  return reasoning.replace(/;/g, "\n")
}

function formatGoodScoreReasoning(reasoning: string): string {
  const parts = reasoning.split("Top 3 drivers")
  if (parts.length < 2) return reasoning

  const firstPart = parts[0].trim()
  const driversIntro = "Top 3 drivers"
  const driversList = parts[1].split(";").map((item) => item.trim())

  let formattedDrivers = ""
  driversList.forEach((driver, index) => {
    if (index === 0) {
      const driverParts = driver.split(":")
      if (driverParts.length > 1) {
        formattedDrivers += `${driverParts[0]}:\n`
        formattedDrivers += `1. ${driverParts[1].trim()}\n`
      } else {
        formattedDrivers += `1. ${driver}\n`
      }
    } else {
      formattedDrivers += `${index + 1}. ${driver}\n`
    }
  })

  return `${firstPart}\n${driversIntro} ${formattedDrivers}`
}

function formatBadScoreReasoning(reasoning: string): string {
  const introMatch = reasoning.match(/(Score is [\d.]+ => BAD.*?)\./i)
  const intro = introMatch ? introMatch[1] : "Score is BAD"

    const driversMatch = reasoning.match(/Lowest 3 drivers:([\s\S]*)/m) || reasoning.match(/Lowest \d+ drivers:([\s\S]*)/m)

  if (!driversMatch) {
    return formatFallbackBadReasoning(reasoning, intro)
  }

  const driversText = driversMatch[1].trim()
  const drivers = driversText
    .split(/[\n;]/)
    .map((driver) => driver.trim())
    .filter(Boolean)

  const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver}`).join("\n")

  return `${intro}.\nBottom 3 drivers:\n${formattedDrivers}`
}

function formatFallbackBadReasoning(reasoning: string, intro: string): string {
  const afterBad = reasoning.split("BAD")[1]
  if (!afterBad) return reasoning

  const drivers = afterBad
    .replace(/\$.*?\$/, "")
    .split(/[.:]/)
    .slice(1)
    .join("")
    .split(/=>/)
    .filter(Boolean)
    .map((part) => {
      const parts = part.trim().split(/\s+/)
      const scorePart = parts.slice(-2).join(" ")
      const driverName = parts.slice(0, -2).join(" ")
      return `${driverName} => ${scorePart}`
    })

  if (drivers.length === 0) return reasoning

  const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver.trim()}`).join("\n")

  return `${intro}.\nBottom 3 drivers:\n${formattedDrivers}`
}

function formatMiddleScoreReasoning(reasoning: string): string {
  const introMatch = reasoning.match(/(Score is [\d.]+ => MIDDLE.*?)[.\s]/i)
  const intro = introMatch ? introMatch[1] : "Score is MIDDLE"

    const driversMatch =
      reasoning.match(/(?:\d+\s+(?:top|highest).*?(?:bottom|lowest).*?:)([\s\S]*)/m) ||
      reasoning.match(/(?:Chosen drivers:)([\s\S]*)/m)

  if (!driversMatch) {
    return formatFallbackMiddleReasoning(reasoning, intro)
  }

  const driversText = driversMatch[1].trim()
  const drivers = driversText
    .split(/[;\n]/)
    .map((driver) => driver.trim())
    .filter(Boolean)

  const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver}`).join("\n")

  return `${intro}.\nMixed drivers:\n${formattedDrivers}`
}

function formatFallbackMiddleReasoning(reasoning: string, intro: string): string {
  const afterMiddle = reasoning.split("MIDDLE")[1]
  if (!afterMiddle) return reasoning

  const drivers = afterMiddle
    .replace(/\$.*?\$/, "")
    .replace(/\d+\s+(?:top|highest).*?(?:bottom|lowest).*?:/, "")
    .split(/[;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (drivers.length === 0) return reasoning

  const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver.trim()}`).join("\n")

  return `${intro}.\nMixed drivers:\n${formattedDrivers}`
}

import { NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Try different possible filenames for giveaway data
    const possibleUrls = [
      "https://vc-dashboard-data.s3.us-east-2.amazonaws.com/giveaway.csv",
      "https://vc-dashboard-data.s3.us-east-2.amazonaws.com/giveaway_data.csv",
      "https://vc-dashboard-data.s3.us-east-2.amazonaws.com/portfolio_giveaway.csv",
      "https://vc-dashboard-data.s3.us-east-2.amazonaws.com/giveaway_list_matches.csv",
    ]

    for (const url of possibleUrls) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const csvText = await response.text()
          return new Response(csvText, {
            headers: {
              "Content-Type": "text/csv",
            },
          })
        }
      } catch {
        continue
      }
    }

    // If no file found, return empty CSV
    console.log("No giveaway CSV found, returning empty data")
    return new Response("", {
      headers: {
        "Content-Type": "text/csv",
      },
    })
  } catch (error) {
    console.error("Error fetching giveaway CSV:", error)
    return NextResponse.json({ error: "Failed to fetch CSV" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const response = await fetch("https://vc-dashboard-data.s3.us-east-2.amazonaws.com/portfolio_nonqualified.csv")

    if (!response.ok) {
      throw new Error(`S3 fetch failed: ${response.status}`)
    }

    const csvText = await response.text()
    return new Response(csvText, {
      headers: {
        "Content-Type": "text/csv",
      },
    })
  } catch (error) {
    console.error("Error fetching non-qualified CSV:", error)
    return NextResponse.json({ error: "Failed to fetch CSV" }, { status: 500 })
  }
}

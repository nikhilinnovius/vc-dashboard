import { NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    let startTime = Date.now()
    const response = await fetch("https://vc-dashboard-data.s3.us-east-2.amazonaws.com/portfolio_qualified.csv")

    if (!response.ok) {
      throw new Error(`S3 fetch failed: ${response.status}`)
    }

    const csvText = await response.text()
    const endTime = Date.now()
    console.log("Time taken:", endTime - startTime)
    return NextResponse.json({result: csvText, timeTaken: endTime - startTime}, {
      headers: {
        "Content-Type": "text/csv",
      },
    })
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return NextResponse.json({ error: "Failed to fetch CSV" }, { status: 500 })
  }
}

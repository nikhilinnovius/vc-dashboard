import { NextResponse } from "next/server"
import { runDevChecks } from "@/lib/dev-helpers"

/**
 * Development endpoint to test Vercel services connectivity
 * Visit: http://localhost:3000/api/dev-test
 */
export async function GET() {
  try {
    console.log('🧪 Running development checks...')
    
    const allGood = await runDevChecks()
    
    return NextResponse.json({
      success: allGood,
      message: allGood 
        ? "✅ All Vercel services are working correctly!"
        : "❌ Some services need configuration. Check console for details.",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error('Dev test error:', error)
    
    return NextResponse.json({
      success: false,
      message: "❌ Error running development checks",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

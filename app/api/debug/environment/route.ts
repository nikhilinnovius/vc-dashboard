import { NextRequest, NextResponse } from "next/server"

// Same function as in middleware.ts
export const getEnvironment = () => {
  if (process.env.APP_ENV) {
    return process.env.APP_ENV
  }
  // Fallback to NODE_ENV (Vercel sets this automatically)
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV
  }
  // Final fallback to production for safety
  return 'production'
}

export async function GET(request: NextRequest) {
  const environment = getEnvironment()
  const isDevelopment = environment === 'development'

  // Check for session cookie (same logic as middleware)
  const sessionCookie = request.cookies.get("auth-session")
  const bypassAuthCookie = request.cookies.get("bypass-auth")
  
  let sessionData = null
  let sessionValid = false
  let sessionExpired = false
  
  if (sessionCookie?.value) {
    try {
      sessionData = JSON.parse(sessionCookie.value)
      sessionValid = true
      
      // Check if session is expired (same logic as middleware)
      if (sessionData.exp && Date.now() >= sessionData.exp * 1000) {
        sessionExpired = true
        sessionValid = false
      }
    } catch (error) {
      sessionData = { error: "Failed to parse session data" }
    }
  }

  return NextResponse.json({
    environment,
    isDevelopment,
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    session: {
      hasSessionCookie: !!sessionCookie?.value,
      sessionValid,
      sessionExpired,
      sessionData,
      bypassAuth: !!bypassAuthCookie?.value,
      bypassAuthValue: bypassAuthCookie?.value,
      allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
    },
    timestamp: new Date().toISOString()
  })
}

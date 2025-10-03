import { NextResponse } from "next/server"

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

export async function GET() {
  const environment = getEnvironment()
  const isDevelopment = environment === 'development'

  return NextResponse.json({
    environment,
    isDevelopment,
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}

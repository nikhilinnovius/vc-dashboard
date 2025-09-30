import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check for the custom headers we set in middleware
  const bypassAuth = request.headers.get('x-bypass-auth')
  const userEmail = request.headers.get('x-test-user')
  const userName = request.headers.get('x-test-user-name')

  console.log('🔍 API Route - Headers received:', {
    bypassAuth,
    userEmail,
    userName,
    allHeaders: Object.fromEntries(request.headers.entries())
  })

  if (bypassAuth === 'true') {
    console.log('✅ API Route - Bypass auth detected, returning authenticated')
    return NextResponse.json({
      bypassAuth: true,
      userEmail: userEmail || 'test@example.com',
      userName: userName || 'Test User'
    })
  }

  console.log('❌ API Route - No bypass auth, returning unauthenticated')
  return NextResponse.json({
    bypassAuth: false
  })
}

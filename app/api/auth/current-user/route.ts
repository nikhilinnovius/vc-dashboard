import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { user: null, status: 'unauthenticated' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { user, status: 'authenticated' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json(
      { user: null, status: 'unauthenticated', error: 'Failed to get user' },
      { status: 500 }
    )
  }
}

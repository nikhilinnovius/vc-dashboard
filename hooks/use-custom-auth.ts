"use client"

import { useState, useEffect } from 'react'

interface CustomAuthSession {
  user: {
    email: string
    name: string
  }
  status: 'authenticated' | 'unauthenticated' | 'loading'
}

export function useCustomAuth() {
  const [session, setSession] = useState<CustomAuthSession>({
    user: { email: '', name: '' },
    status: 'loading'
  })

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

    // Check for bypass auth cookie
    const checkAuth = () => {
      try {
        console.log('🔍 Checking custom auth via cookies...')
        
        // Get cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        console.log('🍪 All cookies:', cookies)
        
        const bypassAuth = cookies['bypass-auth']
        const userEmail = cookies['test-user-email']
        const userName = cookies['test-user-name']
        
        console.log('🔍 Auth cookies:', { bypassAuth, userEmail, userName })
        
        if (bypassAuth === 'true') {
          console.log('✅ Bypass auth detected via cookie!')
          setSession({
            user: {
              email: userEmail || 'test@example.com',
              name: userName || 'Test User'
            },
            status: 'authenticated'
          })
        } else {
          console.log('❌ No bypass auth cookie found')
          setSession({
            user: { email: '', name: '' },
            status: 'unauthenticated'
          })
        }
      } catch (error) {
        console.error('❌ Cookie check failed:', error)
        setSession({
          user: { email: '', name: '' },
          status: 'unauthenticated'
        })
      }
    }

    checkAuth()
  }, [])

  return session
}

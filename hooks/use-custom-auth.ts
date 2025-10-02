"use client"

import { useState, useEffect } from 'react'

interface CustomAuthSession {
  user: {
    id?: string
    email: string
    name: string
    role?: string
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

    const checkAuth = async () => {
      try {
        console.log('🔍 Checking auth via getCurrentUser API...')
        
        // First, check for bypass auth cookie as fallback
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        const bypassAuth = cookies['bypass-auth']
        
        if (bypassAuth === 'true') {  
          console.log('✅ Bypass auth detected via cookie!')
          const userEmail = cookies['test-user-email']
          const userName = cookies['test-user-name']
          
          console.log('🔍 Bypass auth detected via cookie!', {  
            userEmail,
            userName
          })
          
            setSession({
            user: {
              email: userEmail ? decodeURIComponent(userEmail) : 'test@example.com',
              name: userName ? decodeURIComponent(userName) : 'Test User'
            },
            status: 'authenticated'
          })
          return
        }

        // Use getCurrentUser via API route
        const response = await fetch('/api/auth/current-user', {
          method: 'GET',
          credentials: 'include', // Include cookies
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('🔍 Auth API response:', data)

        if (data.status === 'authenticated' && data.user) {
          console.log('✅ User authenticated via getCurrentUser!')
          setSession({
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || data.user.email,
              role: data.user.role
            },
            status: 'authenticated'
          })
        } else {
          console.log('❌ User not authenticated')
          setSession({
            user: { email: '', name: '' },
            status: 'unauthenticated'
          })
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error)
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

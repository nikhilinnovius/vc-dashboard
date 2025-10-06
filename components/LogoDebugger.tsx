"use client"

import { useState, useEffect } from "react"
import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"

interface LogoDebuggerProps {
  domain: string
  name: string
}

export function LogoDebugger({ domain, name }: LogoDebuggerProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const testLogo = async () => {
      try {
        console.log(`🔍 Testing logo for ${name} (${domain})`)
        const response = await fetch(`/api/logos/${encodeURIComponent(domain)}`)
        const data = await response.json()
        console.log(`🔍 Logo API response for ${name}:`, data)
        setDebugInfo(data)
      } catch (error) {
        console.error(`🔍 Logo API error for ${name}:`, error)
        setDebugInfo({ error: error.message })
      }
    }

    if (domain) {
      testLogo()
    }
  }, [domain, name])

  return (
    <div className="border p-4 m-2">
      <h3 className="font-bold">Logo Debug: {name}</h3>
      <p>Domain: {domain}</p>
      <div className="flex items-center gap-4">
        <CompanyLogo domain={domain} name={name} size={40} priority={10} />
        <div>
          <p>Debug Info:</p>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}


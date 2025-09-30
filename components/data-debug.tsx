"use client"

import { useState } from "react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataDebugProps {
  showByDefault?: boolean
}

export function DataDebug({ showByDefault = false }: DataDebugProps) {
  const [showDebug, setShowDebug] = useState(showByDefault)
  const { vcs, startups, locations, isLoading, error, refetch } = useData()

  return (
    <div className="mt-4">
      <Button onClick={() => setShowDebug(!showDebug)} variant="outline" className="mb-4">
        {showDebug ? "Hide" : "Show"} Data Debug
      </Button>

      {showDebug && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Data Context Debug</span>
              <Button onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh Data"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <h3 className="font-bold">Data Status</h3>
                <ul className="list-disc pl-5 mt-2">
                  <li>Loading: {isLoading ? "Yes" : "No"}</li>
                  <li>Error: {error ? "Yes" : "No"}</li>
                  <li>VCs: {vcs.length}</li>
                  <li>Startups: {startups.length}</li>
                  <li>States: {locations.states.length}</li>
                  <li>Cities: {locations.cities.length}</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <h3 className="font-bold">Error</h3>
                  <p className="whitespace-pre-wrap">{error}</p>
                </div>
              )}

              {vcs.length > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <h3 className="font-bold">Sample VCs (first 5)</h3>
                  <ul className="list-disc pl-5 mt-2">
                    {vcs.slice(0, 5).map((vc, index) => (
                      <li key={index}>
                        {vc.name} ({vc.city}, {vc.state})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {locations.cities.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                  <h3 className="font-bold">Sample Cities (first 10)</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {locations.cities.slice(0, 10).map((city, index) => (
                      <span key={index} className="bg-yellow-100 px-2 py-1 rounded text-sm">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

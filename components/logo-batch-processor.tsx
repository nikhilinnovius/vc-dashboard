"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface LogoBatchProcessorProps {
  showByDefault?: boolean
}

export function LogoBatchProcessor({ showByDefault = false }: LogoBatchProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [showProcessor, setShowProcessor] = useState(showByDefault)
  const { toast } = useToast()

  const processBatch = async (forceRefresh = false) => {
    setIsProcessing(true)
    setResults(null)

    try {
      const response = await fetch("/api/logos/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ forceRefresh }),
      })

      if (!response.ok) {
        throw new Error(`Failed to process logos: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)

      toast({
        title: "Logo processing complete",
        description: `Processed ${data.successful} logos successfully, ${data.failed} failed.`,
      })
    } catch (error) {
      console.error("Error processing logos:", error)
      toast({
        title: "Error processing logos",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mt-4">
      <Button onClick={() => setShowProcessor(!showProcessor)} variant="outline" className="mb-4">
        {showProcessor ? "Hide" : "Show"} Logo Processor
      </Button>

      {showProcessor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Logo Batch Processor</span>
              <div className="flex gap-2">
                <Button onClick={() => processBatch(false)} disabled={isProcessing} variant="outline">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Missing Logos"
                  )}
                </Button>
                <Button onClick={() => processBatch(true)} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh All Logos
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Processing logos, please wait...</p>
              </div>
            )}

            {results && !isProcessing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-500 font-medium">Total</p>
                    <p className="text-2xl font-bold">{results.total}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-500 font-medium">Processed</p>
                    <p className="text-2xl font-bold">{results.processed}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-500 font-medium">Successful</p>
                    <p className="text-2xl font-bold">{results.successful}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-500 font-medium">Failed</p>
                    <p className="text-2xl font-bold">{results.failed}</p>
                  </div>
                </div>

                {results.errors && results.errors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Errors:</h3>
                    <div className="bg-red-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <ul className="list-disc pl-5">
                        {results.errors.map((error: string, index: number) => (
                          <li key={index} className="text-sm text-red-600">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

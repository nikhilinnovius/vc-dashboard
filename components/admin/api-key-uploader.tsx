"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ApiKeyUploaderProps {
  className?: string
}

export function ApiKeyUploader({ className }: ApiKeyUploaderProps) {
  const [jsonData, setJsonData] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const { toast } = useToast()

  const handleUpload = async () => {
    try {
      setIsUploading(true)
      setUploadStatus("idle")
      setStatusMessage("")

      // Validate JSON
      let parsedData
      try {
        parsedData = JSON.parse(jsonData)
      } catch (error) {
        throw new Error("Invalid JSON format. Please check your input.")
      }

      // Validate structure
      if (!Array.isArray(parsedData.users)) {
        throw new Error("JSON must contain a 'users' array")
      }

      // Validate each user object
      for (const user of parsedData.users) {
        if (!user.email || !user.name || !user.affinityApiKey) {
          throw new Error("Each user must have email, name, and affinityApiKey fields")
        }
      }

      // Send to API
      const response = await fetch("/api/admin/user-api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload API keys")
      }

      const result = await response.json()

      setUploadStatus("success")
      setStatusMessage(result.message)
      toast({
        title: "Success",
        description: result.message,
      })
    } catch (error) {
      console.error("Error uploading API keys:", error)
      setUploadStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload API keys",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload User API Keys</CardTitle>
        <CardDescription>
          Upload a JSON file containing user email addresses and their Affinity API keys.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Paste JSON in the following format:</p>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
              {`{
  "users": [
    {
      "email": "user1@example.com",
      "name": "User One",
      "affinityApiKey": "api_key_1"
    },
    {
      "email": "user2@example.com",
      "name": "User Two",
      "affinityApiKey": "api_key_2"
    }
  ]
}`}
            </pre>
          </div>
          <Textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Paste your JSON here..."
            className="min-h-[200px] font-mono text-sm"
            disabled={isUploading}
          />

          {uploadStatus !== "idle" && (
            <div
              className={`p-4 rounded-md ${uploadStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              <div className="flex items-start">
                {uploadStatus === "success" ? (
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                <p>{statusMessage}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={isUploading || !jsonData.trim()} className="w-full sm:w-auto">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload API Keys
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

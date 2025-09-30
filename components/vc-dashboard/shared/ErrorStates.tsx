import React from 'react'
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  error: string
  onRetry: () => void
  title?: string
  description?: string
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  title = "Error loading data",
  description 
}) => (
  <div className="flex flex-col items-center justify-center py-10">
    <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
    <p className="text-white text-xl mb-4">{title}</p>
    <p className="text-white/70 mb-6 max-w-md text-center">
      {description || error || "An unexpected error occurred. Please try again."}
    </p>
    <Button 
      onClick={onRetry} 
      className="bg-white/20 text-white hover:bg-white/30 flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Try Again
    </Button>
  </div>
)

interface NetworkErrorProps {
  onRetry: () => void
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => (
  <ErrorDisplay
    error=""
    onRetry={onRetry}
    title="Network Error"
    description="Unable to connect to the server. Please check your internet connection and try again."
  />
)

interface DataErrorProps {
  error: string
  onRetry: () => void
}

export const DataError: React.FC<DataErrorProps> = ({ error, onRetry }) => (
  <ErrorDisplay
    error={error}
    onRetry={onRetry}
    title="Data Error"
    description="There was an error loading the data. This might be a temporary issue."
  />
)

interface AuthErrorProps {
  onRetry: () => void
}

export const AuthError: React.FC<AuthErrorProps> = ({ onRetry }) => (
  <ErrorDisplay
    error=""
    onRetry={onRetry}
    title="Authentication Error"
    description="There was an error with your authentication. Please try signing in again."
  />
)

"use client"

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Filter, ChevronDown, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FeatureRequest {
  id: string
  featureName: string
  featureDescription: string
  priority: string
  bugReport: string
  userName: string
  userEmail: string
  timestamp: string
  status: string
  application: string
}

export function FeatureRequestsViewer() {
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<FeatureRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const [applicationFilter, setApplicationFilter] = useState<string>("all")

  const fetchRequests = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/feature-request", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch feature requests: ${response.status}`)
      }

      const data = await response.json()
      const sortedRequests = (data.requests || []).sort((a: FeatureRequest, b: FeatureRequest) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      setRequests(sortedRequests)
      setFilteredRequests(sortedRequests)
    } catch (err) {
      console.error("Error fetching feature requests:", err)
      setError(err instanceof Error ? err.message : String(err))
      toast({
        title: "Error",
        description: "Failed to load feature requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    let result = [...requests]

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((req) => req.priority.toLowerCase() === priorityFilter.toLowerCase())
    }

    // Apply application filter
    if (applicationFilter !== "all") {
      result = result.filter((req) => req.application === applicationFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (req) =>
          req.featureName.toLowerCase().includes(query) ||
          req.featureDescription.toLowerCase().includes(query) ||
          req.userName.toLowerCase().includes(query) ||
          req.userEmail.toLowerCase().includes(query) ||
          (req.bugReport && req.bugReport.toLowerCase().includes(query)),
      )
    }

    setFilteredRequests(result)
  }, [requests, priorityFilter, applicationFilter, searchQuery])

  const deleteRequest = async (id: string) => {
    try {
      setIsDeletingId(id)

      const response = await fetch(`/api/feature-request/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete feature request: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Remove the deleted request from state
        setRequests((prev) => prev.filter((req) => req.id !== id))

        toast({
          title: "Success",
          description: "Feature request deleted successfully",
        })

        // Refresh the list to ensure we have the latest data
        await fetchRequests()
      } else {
        throw new Error("Failed to delete feature request")
      }
    } catch (err) {
      console.error("Error deleting feature request:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete feature request",
        variant: "destructive",
      })
    } finally {
      setIsDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search feature requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPriorityFilter("all")}>All Priorities</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("high")}>High Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>Medium Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("low")}>Low Priority</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setApplicationFilter("all")}>All Applications</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setApplicationFilter("company-scoring")}>
                Company Scoring
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setApplicationFilter("vc-dashboard")}>VC Dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setApplicationFilter("ai-memo")}>AI Memo Generator</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          <Select value={applicationFilter} onValueChange={setApplicationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="company-scoring">Company Scoring</SelectItem>
              <SelectItem value="vc-dashboard">VC Dashboard</SelectItem>
              <SelectItem value="ai-memo">AI Memo Generator</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchRequests} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {isLoading && filteredRequests.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading feature requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border">
          <p className="text-lg">No feature requests found</p>
          <p className="text-sm mt-2">
            {searchQuery || priorityFilter !== "all"
              ? "Try adjusting your filters"
              : "Feature requests will appear here when users submit them"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)] pr-4">
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <FeatureRequestCard
                key={request.id}
                request={request}
                onDelete={deleteRequest}
                isDeleting={isDeletingId === request.id}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="text-sm text-muted-foreground mt-2">
        {filteredRequests.length > 0 && (
          <p>
            Showing {filteredRequests.length} of {requests.length} feature requests
          </p>
        )}
      </div>
    </div>
  )
}

function FeatureRequestCard({
  request,
  onDelete,
  isDeleting,
}: {
  request: FeatureRequest
  onDelete: (id: string) => Promise<void>
  isDeleting: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return dateString
    }
  }

  const handleDelete = async () => {
    await onDelete(request.id)
    setIsAlertOpen(false)
  }

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${isExpanded ? "shadow-md" : "shadow-sm"}`}>
      <div
        className={`border-l-4 ${
          request.priority.toLowerCase() === "high"
            ? "border-red-500 dark:border-red-700"
            : request.priority.toLowerCase() === "medium"
              ? "border-yellow-500 dark:border-yellow-700"
              : "border-green-500 dark:border-green-700"
        }`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">{request.featureName}</h3>
              <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2">
                <span className="font-medium">{request.userName}</span>
                <span className="text-xs opacity-70">({request.userEmail})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center self-end sm:self-start">
              <Badge variant="outline" className={getPriorityColor(request.priority)}>
                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
              </Badge>
              {request.application && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                >
                  {request.application === "company-scoring"
                    ? "Company Scoring"
                    : request.application === "vc-dashboard"
                      ? "VC Dashboard"
                      : request.application === "ai-memo"
                        ? "AI Memo Generator"
                        : request.application}
                </Badge>
              )}
              <div className="text-xs text-muted-foreground">{formatDate(request.timestamp)}</div>
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Feature Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this feature request? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className={`space-y-4 ${isExpanded ? "" : "line-clamp-2"}`}>
            {request.featureDescription && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Feature Description:</h4>
                <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {request.featureDescription}
                </div>
              </div>
            )}

            {request.bugReport && (
              <div className={isExpanded ? "" : "hidden"}>
                <h4 className="text-sm font-semibold mb-1">Bug Report:</h4>
                <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap">{request.bugReport}</div>
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="mt-4">
            {isExpanded ? "Show Less" : "Show More"}
            <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeyUploader } from "@/components/admin/api-key-uploader"
import { DataDebug } from "@/components/data-debug"
// import { CSVDebug } from "@/components/csv-debug"
import { LogoBatchProcessor } from "@/components/logo-batch-processor"
import { FeatureRequestsViewer } from "@/components/admin/feature-requests-viewer"
import { LayoutDashboard, MessageSquarePlus, Database, Image, FileSpreadsheet } from "lucide-react"

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("feature-requests")

  return (
    <Tabs defaultValue="feature-requests" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full max-w-4xl">
        <TabsTrigger value="feature-requests" className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Feature Requests</span>
        </TabsTrigger>
        <TabsTrigger value="api-keys" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">API Keys</span>
        </TabsTrigger>
        <TabsTrigger value="data-debug" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">Data Debug</span>
        </TabsTrigger>
        <TabsTrigger value="csv-debug" className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          <span className="hidden sm:inline">CSV Debug</span>
        </TabsTrigger>
        <TabsTrigger value="logo-processor" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">Logo Processor</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="feature-requests" className="space-y-4">
        <h2 className="text-2xl font-semibold">Feature Requests</h2>
        <p className="text-muted-foreground">View and manage user feature requests and bug reports.</p>
        <FeatureRequestsViewer />
      </TabsContent>

      <TabsContent value="api-keys" className="space-y-4">
        <h2 className="text-2xl font-semibold">API Key Management</h2>
        <p className="text-muted-foreground">Upload and manage API keys for external services.</p>
        <ApiKeyUploader />
      </TabsContent>

      <TabsContent value="data-debug" className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Debugging</h2>
        <p className="text-muted-foreground">View and debug application data.</p>
        <DataDebug />
      </TabsContent>

      <TabsContent value="csv-debug" className="space-y-4">
        <h2 className="text-2xl font-semibold">CSV Debugging</h2>
        <p className="text-muted-foreground">Debug CSV data imports and exports.</p>
        {/* <CSVDebug /> */}
      </TabsContent>

      <TabsContent value="logo-processor" className="space-y-4">
        <h2 className="text-2xl font-semibold">Logo Batch Processor</h2>
        <p className="text-muted-foreground">Process and manage company logos in batch.</p>
        <LogoBatchProcessor />
      </TabsContent>
    </Tabs>
  )
}

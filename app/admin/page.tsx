import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminTabs } from "@/components/admin/admin-tabs"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated

  // TODO: remove in prod: Temporary hardcode
  const isAuthenticated = true

  if (!isAuthenticated && (!session || !session.user)) {
    redirect("/login")
  }

  // In a real app, you would check if the user has admin privileges
  // For now, we'll allow any authenticated user to access this page

  return (
    <div className="container mx-auto py-10 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <AdminTabs />
    </div>
  )
}

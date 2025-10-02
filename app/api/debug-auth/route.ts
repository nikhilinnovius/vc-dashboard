import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { error: "No token provided", usage: "Add ?token=<jwt_token> to test token verification" },
      { status: 400 }
    )
  }

  try {
    const user = await verifyToken(token)
    
    if (user) {
      return NextResponse.json({
        success: true,
        message: "Token verified successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          exp: user.exp,
          expiresAt: user.exp ? new Date(user.exp * 1000).toISOString() : null,
        },
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Token verification failed" },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Token verification error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}


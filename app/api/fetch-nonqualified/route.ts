// API to fetch non-qualified startups from supabase's portfolio_nonqualified table

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(req: Request) {
  const startTime = Date.now()
  
  try {
    console.log('Fetch nonqualified API called with URL:', req.url)
    
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const pageParam = searchParams.get("page") ?? "1"
    const page = Number(pageParam)
    
    // Validate page parameter
    if (isNaN(page) || page < 1) {
      console.error('Invalid page parameter:', pageParam)
      return NextResponse.json({ error: `Invalid page parameter: ${pageParam}. Page must be a positive number.` }, { status: 400 })
    }
    
    const cardsPerPage = 20 // Companies displayed per page in UI
    const limit = 200  // Companies loaded per API call (10 pages worth)
    const offset = (page - 1) * limit

    console.log('Request params:', { page, cardsPerPage, limit, offset })

    // Use a cached/estimated count to avoid expensive count queries on 200k rows
    // This is much faster than exact count on large tables
    let startupCount = 80000 // Approximate count - update this periodically
    let totalPages = Math.ceil(startupCount / cardsPerPage)
    
    try {
      // Try to get a more accurate count with timeout, but don't fail if it times out
      console.log('Attempting fast count...')
      const countPromise = supabase
        .from("companies_nonqualified")
        .select("id", { count: "exact", head: true })
      
      // Race the count query against a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Count query timeout')), 3000)
      )
      
      const { count } = await Promise.race([countPromise, timeoutPromise]) as any
      if (count !== null) {
        startupCount = count
        totalPages = Math.ceil(startupCount / cardsPerPage)
        console.log('Got accurate count:', { startupCount, totalPages })
      }
    } catch (countError) {
      console.log('Using estimated count due to:', countError instanceof Error ? countError.message : 'unknown error')
      // Continue with estimated count
    }
    
    // Fetch paginated data with optimized query
    console.log('Fetching paginated data...')
    
    // Create a timeout promise for the data query
    const dataPromise = supabase
      .from("companies_nonqualified")
      .select(`
        id,
        name,
        website,
        linkedin,
        company_score,
        last_funding_type,
        city,
        country,
        description,
        total_raised
      `)
      .order("company_score", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)
    
    const dataTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Data query timeout')), 10000)
    )
    
    const { data, error } = await Promise.race([dataPromise, dataTimeoutPromise]) as any
    
    if (error) {
      console.error('Data fetch error:', error)
      return NextResponse.json({ 
        error: `Data fetch error: ${error.message}`,
        suggestion: "The database query timed out. Try refreshing the page or reducing the page size."
      }, { status: 500 })
    }

    const timeTaken = Date.now() - startTime
    console.log('Data fetched successfully:', { dataLength: data?.length, timeTaken })

    return NextResponse.json({ 
      startups: data, 
      totalStartupCount: startupCount, 
      pages: totalPages, 
      currentPage: page,
      cardsCount: data?.length || 0, 
      cardsPerPage: cardsPerPage, 
      apiLimit: limit, // API batch size,
      timeTaken: timeTaken,
      isEstimatedCount: startupCount === 200000, // Indicate if count is estimated
    }, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600", // Longer cache for large dataset
      },
    })
  } catch (error) {
    const timeTaken = Date.now() - startTime
    console.error('Unexpected error in fetch-nonqualified API:', error, { timeTaken })
    
    // Provide more helpful error messages
    let errorMessage = 'Unknown error'
    let suggestion = 'Please try again later.'
    
    if (error instanceof Error) {
      errorMessage = error.message
      if (error.message.includes('timeout')) {
        suggestion = 'The database query timed out due to the large dataset. Try refreshing the page.'
      } else if (error.message.includes('connection')) {
        suggestion = 'Database connection failed. Please check your internet connection and try again.'
      }
    }
    
    return NextResponse.json({ 
      error: `Database error: ${errorMessage}`,
      suggestion,
      timeTaken
    }, { status: 500 })
  }
}
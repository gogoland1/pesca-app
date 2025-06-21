import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

interface UserSession {
  id: string
  country: string
  country_code: string
  region: string
  city: string
  ip: string
  first_visit: string
  last_activity: string
  page_views: number
  is_online: boolean
}

interface CountryStats {
  total_visits: number
  unique_visitors: number
  last_visit: string
  sessions: UserSession[]
}

interface AdvancedAnalytics {
  total_visits: number
  unique_visitors: number
  online_users: number
  countries: Record<string, CountryStats>
  recent_visitors: UserSession[]
  daily_stats: Record<string, {
    visits: number
    countries: string[]
    peak_online: number
  }>
  first_launch: string
  last_activity: string
}

const ANALYTICS_FILE = join(process.cwd(), 'data', 'analytics.json')
const ONLINE_TIMEOUT = 5 * 60 * 1000 // 5 minutes

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  try {
    require('fs').mkdirSync(dataDir, { recursive: true })
  } catch (error) {
    console.error('Error creating data directory:', error)
  }
}

function getAnalyticsData(): AdvancedAnalytics {
  try {
    if (existsSync(ANALYTICS_FILE)) {
      const data = readFileSync(ANALYTICS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading analytics data:', error)
  }
  
  // Default data
  return {
    total_visits: 0,
    unique_visitors: 0,
    online_users: 0,
    countries: {},
    recent_visitors: [],
    daily_stats: {},
    first_launch: new Date().toISOString(),
    last_activity: new Date().toISOString()
  }
}

function saveAnalyticsData(data: AdvancedAnalytics): void {
  try {
    // Clean old sessions before saving
    cleanOldSessions(data)
    writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving analytics data:', error)
  }
}

function cleanOldSessions(data: AdvancedAnalytics): void {
  const now = new Date()
  const cutoff = new Date(now.getTime() - ONLINE_TIMEOUT)
  
  // Clean online users
  Object.keys(data.countries).forEach(countryCode => {
    const country = data.countries[countryCode]
    country.sessions = country.sessions.filter(session => {
      const lastActivity = new Date(session.last_activity)
      const isStillOnline = lastActivity > cutoff
      
      if (!isStillOnline && session.is_online) {
        session.is_online = false
      }
      
      // Keep sessions from last 24 hours for recent visitors
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      return lastActivity > twentyFourHoursAgo || session.is_online
    })
  })
  
  // Update online count
  let onlineCount = 0
  Object.values(data.countries).forEach(country => {
    onlineCount += country.sessions.filter(s => s.is_online).length
  })
  data.online_users = onlineCount
  
  // Update recent visitors (last 24 hours)
  const allSessions: UserSession[] = []
  Object.values(data.countries).forEach(country => {
    allSessions.push(...country.sessions)
  })
  
  data.recent_visitors = allSessions
    .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
    .slice(0, 50) // Keep last 50 visitors
}

// GET: Retrieve analytics data
export async function GET() {
  try {
    const data = getAnalyticsData()
    cleanOldSessions(data) // Clean before returning
    
    // Prepare summary for client
    const countrySummary = Object.entries(data.countries).map(([code, stats]) => ({
      country_code: code,
      country_name: stats.sessions[0]?.country || 'Unknown',
      total_visits: stats.total_visits,
      unique_visitors: stats.unique_visitors,
      online_users: stats.sessions.filter(s => s.is_online).length,
      last_visit: stats.last_visit
    })).sort((a, b) => b.total_visits - a.total_visits)
    
    const response = {
      success: true,
      data: {
        total_visits: data.total_visits,
        unique_visitors: data.unique_visitors,
        online_users: data.online_users,
        countries: countrySummary,
        recent_visitors: data.recent_visitors.slice(0, 10).map(visitor => ({
          country: visitor.country,
          country_code: visitor.country_code,
          city: visitor.city,
          last_activity: visitor.last_activity,
          page_views: visitor.page_views,
          is_online: visitor.is_online
        })),
        uptime_days: Math.floor((Date.now() - new Date(data.first_launch).getTime()) / (1000 * 60 * 60 * 24))
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get analytics data'
    }, { status: 500 })
  }
}

// POST: Record visit/heartbeat
export async function POST(request: Request) {
  try {
    const { 
      visitor_id, 
      location_data, 
      page_view = false,
      heartbeat = false 
    } = await request.json()
    
    if (!visitor_id || !location_data) {
      return NextResponse.json({
        success: false,
        error: 'Missing required data'
      }, { status: 400 })
    }
    
    const data = getAnalyticsData()
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    const countryCode = location_data.country_code || 'XX'
    
    // Initialize country if doesn't exist
    if (!data.countries[countryCode]) {
      data.countries[countryCode] = {
        total_visits: 0,
        unique_visitors: 0,
        last_visit: now,
        sessions: []
      }
    }
    
    const country = data.countries[countryCode]
    
    // Find existing session
    let session = country.sessions.find(s => s.id === visitor_id)
    
    if (!session) {
      // New visitor
      session = {
        id: visitor_id,
        country: location_data.country,
        country_code: countryCode,
        region: location_data.region,
        city: location_data.city,
        ip: location_data.ip,
        first_visit: now,
        last_activity: now,
        page_views: 0,
        is_online: true
      }
      
      country.sessions.push(session)
      country.unique_visitors += 1
      data.unique_visitors += 1
      
      console.log(`✅ New visitor from ${location_data.country}: ${location_data.city}`)
    } else {
      // Existing visitor
      session.last_activity = now
      session.is_online = true
    }
    
    // Handle page view
    if (page_view) {
      session.page_views += 1
      country.total_visits += 1
      data.total_visits += 1
      country.last_visit = now
    }
    
    // Update daily stats
    if (!data.daily_stats[today]) {
      data.daily_stats[today] = {
        visits: 0,
        countries: [],
        peak_online: 0
      }
    }
    
    if (page_view) {
      data.daily_stats[today].visits += 1
      if (!data.daily_stats[today].countries.includes(countryCode)) {
        data.daily_stats[today].countries.push(countryCode)
      }
    }
    
    // Update general data
    data.last_activity = now
    
    // Clean and count online users
    cleanOldSessions(data)
    
    // Update peak online for today
    if (data.online_users > data.daily_stats[today].peak_online) {
      data.daily_stats[today].peak_online = data.online_users
    }
    
    // Clean old daily stats (keep only last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    Object.keys(data.daily_stats).forEach(date => {
      if (new Date(date) < thirtyDaysAgo) {
        delete data.daily_stats[date]
      }
    })
    
    saveAnalyticsData(data)
    
    return NextResponse.json({
      success: true,
      data: {
        total_visits: data.total_visits,
        online_users: data.online_users,
        your_country: location_data.country,
        session_page_views: session.page_views
      }
    })
    
  } catch (error) {
    console.error('Error recording analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to record visit'
    }, { status: 500 })
  }
}
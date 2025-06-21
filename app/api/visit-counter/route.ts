import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

interface VisitData {
  totalVisits: number
  uniqueVisitors: number
  lastVisit: string
  firstVisit: string
  dailyVisits: Record<string, number>
}

const COUNTER_FILE = join(process.cwd(), 'data', 'visit-counter.json')

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  try {
    require('fs').mkdirSync(dataDir, { recursive: true })
  } catch (error) {
    console.error('Error creating data directory:', error)
  }
}

function getVisitData(): VisitData {
  try {
    if (existsSync(COUNTER_FILE)) {
      const data = readFileSync(COUNTER_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading visit data:', error)
  }
  
  // Default data
  return {
    totalVisits: 0,
    uniqueVisitors: 0,
    lastVisit: new Date().toISOString(),
    firstVisit: new Date().toISOString(),
    dailyVisits: {}
  }
}

function saveVisitData(data: VisitData): void {
  try {
    writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving visit data:', error)
  }
}

export async function GET() {
  try {
    const data = getVisitData()
    
    return NextResponse.json({
      success: true,
      data: {
        totalVisits: data.totalVisits,
        uniqueVisitors: data.uniqueVisitors,
        lastVisit: data.lastVisit,
        firstVisit: data.firstVisit,
        todayVisits: data.dailyVisits[new Date().toISOString().split('T')[0]] || 0
      }
    })
  } catch (error) {
    console.error('Error getting visit data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get visit data'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { visitorId } = await request.json()
    const data = getVisitData()
    const today = new Date().toISOString().split('T')[0]
    
    // Increment total visits
    data.totalVisits += 1
    data.lastVisit = new Date().toISOString()
    
    // Track daily visits
    if (!data.dailyVisits[today]) {
      data.dailyVisits[today] = 0
    }
    data.dailyVisits[today] += 1
    
    // Track unique visitors (simple implementation)
    if (visitorId && !data.uniqueVisitors) {
      // For now, just increment unique visitors
      // In a real app, you'd store visitor IDs
      data.uniqueVisitors += 1
    }
    
    // Keep only last 30 days of daily data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    Object.keys(data.dailyVisits).forEach(date => {
      if (new Date(date) < thirtyDaysAgo) {
        delete data.dailyVisits[date]
      }
    })
    
    saveVisitData(data)
    
    return NextResponse.json({
      success: true,
      data: {
        totalVisits: data.totalVisits,
        uniqueVisitors: data.uniqueVisitors,
        lastVisit: data.lastVisit,
        firstVisit: data.firstVisit,
        todayVisits: data.dailyVisits[today]
      }
    })
  } catch (error) {
    console.error('Error updating visit data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update visit data'
    }, { status: 500 })
  }
}
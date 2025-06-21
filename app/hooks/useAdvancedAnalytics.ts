import { useState, useEffect, useRef } from 'react'
import { getUserLocation } from '../lib/geolocation-service'

interface CountryStats {
  country_code: string
  country_name: string
  total_visits: number
  unique_visitors: number
  online_users: number
  last_visit: string
}

interface RecentVisitor {
  country: string
  country_code: string
  city: string
  last_activity: string
  page_views: number
  is_online: boolean
}

interface AdvancedAnalyticsData {
  total_visits: number
  unique_visitors: number
  online_users: number
  countries: CountryStats[]
  recent_visitors: RecentVisitor[]
  uptime_days: number
}

interface UseAdvancedAnalyticsReturn {
  analyticsData: AdvancedAnalyticsData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  isInitialized: boolean
}

export function useAdvancedAnalytics(): UseAdvancedAnalyticsReturn {
  const [analyticsData, setAnalyticsData] = useState<AdvancedAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null)
  const visitorId = useRef<string>('')

  // Generate or get visitor ID
  const getVisitorId = (): string => {
    if (typeof window === 'undefined') return ''
    
    let id = localStorage.getItem('pesca_analytics_visitor_id')
    if (!id) {
      id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
      localStorage.setItem('pesca_analytics_visitor_id', id)
    }
    return id
  }

  // Check if this is a new page view
  const isNewPageView = (): boolean => {
    if (typeof window === 'undefined') return false
    
    const lastPageView = sessionStorage.getItem('pesca_last_page_view')
    const now = Date.now()
    
    if (!lastPageView || now - parseInt(lastPageView) > 30000) { // 30 seconds
      sessionStorage.setItem('pesca_last_page_view', now.toString())
      return true
    }
    return false
  }

  // Fetch analytics data
  const fetchAnalytics = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch analytics`)
      }

      const result = await response.json()
      if (result.success) {
        setAnalyticsData(result.data)
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Record visit or heartbeat
  const recordActivity = async (pageView: boolean = false, heartbeat: boolean = false): Promise<void> => {
    try {
      const locationResult = await getUserLocation()
      
      if (!locationResult.success || !locationResult.data) {
        console.warn('Could not get location for analytics')
        return
      }

      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: visitorId.current,
          location_data: locationResult.data,
          page_view: pageView,
          heartbeat: heartbeat
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to record activity`)
      }

      const result = await response.json()
      if (result.success) {
        console.log(`✅ Activity recorded: ${pageView ? 'Page view' : 'Heartbeat'} from ${locationResult.data.country}`)
        
        // Refresh analytics data after recording
        if (pageView) {
          await fetchAnalytics()
        }
      } else {
        console.warn('Failed to record activity:', result.error)
      }
    } catch (err) {
      console.error('Error recording activity:', err)
    }
  }

  // Start heartbeat for online status
  const startHeartbeat = (): void => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
    }

    heartbeatInterval.current = setInterval(() => {
      recordActivity(false, true) // heartbeat only
    }, 2 * 60 * 1000) // Every 2 minutes
  }

  // Stop heartbeat
  const stopHeartbeat = (): void => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
      heartbeatInterval.current = null
    }
  }

  // Initialize analytics
  const initializeAnalytics = async (): Promise<void> => {
    try {
      visitorId.current = getVisitorId()
      
      // First, get current analytics data
      await fetchAnalytics()
      
      // Record page view if it's a new session/page view
      const isPageView = isNewPageView()
      if (isPageView) {
        await recordActivity(true, false) // page view
      } else {
        await recordActivity(false, true) // just heartbeat to mark as online
      }
      
      // Start heartbeat for online status
      startHeartbeat()
      
      setIsInitialized(true)
      console.log('✅ Advanced analytics initialized')
      
    } catch (err) {
      console.error('Error initializing analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize analytics')
      setIsInitialized(true) // Still mark as initialized to prevent retry loops
    }
  }

  // Handle visibility change (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat()
      } else {
        startHeartbeat()
        recordActivity(false, true) // heartbeat when returning
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAnalytics()
    }

    // Cleanup on unmount
    return () => {
      stopHeartbeat()
    }
  }, [isInitialized])

  // Auto-refresh analytics every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (isInitialized && !loading) {
        fetchAnalytics()
      }
    }, 30 * 1000) // 30 seconds

    return () => clearInterval(refreshInterval)
  }, [isInitialized, loading])

  const refresh = async (): Promise<void> => {
    await fetchAnalytics()
  }

  return {
    analyticsData,
    loading,
    error,
    refresh,
    isInitialized
  }
}

// Utility functions for formatting
export const formatUptime = (days: number): string => {
  if (days === 0) return 'Hoy'
  if (days === 1) return '1 día'
  if (days < 30) return `${days} días`
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  } else {
    const years = Math.floor(days / 365)
    return `${years} ${years === 1 ? 'año' : 'años'}`
  }
}

export const getTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 30) return `${days}d`
  return past.toLocaleDateString('es-CL')
}
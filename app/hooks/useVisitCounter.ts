import { useState, useEffect } from 'react'

interface VisitCounterData {
  totalVisits: number
  uniqueVisitors: number
  lastVisit: string
  firstVisit: string
  todayVisits: number
}

interface UseVisitCounterReturn {
  visitData: VisitCounterData | null
  loading: boolean
  error: string | null
  incrementVisit: () => Promise<void>
}

export function useVisitCounter(): UseVisitCounterReturn {
  const [visitData, setVisitData] = useState<VisitCounterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate or get visitor ID
  const getVisitorId = (): string => {
    if (typeof window === 'undefined') return ''
    
    let visitorId = localStorage.getItem('pesca_app_visitor_id')
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pesca_app_visitor_id', visitorId)
    }
    return visitorId
  }

  // Check if this is a new session
  const isNewSession = (): boolean => {
    if (typeof window === 'undefined') return true
    
    const lastSession = sessionStorage.getItem('pesca_app_session')
    if (!lastSession) {
      sessionStorage.setItem('pesca_app_session', Date.now().toString())
      return true
    }
    return false
  }

  // Fetch current visit data
  const fetchVisitData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/visit-counter')
      if (!response.ok) {
        throw new Error('Failed to fetch visit data')
      }

      const result = await response.json()
      if (result.success) {
        setVisitData(result.data)
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Error fetching visit data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Increment visit count
  const incrementVisit = async (): Promise<void> => {
    try {
      const visitorId = getVisitorId()
      
      const response = await fetch('/api/visit-counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorId }),
      })

      if (!response.ok) {
        throw new Error('Failed to increment visit')
      }

      const result = await response.json()
      if (result.success) {
        setVisitData(result.data)
        console.log('✅ Visit count updated:', result.data.totalVisits)
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Error incrementing visit:', err)
      setError(err instanceof Error ? err.message : 'Failed to update visit count')
    }
  }

  // Initialize on mount
  useEffect(() => {
    const initializeCounter = async () => {
      // First, get current data
      await fetchVisitData()
      
      // Then, if it's a new session, increment the counter
      if (isNewSession()) {
        await incrementVisit()
      }
    }

    initializeCounter()
  }, [])

  return {
    visitData,
    loading,
    error,
    incrementVisit
  }
}

// Utility functions for formatting
export const formatVisitCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  } else {
    return count.toString()
  }
}

export const getTimeSinceFirstVisit = (firstVisit: string): string => {
  const now = new Date()
  const first = new Date(firstVisit)
  const diffTime = Math.abs(now.getTime() - first.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'Desde ayer'
  } else if (diffDays < 30) {
    return `Desde hace ${diffDays} días`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `Desde hace ${months} ${months === 1 ? 'mes' : 'meses'}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `Desde hace ${years} ${years === 1 ? 'año' : 'años'}`
  }
}
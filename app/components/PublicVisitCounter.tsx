'use client'

import { useState, useEffect } from 'react'
import { Eye, TrendingUp, Users } from 'lucide-react'

interface PublicCounterData {
  total_visits: number
  online_users: number
  uptime_days: number
}

interface PublicVisitCounterProps {
  variant?: 'minimal' | 'compact' | 'simple'
  className?: string
}

export default function PublicVisitCounter({ 
  variant = 'simple', 
  className = '' 
}: PublicVisitCounterProps) {
  const [data, setData] = useState<PublicCounterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPublicData = async () => {
    try {
      setLoading(true)
      setError(null)

      // We'll use the analytics endpoint but only extract public data
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch visit data')
      }

      const result = await response.json()
      if (result.success) {
        setData({
          total_visits: result.data.total_visits,
          online_users: result.data.online_users,
          uptime_days: result.data.uptime_days
        })
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Error fetching public counter:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicData()
    
    // Auto-refresh every 60 seconds for public counter
    const interval = setInterval(fetchPublicData, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <Eye className="h-4 w-4 text-gray-400 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={`inline-flex items-center space-x-2 text-gray-400 ${className}`}>
        <Eye className="h-4 w-4" />
        <span className="text-sm">Error</span>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm ${className}`}>
        <Eye className="h-4 w-4" />
        <span>{data.total_visits.toLocaleString()} visitas</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span className="font-semibold text-gray-900">
              {data.total_visits.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            {data.online_users > 0 && (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{data.online_users} online</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Simple variant (default)
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Contador de Visitas</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Total Visits */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data.total_visits.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">visitas totales</div>
          </div>

          {/* Online indicator */}
          {data.online_users > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600">
                {data.online_users} usuario{data.online_users > 1 ? 's' : ''} online
              </span>
            </div>
          )}

          {/* Uptime */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            En línea desde hace {formatUptime(data.uptime_days)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility function for uptime formatting
function formatUptime(days: number): string {
  if (days === 0) return 'hoy'
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

// Export variants for easy use
export const PublicCounterMinimal = (props: Omit<PublicVisitCounterProps, 'variant'>) => (
  <PublicVisitCounter {...props} variant="minimal" />
)

export const PublicCounterCompact = (props: Omit<PublicVisitCounterProps, 'variant'>) => (
  <PublicVisitCounter {...props} variant="compact" />
)

export const PublicCounterSimple = (props: Omit<PublicVisitCounterProps, 'variant'>) => (
  <PublicVisitCounter {...props} variant="simple" />
)
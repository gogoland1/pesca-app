'use client'

import { useAdvancedAnalytics, formatUptime, getTimeAgo } from '../hooks/useAdvancedAnalytics'
import { getCountryFlag, getCountryName } from '../lib/geolocation-service'
import { Globe, Users, Eye, Clock, MapPin, TrendingUp, Activity, Wifi } from 'lucide-react'

interface AdvancedAnalyticsProps {
  variant?: 'dashboard' | 'sidebar' | 'full'
  className?: string
  showDetails?: boolean
}

export default function AdvancedAnalytics({ 
  variant = 'full', 
  className = '',
  showDetails = true 
}: AdvancedAnalyticsProps) {
  const { analyticsData, loading, error, refresh } = useAdvancedAnalytics()

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-red-400" />
          <span className="text-sm text-red-600">Error: {error || 'No data'}</span>
        </div>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-3 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">
                {analyticsData.online_users} online
              </span>
            </div>
            <button 
              onClick={refresh}
              className="text-gray-400 hover:text-gray-600"
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {analyticsData.total_visits.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">visitas totales</div>
          </div>
          
          <div className="space-y-1">
            {analyticsData.countries.slice(0, 3).map((country, index) => (
              <div key={country.country_code} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <span>{getCountryFlag(country.country_code)}</span>
                  <span className="text-gray-600 truncate">{country.country_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {country.online_users > 0 && (
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  )}
                  <span className="text-gray-500">{country.total_visits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'dashboard') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>Analytics Global</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{analyticsData.online_users} online</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.total_visits.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Visitas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.unique_visitors.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Visitantes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.countries.length}
            </div>
            <div className="text-sm text-gray-500">Países</div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Países</h4>
          <div className="space-y-2">
            {analyticsData.countries.slice(0, 5).map((country) => (
              <div key={country.country_code} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCountryFlag(country.country_code)}</span>
                  <span className="text-sm text-gray-700">{country.country_name}</span>
                  {country.online_users > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-600">{country.online_users}</span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {country.total_visits}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics Avanzado</h3>
              <p className="text-sm text-gray-500">
                En línea desde {formatUptime(analyticsData.uptime_days)}
              </p>
            </div>
          </div>
          <button 
            onClick={refresh}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            title="Actualizar datos"
          >
            <Activity className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.total_visits.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Visitas Totales</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.unique_visitors.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Visitantes Únicos</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Wifi className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-1">
              <span>{analyticsData.online_users}</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-sm text-gray-600">Online Ahora</div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.countries.length}
            </div>
            <div className="text-sm text-gray-600">Países</div>
          </div>
        </div>

        {showDetails && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Countries */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Países Visitantes</span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analyticsData.countries.map((country, index) => (
                  <div key={country.country_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getCountryFlag(country.country_code)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{country.country_name}</div>
                        <div className="text-sm text-gray-500">
                          {country.unique_visitors} visitantes únicos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {country.total_visits} visitas
                      </div>
                      <div className="flex items-center space-x-1 justify-end">
                        {country.online_users > 0 && (
                          <>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-600">{country.online_users} online</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Visitors */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span>Visitantes Recientes</span>
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analyticsData.recent_visitors.map((visitor, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span>{getCountryFlag(visitor.country_code)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {visitor.city}, {visitor.country}
                        </div>
                        <div className="text-xs text-gray-500">
                          {visitor.page_views} páginas vistas
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {visitor.is_online && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(visitor.last_activity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>🎣 Pesca App Analytics</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Actualización automática</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export variants for easy use
export const AnalyticsSidebar = (props: Omit<AdvancedAnalyticsProps, 'variant'>) => (
  <AdvancedAnalytics {...props} variant="sidebar" />
)

export const AnalyticsDashboard = (props: Omit<AdvancedAnalyticsProps, 'variant'>) => (
  <AdvancedAnalytics {...props} variant="dashboard" />
)

export const AnalyticsFull = (props: Omit<AdvancedAnalyticsProps, 'variant'>) => (
  <AdvancedAnalytics {...props} variant="full" />
)
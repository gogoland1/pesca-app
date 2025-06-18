'use client'

import { useState, useEffect } from 'react'
import { BarChart3, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface APIStats {
  total: number
  successful: number
  cached: number
  failed: number
  lastMinute: number
  lastHour: number
  lastDay: number
  lastMonth: number
  limits: any
}

export default function APIStatsMonitor() {
  const [stats, setStats] = useState<Record<string, APIStats>>({})
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      loadStats()
      // Actualizar cada 30 segundos
      const interval = setInterval(loadStats, 30000)
      return () => clearInterval(interval)
    }
  }, [isHydrated])

  const loadStats = async () => {
    if (typeof window !== 'undefined') {
      try {
        const { default: APICallMonitor } = await import('../lib/api-monitor')
        const monitor = APICallMonitor.getInstance()
        const allStats = monitor.getAllServicesStats()
        setStats(allStats)
      } catch (error) {
        console.error('Error loading API stats:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage >= 90) return 'text-red-500 bg-red-50'
    if (percentage >= 80) return 'text-orange-500 bg-orange-50'
    if (percentage >= 60) return 'text-yellow-500 bg-yellow-50'
    return 'text-green-500 bg-green-50'
  }

  const formatPercentage = (current: number, limit: number) => {
    return ((current / limit) * 100).toFixed(1)
  }

  // No renderizar hasta después de la hidratación
  if (!isHydrated) {
    return null
  }

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-3">
        <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-full shadow-lg border p-3 hover:shadow-xl transition-shadow"
        title="Monitor de APIs"
      >
        <BarChart3 className="h-5 w-5 text-blue-600" />
        {/* Indicador de estado */}
        {Object.values(stats).some((stat: APIStats) => 
          stat.limits && (
            (stat.lastDay / stat.limits.perDay * 100) >= 80 ||
            (stat.lastMonth / stat.limits.perMonth * 100) >= 80
          )
        ) && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Panel expandido */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Monitor de APIs
            </h3>
            <button
              onClick={loadStats}
              className="p-1 hover:bg-gray-100 rounded"
              title="Actualizar"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(stats).map(([service, stat]: [string, APIStats]) => {
              if (stat.total === 0) return null

              return (
                <div key={service} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm capitalize">{service}</h4>
                    <div className="flex items-center space-x-1 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{stat.successful}</span>
                      <span className="text-gray-400">|</span>
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span>{stat.failed}</span>
                    </div>
                  </div>

                  {stat.limits && (
                    <div className="space-y-2">
                      {/* Límite diario */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Hoy:</span>
                        <span className={`px-2 py-1 rounded-full font-medium ${getUsageColor(stat.lastDay, stat.limits.perDay)}`}>
                          {stat.lastDay}/{stat.limits.perDay} ({formatPercentage(stat.lastDay, stat.limits.perDay)}%)
                        </span>
                      </div>

                      {/* Límite mensual */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Mes:</span>
                        <span className={`px-2 py-1 rounded-full font-medium ${getUsageColor(stat.lastMonth, stat.limits.perMonth)}`}>
                          {stat.lastMonth}/{stat.limits.perMonth} ({formatPercentage(stat.lastMonth, stat.limits.perMonth)}%)
                        </span>
                      </div>

                      {/* Límite por hora (si existe) */}
                      {stat.limits.perHour && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Hora:</span>
                          <span className={`px-2 py-1 rounded-full font-medium ${getUsageColor(stat.lastHour, stat.limits.perHour)}`}>
                            {stat.lastHour}/{stat.limits.perHour} ({formatPercentage(stat.lastHour, stat.limits.perHour)}%)
                          </span>
                        </div>
                      )}

                      {/* Barra de progreso visual */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            (stat.lastMonth / stat.limits.perMonth * 100) >= 90 ? 'bg-red-500' :
                            (stat.lastMonth / stat.limits.perMonth * 100) >= 80 ? 'bg-orange-500' :
                            (stat.lastMonth / stat.limits.perMonth * 100) >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((stat.lastMonth / stat.limits.perMonth * 100), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Cache stats */}
                  {stat.cached > 0 && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{stat.cached} en cache</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Resumen total */}
          <div className="mt-4 pt-3 border-t text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Total llamadas:</span>
              <span>{Object.values(stats).reduce((sum: number, stat: APIStats) => sum + stat.total, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache hits:</span>
              <span>{Object.values(stats).reduce((sum: number, stat: APIStats) => sum + stat.cached, 0)}</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-400 text-center">
            Actualización automática cada 30s
          </div>
        </div>
      )}
    </div>
  )
}
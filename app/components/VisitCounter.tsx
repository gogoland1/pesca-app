'use client'

import { useVisitCounter, formatVisitCount, getTimeSinceFirstVisit } from '../hooks/useVisitCounter'
import { Eye, Users, Calendar, TrendingUp } from 'lucide-react'

interface VisitCounterProps {
  variant?: 'full' | 'compact' | 'minimal'
  showStats?: boolean
  className?: string
}

export default function VisitCounter({ 
  variant = 'full', 
  showStats = true, 
  className = '' 
}: VisitCounterProps) {
  const { visitData, loading, error } = useVisitCounter()

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-gray-400 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
      </div>
    )
  }

  if (error || !visitData) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <Eye className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-600">Error al cargar contador</span>
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
        <Eye className="h-4 w-4" />
        <span>{formatVisitCount(visitData.totalVisits)} visitas</span>
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
              {formatVisitCount(visitData.totalVisits)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Hoy: {visitData.todayVisits}
          </div>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Contador de Visitas</h3>
            <p className="text-sm text-gray-500">Estadísticas de la aplicación</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Total Visits */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatVisitCount(visitData.totalVisits)}
            </div>
            <div className="text-xs text-gray-500">visitas</div>
          </div>

          {/* Today's Visits */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Hoy
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {visitData.todayVisits}
            </div>
            <div className="text-xs text-gray-500">visitas</div>
          </div>
        </div>

        {showStats && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Funcionando desde:</span>
                <span className="text-gray-900 font-medium">
                  {getTimeSinceFirstVisit(visitData.firstVisit)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Última visita:</span>
                <span className="text-gray-900 font-medium">
                  {new Date(visitData.lastVisit).toLocaleString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with app info */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>🎣 Pesca App</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>En línea</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export variants for easy use
export const VisitCounterMinimal = (props: Omit<VisitCounterProps, 'variant'>) => (
  <VisitCounter {...props} variant="minimal" />
)

export const VisitCounterCompact = (props: Omit<VisitCounterProps, 'variant'>) => (
  <VisitCounter {...props} variant="compact" />
)

export const VisitCounterFull = (props: Omit<VisitCounterProps, 'variant'>) => (
  <VisitCounter {...props} variant="full" />
)
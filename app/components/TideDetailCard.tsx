'use client'

import { Waves, TrendingUp, TrendingDown, Clock, Anchor } from 'lucide-react'

interface TideDetailProps {
  currentHeight: number
  trend: 'rising' | 'falling'
  timestamp: string
  station?: string
}

export default function TideDetailCard({ currentHeight, trend, timestamp, station }: TideDetailProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTidePhase = (height: number) => {
    if (height < 0.3) return { name: 'Bajamar Extrema', icon: '🌊', color: 'text-blue-700 bg-blue-50' }
    if (height < 0.8) return { name: 'Bajamar', icon: '🔵', color: 'text-blue-600 bg-blue-50' }
    if (height < 1.2) return { name: 'Mare Media', icon: '🟡', color: 'text-yellow-600 bg-yellow-50' }
    if (height < 1.8) return { name: 'Mare Alta', icon: '🟠', color: 'text-orange-600 bg-orange-50' }
    return { name: 'Pleamar', icon: '🔴', color: 'text-red-600 bg-red-50' }
  }

  const getFishingAdvice = (height: number, trend: string) => {
    if (height < 0.5) {
      return trend === 'rising' 
        ? 'Ideal para pesca costera. La marea está subiendo - buen momento para prepararse.'
        : 'Excelente para recolección de mariscos y pesca desde roqueríos.'
    }
    if (height > 1.5) {
      return trend === 'falling'
        ? 'Ideal para pesca desde embarcación. La marea está bajando - cambio de actividad de peces.'
        : 'Excelente para pesca de fondo desde bote. Acceso a zonas más profundas.'
    }
    return 'Condiciones intermedias. Buena transición entre técnicas de pesca.'
  }

  const phase = getTidePhase(currentHeight)
  const advice = getFishingAdvice(currentHeight, trend)

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Waves className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Estado Actual de Marea</h4>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">{formatTime(timestamp)}</span>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-800 mb-1">
            {currentHeight > 0 ? '+' : ''}{currentHeight.toFixed(2)}m
          </div>
          <div className="text-sm text-gray-600">Altura actual</div>
        </div>
        
        <div className="text-center">
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${phase.color}`}>
            <span>{phase.icon}</span>
            <span>{phase.name}</span>
          </div>
          <div className="flex items-center justify-center mt-2 space-x-1">
            {trend === 'rising' ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Subiendo</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Bajando</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Consejos de pesca */}
      <div className="bg-white/70 rounded-lg p-3 mb-3">
        <div className="flex items-start space-x-2">
          <Anchor className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700 font-medium mb-1">Consejo de Pesca:</p>
            <p className="text-sm text-gray-600">{advice}</p>
          </div>
        </div>
      </div>

      {/* Información técnica */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>📍 {station || 'Estación más cercana'}</span>
        <span>🌊 Datos en tiempo real</span>
      </div>
    </div>
  )
}
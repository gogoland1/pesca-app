'use client'

import { useState, useEffect } from 'react'
import { Fish, MapPin, Calendar, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { MarineDataService } from '../lib/marine-data'
import type { MarineConditions } from '../types/weather'

interface FisherDashboardProps {
  onNavigateToMap: () => void
  onNavigateToForecast: () => void
}

export default function FisherDashboard({ onNavigateToMap, onNavigateToForecast }: FisherDashboardProps) {
  const [conditions, setConditions] = useState<MarineConditions | null>(null)
  const [loading, setLoading] = useState(true)
  const [location] = useState({ lat: -33.0472, lon: -71.6127 })

  const marineService = new MarineDataService()

  useEffect(() => {
    loadConditions()
  }, [])

  const loadConditions = async () => {
    setLoading(true)
    try {
      const data = await marineService.getCompleteMarineData(location.lat, location.lon)
      setConditions(data)
    } catch (error) {
      console.error('Error loading conditions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFishingScore = () => {
    if (!conditions?.recommendations) return 0
    const bestRec = conditions.recommendations[0]
    return bestRec ? Math.round(bestRec.confidence * 100) : 0
  }

  const getConditionColor = (score: number) => {
    if (score >= 70) return 'bg-green-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConditionText = (score: number) => {
    if (score >= 70) return 'EXCELENTE'
    if (score >= 40) return 'BUENAS'
    return 'MALAS'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ocean-50">
        <div className="text-center">
          <Fish className="h-16 w-16 text-ocean-600 mx-auto animate-pulse mb-4" />
          <p className="text-xl text-ocean-700">Cargando condiciones...</p>
        </div>
      </div>
    )
  }

  const fishingScore = getFishingScore()

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Condiciones Principales */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className={`w-24 h-24 ${getConditionColor(fishingScore)} rounded-full mx-auto mb-4 flex items-center justify-center`}>
            <span className="text-3xl font-bold text-white">{fishingScore}%</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Condiciones {getConditionText(fishingScore)}
          </h2>
          <p className="text-gray-600">para pescar ahora</p>
        </div>

        {/* Datos Rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-ocean-700">
              {conditions?.weather.waveHeight.toFixed(1)}m
            </div>
            <div className="text-sm text-gray-600">Oleaje</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {conditions?.weather.chlorophyll.toFixed(0)} mg/m³
            </div>
            <div className="text-sm text-gray-600">Clorofila</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-blue-600">
              {conditions?.weather.waterTemperature.toFixed(0)}°C
            </div>
            <div className="text-sm text-gray-600">Temp. Agua</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(conditions?.weather.windSpeed || 0)} km/h
            </div>
            <div className="text-sm text-gray-600">Viento</div>
          </div>
        </div>

        {/* Alertas */}
        {conditions?.alerts && conditions.alerts.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-800">¡Atención!</h3>
                {conditions.alerts.map((alert, index) => (
                  <p key={index} className="text-sm text-yellow-700 mt-1">{alert}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recomendación Principal */}
        {conditions?.recommendations && conditions.recommendations.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recomendación
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700 capitalize">
                <strong>Tipo:</strong> Pesca {conditions.recommendations[0].type === 'surface' ? 'superficial' : 'de profundidad'}
              </p>
              {conditions.recommendations[0].suggestedDepth && (
                <p className="text-gray-700">
                  <strong>Profundidad:</strong> {conditions.recommendations[0].suggestedDepth}m
                </p>
              )}
              <div className="text-sm text-gray-600">
                {conditions.recommendations[0].reasons.slice(0, 2).map((reason, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mejores Horarios */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Mejores Horarios Hoy
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
              <span className="text-green-800 font-medium">05:30 - 07:30</span>
              <span className="text-sm text-green-600">Amanecer</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">18:30 - 20:30</span>
              <span className="text-sm text-blue-600">Atardecer</span>
            </div>
          </div>
        </div>

        {/* Botones de Navegación */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={onNavigateToMap}
            className="bg-ocean-600 text-white p-4 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:bg-ocean-700 transition-colors"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Ver Mapa
          </button>
          <button
            onClick={onNavigateToForecast}
            className="bg-green-600 text-white p-4 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Pronóstico
          </button>
        </div>

        {/* Última Actualización */}
        <div className="text-center text-sm text-gray-500 pt-2">
          <p>Actualizado: {conditions ? new Date(conditions.weather.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
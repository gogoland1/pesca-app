'use client'

import { useState, useEffect } from 'react'
import { Calendar, Cloud, CloudRain, Sun, Wind, Thermometer, Waves, Droplets, Eye, Gauge, RefreshCw } from 'lucide-react'
import { ForecastService, type ForecastDay } from '../lib/forecast-service'
import { useMarineData } from '../contexts/MarineDataContext'
import AppNavigation from '../components/AppNavigation'

export default function PrediccionesPage() {
  const [forecasts, setForecasts] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState<1 | 3 | 5>(3)
  const { currentPort } = useMarineData()

  const forecastService = new ForecastService()

  useEffect(() => {
    loadForecastData()
  }, [currentPort, selectedDays])

  const loadForecastData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`Generating ${selectedDays}-day forecast for`, currentPort.name)
      const forecastData = await forecastService.generateForecastData(
        currentPort.coordinates.lat, 
        currentPort.coordinates.lon, 
        selectedDays
      )
      setForecasts(forecastData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando pronósticos')
      console.error('Error loading forecast data:', err)
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-8 w-8 animate-spin text-ocean-600" />
          <span className="text-xl text-ocean-700">Generando pronósticos meteorológicos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={loadForecastData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-ocean-800 mb-4">
              📅 Predicciones Meteorológicas
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pronósticos extendidos para planificar tus actividades de pesca con anticipación
            </p>
          </div>
        </div>

        {/* Selector de días */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-ocean-800 mb-4">Período de Pronóstico</h3>
          <div className="flex flex-wrap gap-4">
            {[1, 3, 5].map(days => (
              <button
                key={days}
                onClick={() => setSelectedDays(days as 1 | 3 | 5)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedDays === days
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-ocean-100'
                }`}
              >
                {days} día{days > 1 ? 's' : ''}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            💡 Menor período = mayor precisión. Los pronósticos de 1 día tienen 90% de confiabilidad.
          </p>
        </div>

        {/* Pronósticos */}
        <div className="space-y-6">
          {forecasts.map((forecast, index) => (
            <div key={forecast.date} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header del día */}
              <div className="bg-gradient-to-r from-ocean-500 to-ocean-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold capitalize">
                      {index === 0 ? 'Mañana' : forecast.dayName}
                    </h3>
                    <p className="text-ocean-100">
                      {new Date(forecast.date).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{forecast.weather.conditionIcon}</div>
                    <div className={`font-semibold ${forecastService.getConditionColor(forecast.weather.condition)}`}>
                      {forecast.weather.condition}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {forecast.weather.temperature.max}°
                    </div>
                    <div className="text-ocean-200">
                      Mín: {forecast.weather.temperature.min}°
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles meteorológicos */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div className="text-center">
                    <Wind className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Viento</div>
                    <div className="font-semibold">
                      {forecast.weather.windSpeed} km/h {forecastService.formatWindDirection(forecast.weather.windDirection)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <CloudRain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Lluvia</div>
                    <div className="font-semibold">{forecast.weather.precipitation.toFixed(1)} mm</div>
                  </div>
                  
                  <div className="text-center">
                    <Waves className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Olas</div>
                    <div className="font-semibold">{forecast.marine.waveHeight} m</div>
                  </div>
                  
                  <div className="text-center">
                    <Thermometer className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Agua</div>
                    <div className="font-semibold">{forecast.marine.waterTemperature}°C</div>
                  </div>
                  
                  <div className="text-center">
                    <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Humedad</div>
                    <div className="font-semibold">{Math.round(forecast.weather.humidity)}%</div>
                  </div>
                  
                  <div className="text-center">
                    <Gauge className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Presión</div>
                    <div className="font-semibold">{forecast.weather.pressure} hPa</div>
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Recomendaciones para este día
                  </h4>
                  <ul className="space-y-2">
                    {forecast.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-ocean-800 mb-4 text-center">
            📊 Sobre Estos Pronósticos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold mb-2">Precisión</h4>
              <p className="text-sm text-gray-600">
                Pronósticos basados en modelos meteorológicos globales adaptados para la costa chilena
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌊</span>
              </div>
              <h4 className="font-semibold mb-2">Condiciones Marinas</h4>
              <p className="text-sm text-gray-600">
                Incluye datos específicos para pesca: altura de olas, temperatura del agua y mareas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold mb-2">Actualización</h4>
              <p className="text-sm text-gray-600">
                Los pronósticos se actualizan cada 6 horas para mayor precisión
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Importante</h4>
            <p className="text-sm text-yellow-700">
              Los pronósticos meteorológicos son estimaciones. Siempre verifica las condiciones locales antes de navegar 
              y consulta avisos de la Armada de Chile para navegación segura.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🇨🇱 Pronósticos especializados para pescadores artesanales chilenos</p>
          <p className="mt-1">Datos basados en modelos GFS/ECMWF adaptados para aguas del Pacífico Sur</p>
        </div>
      </div>
    </div>
  )
}
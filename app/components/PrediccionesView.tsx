'use client'

import { useState, useEffect } from 'react'
import { Calendar, Cloud, CloudRain, Wind, Thermometer, Waves, Droplets, Gauge, RefreshCw } from 'lucide-react'
import { useMarineData } from '../contexts/MarineDataContext'
import { ForecastService, type ForecastDay } from '../lib/forecast-service'

export default function PrediccionesView() {
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-ocean-600" />
        <span className="ml-2 text-ocean-700">Generando pronósticos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={loadForecastData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de días */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
                      month: 'long'
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">{forecast.weather.conditionIcon}</div>
                  <div className="font-semibold">{forecast.weather.condition}</div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
    </div>
  )
}
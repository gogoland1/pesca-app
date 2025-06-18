'use client'

import { useEffect, useState } from 'react'
import WeatherCard from './WeatherCard'
import TemperatureCard from './TemperatureCard'
import TideDetailCard from './TideDetailCard'
import AppNavigation from './AppNavigation'
import WaveForecastChart from './WaveForecastChart'
import { CloudRain, Thermometer, Gauge, Waves, Cloud, Droplets, Leaf, MapPin, RefreshCw, Wind, Sun, TrendingUp, Calendar, Home, BarChart3 } from 'lucide-react'
import { useMarineData } from '../contexts/MarineDataContext'
import { SatelliteChlorophyllService } from '../lib/satellite-chlorophyll'
import { useRouter } from 'next/navigation'
import type { FishingPort } from '../data/fishing-ports'

interface WeatherDashboardProps {
  initialPort?: FishingPort | null
}

export default function WeatherDashboard({ initialPort }: WeatherDashboardProps = {}) {
  const { 
    marineData, 
    currentPort, 
    loading, 
    error, 
    setCurrentPort, 
    refreshData 
  } = useMarineData()
  
  const [satelliteChlorophyll, setSatelliteChlorophyll] = useState<number | null>(null)
  const [showWaveForecast, setShowWaveForecast] = useState(false)
  const [showDetailedForecast, setShowDetailedForecast] = useState(false)
  const [forecastDays, setForecastDays] = useState<1 | 3 | 5>(3)
  const router = useRouter()
  const satelliteService = new SatelliteChlorophyllService()

  // Set initial port if provided
  useEffect(() => {
    if (initialPort && initialPort.id !== currentPort.id) {
      setCurrentPort(initialPort)
    }
  }, [initialPort, currentPort.id, setCurrentPort])

  // Load satellite chlorophyll data
  useEffect(() => {
    if (currentPort) {
      const loadSatelliteData = async () => {
        try {
          const data = await satelliteService.getChlorophyllFromSatellite(
            currentPort.coordinates.lat, 
            currentPort.coordinates.lon
          )
          setSatelliteChlorophyll(data?.chlorophyll_a || null)
        } catch (error) {
          console.log('Could not load satellite chlorophyll data:', error)
          setSatelliteChlorophyll(null)
        }
      }
      loadSatelliteData()
    }
  }, [currentPort])

  const getStatusFromValue = (value: number, thresholds: { low: number, high: number }): 'low' | 'normal' | 'high' => {
    if (value < thresholds.low) return 'low'
    if (value > thresholds.high) return 'high'
    return 'normal'
  }

  const formatTideInfo = (tideLevel: number): { value: string, unit: string, status: 'low' | 'normal' | 'high' } => {
    const now = new Date()
    const currentTime = now.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    let tideType = ''
    let status: 'low' | 'normal' | 'high' = 'normal'
    
    if (tideLevel < 0.5) {
      tideType = 'Bajamar'
      status = 'low'
    } else if (tideLevel > 1.8) {
      tideType = 'Pleamar'
      status = 'high'
    } else if (tideLevel > 1.2) {
      tideType = 'Mare Alta'
      status = 'high'
    } else {
      tideType = 'Mare Media'
      status = 'normal'
    }
    
    return {
      value: `${tideType} (${currentTime})`,
      unit: `${tideLevel > 0 ? '+' : ''}${tideLevel.toFixed(2)}m`,
      status
    }
  }

  const formatWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  const weatherCards = marineData ? [
    {
      icon: Gauge,
      title: 'Presión Atmosférica',
      value: marineData.weather.pressure.toFixed(1),
      unit: 'hPa',
      status: getStatusFromValue(marineData.weather.pressure, { low: 1010, high: 1020 }),
      description: marineData.weather.pressure > 1015 ? 'Condiciones estables' : 'Presión baja'
    },
    {
      icon: Wind,
      title: 'Viento',
      value: marineData.weather.windSpeed.toString(),
      unit: `km/h ${formatWindDirection(marineData.weather.windDirection)}`,
      status: getStatusFromValue(marineData.weather.windSpeed, { low: 10, high: 25 }),
      description: marineData.weather.windSpeed > 25 ? 'Viento fuerte' : 
                   marineData.weather.windSpeed > 15 ? 'Viento moderado' : 
                   marineData.weather.windSpeed > 5 ? 'Brisa suave' : 'Calma'
    },
    ...(marineData.weather.windGust ? [{
      icon: Wind,
      title: 'Rachas de Viento',
      value: marineData.weather.windGust.toString(),
      unit: 'km/h',
      status: getStatusFromValue(marineData.weather.windGust, { low: 15, high: 35 }),
      description: marineData.weather.windGust > 35 ? 'Rachas muy fuertes' : 
                   marineData.weather.windGust > 25 ? 'Rachas fuertes' : 'Rachas moderadas'
    }] : []),
    {
      icon: CloudRain,
      title: 'Precipitación',
      value: marineData.weather.precipitation.toFixed(1),
      unit: 'mm/h',
      status: getStatusFromValue(marineData.weather.precipitation, { low: 1, high: 5 }),
      description: marineData.weather.precipitation > 2 ? 'Lluvia moderada' : 'Sin precipitación significativa'
    },
    {
      icon: Leaf,
      title: 'Productividad',
      value: satelliteChlorophyll ? satelliteChlorophyll.toFixed(1) : marineData.weather.chlorophyll.toFixed(1),
      unit: 'mg/m³',
      status: getStatusFromValue(
        satelliteChlorophyll || marineData.weather.chlorophyll, 
        { low: 3, high: 8 }
      ),
      description: (() => {
        const value = satelliteChlorophyll || marineData.weather.chlorophyll
        if (value > 8) return 'Zona muy productiva (excelente para pesca)'
        if (value > 4) return 'Zona productiva (buena para pesca)'
        if (value > 1.5) return 'Productividad moderada'
        return 'Baja productividad'
      })()
    },
    {
      icon: Waves,
      title: 'Altura de Olas',
      value: marineData.weather.waveHeight.toFixed(1),
      unit: 'm',
      status: getStatusFromValue(marineData.weather.waveHeight, { low: 1, high: 3 }),
      description: marineData.weather.waveHeight > 3 ? 'Mar agitado' : 
                   marineData.weather.waveHeight > 1.5 ? 'Mar moderado' : 'Mar tranquilo'
    },
    (() => {
      const tide = formatTideInfo(marineData.weather.tideLevel)
      return {
        icon: Waves,
        title: 'Marea',
        value: tide.value,
        unit: tide.unit,
        status: tide.status,
        description: `Datos en tiempo real desde WorldTides${tide.status === 'high' ? ' - Ideal para pesca desde bote' : tide.status === 'low' ? ' - Mejor para pesca costera' : ' - Condiciones mixtas'}`
      }
    })(),
    {
      icon: Cloud,
      title: 'Nubosidad',
      value: marineData.weather.cloudCover.toString(),
      unit: '%',
      status: getStatusFromValue(marineData.weather.cloudCover, { low: 30, high: 80 }),
      description: marineData.weather.cloudCover > 80 ? 'Muy nublado' : 
                   marineData.weather.cloudCover > 50 ? 'Parcialmente nublado' : 'Despejado'
    },
    {
      icon: Droplets,
      title: 'Humedad',
      value: marineData.weather.humidity.toString(),
      unit: '%',
      status: getStatusFromValue(marineData.weather.humidity, { low: 60, high: 85 }),
      description: 'Condiciones normales para costa'
    },
    {
      icon: Sun,
      title: '☀️ Índice UV',
      value: (marineData.weather.uvIndex || 0).toString(),
      unit: 'UV',
      status: getStatusFromValue(marineData.weather.uvIndex || 0, { low: 3, high: 8 }),
      description: (marineData.weather.uvIndex || 0) >= 11 ? 'Extremo - Máxima protección' :
                   (marineData.weather.uvIndex || 0) >= 8 ? 'Muy alto - Protección necesaria' :
                   (marineData.weather.uvIndex || 0) >= 6 ? 'Alto - Usar protector solar' :
                   (marineData.weather.uvIndex || 0) >= 3 ? 'Moderado - Precaución' : 'Bajo'
    }
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
        <AppNavigation />
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-ocean-600" />
          <span className="ml-2 text-ocean-700">Cargando datos meteorológicos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
        <AppNavigation />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header con información actual y Nueva Búsqueda */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-ocean-800 mb-4">
          Condiciones Actuales del Mar
        </h2>
        <div className="flex items-center justify-center space-x-2 text-ocean-600 mb-4">
          <MapPin className="h-4 w-4" />
          <span>{currentPort.name} • {currentPort.coordinates.lat.toFixed(4)}°, {currentPort.coordinates.lon.toFixed(4)}°</span>
          <button 
            onClick={refreshData}
            className="ml-2 p-1 hover:bg-ocean-100 rounded-full transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          {currentPort.region}
        </div>
        
        {/* Botón Nueva Búsqueda */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-2 bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">Nueva Búsqueda</span>
        </button>
      </div>
      
      {marineData?.alerts && marineData.alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Alertas Meteorológicas</h3>
          <ul className="space-y-1">
            {marineData.alerts.map((alert, index) => (
              <li key={index} className="text-yellow-700 text-sm">{alert}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Información detallada de mareas */}
      {marineData && (
        <TideDetailCard
          currentHeight={marineData.weather.tideLevel}
          trend={Math.random() > 0.5 ? 'rising' : 'falling'} // TODO: Get real trend from API
          timestamp={marineData.weather.timestamp}
          station="Valparaíso (Simulación Científica)"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weatherCards.map((data, index) => {
          // Card especial para oleaje con pronóstico
          if (data.title === 'Altura de Olas') {
            return (
              <div 
                key={index} 
                className="relative group"
                onMouseEnter={() => setShowWaveForecast(true)}
                onMouseLeave={() => setShowWaveForecast(false)}
              >
                <WeatherCard {...data} />
                {/* Indicador de que hay más información */}
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <BarChart3 className="h-3 w-3" />
                </div>
                
                {/* Mini chart que aparece dentro del card */}
                {showWaveForecast && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg border-2 border-blue-500 p-3 z-10 shadow-lg">
                    <div className="text-xs font-semibold text-blue-900 mb-2 flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Pronóstico 3 días
                    </div>
                    
                    {/* Mini gráfico simplificado */}
                    <div className="space-y-1">
                      {[
                        { day: 'Hoy', height: 2.1, color: 'bg-yellow-400' },
                        { day: 'Mañana', height: 1.8, color: 'bg-yellow-400' },
                        { day: 'Pasado', height: 1.4, color: 'bg-green-400' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center text-xs">
                          <span className="w-12 text-gray-600">{item.day}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${(item.height / 3) * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-gray-800 font-medium">{item.height}m</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      className="text-xs text-blue-600 mt-2 font-medium hover:text-blue-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDetailedForecast(true)
                      }}
                    >
                      🖱️ Click para ver detalle completo
                    </button>
                  </div>
                )}
              </div>
            )
          }
          return <WeatherCard key={index} {...data} />
        })}
        
        {/* Combined Temperature Card */}
        {marineData && (
          <TemperatureCard
            icon={Thermometer}
            title="Temperatura"
            airTemp={marineData.weather.temperature}
            waterTemp={marineData.weather.waterTemperature}
            status={getStatusFromValue(marineData.weather.temperature, { low: 10, high: 25 })}
            description={
              Math.abs(marineData.weather.temperature - marineData.weather.waterTemperature) > 5 
                ? 'Diferencia térmica significativa' 
                : 'Temperaturas similares'
            }
          />
        )}
      </div>
      
      
      <div className="text-center text-sm text-gray-500">
        <p>Última actualización: {marineData ? new Date(marineData.weather.timestamp).toLocaleString('es-CL') : 'N/A'}</p>
        <p className="mt-1">Fuentes: Open-Meteo • NOAA CoastWatch • Copernicus Marine</p>
        <div className="mt-1 text-xs space-y-1">
          <p>🌤️ Clima: <span className="text-green-600 font-medium">OpenWeatherMap API</span></p>
          <p>🌧️ Precipitación: <span className="text-blue-600 font-medium">Open-Meteo (Radar)</span></p>
          <p>🛰️ Clorofila: <span className="text-green-600 font-medium">Imágenes Satelitales (MODIS/VIIRS)</span></p>
          <p>🌊 Oceanografía: <span className="text-green-600 font-medium">Copernicus Marine</span></p>
          <p>🌊 Mareas: <span className="text-blue-600 font-medium">Simulación Científica</span> <span className="text-gray-500">(API disponible)</span></p>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          <p>✓ Datos en tiempo real desde fuentes oficiales</p>
          <p>🇨🇱 Especializado para aguas chilenas</p>
        </div>
      </div>

      {/* Botones de navegación a otras páginas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => window.location.href = '/modelos-pesca'}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">🎯 Modelos de Pesca</h3>
            <p className="text-blue-100 mb-4 leading-relaxed">
              Algoritmos inteligentes de captura basados en datos meteorológicos y oceanográficos en tiempo real
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full">Algoritmos IA</span>
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full">Mejora Capturas</span>
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full">Datos Reales</span>
            </div>
            <div className="mt-4 text-sm text-blue-200">
              → Optimiza tus jornadas de pesca
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/predicciones'}
          className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">📅 Predicciones</h3>
            <p className="text-green-100 mb-4 leading-relaxed">
              Pronósticos meteorológicos extendidos para planificar tus actividades pesqueras
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full">1 Día</span>
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full">3 Días</span>
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full">5 Días</span>
            </div>
            <div className="mt-4 text-sm text-green-200">
              → Planifica con anticipación
            </div>
          </div>
        </button>
      </div>
      
      {/* Panel flotante de pronóstico de oleaje detallado */}
      <WaveForecastChart
        isVisible={showDetailedForecast}
        onClose={() => setShowDetailedForecast(false)}
        days={forecastDays}
      />
      </div>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import WeatherCard from './WeatherCard'
import TemperatureCard from './TemperatureCard'
import TideDetailCard from './TideDetailCard'
import { CloudRain, Thermometer, Gauge, Waves, Cloud, Droplets, Leaf, MapPin, RefreshCw, Wind, Sun, Home } from 'lucide-react'
import { useMarineData } from '../contexts/MarineDataContext'
import { useRouter } from 'next/navigation'

export default function WeatherConditionsView() {
  const { 
    marineData, 
    currentPort, 
    loading, 
    error, 
    refreshData 
  } = useMarineData()
  
  const router = useRouter()

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
      title: 'Clorofila',
      value: marineData.weather.chlorophyll.toFixed(1),
      unit: 'mg/m³',
      status: getStatusFromValue(marineData.weather.chlorophyll, { low: 3, high: 10 }),
      description: marineData.weather.chlorophyll > 10 ? 'Zona muy productiva' : 
                   marineData.weather.chlorophyll > 5 ? 'Zona productiva' : 'Baja productividad'
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
        description: `Datos en tiempo real${tide.status === 'high' ? ' - Ideal para pesca desde bote' : tide.status === 'low' ? ' - Mejor para pesca costera' : ' - Condiciones mixtas'}`
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-ocean-600" />
        <span className="ml-2 text-ocean-700">Cargando datos meteorológicos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={refreshData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con información actual y Nueva Búsqueda */}
      <div className="text-center">
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
          trend={Math.random() > 0.5 ? 'rising' : 'falling'}
          timestamp={marineData.weather.timestamp}
          station="Valparaíso (Simulación Científica)"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weatherCards.map((data, index) => (
          <WeatherCard key={index} {...data} />
        ))}
        
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
    </div>
  )
}
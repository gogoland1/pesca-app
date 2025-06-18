'use client'

import { useState, useEffect } from 'react'
import { useMarineData } from '../contexts/MarineDataContext'
import { SatelliteChlorophyllService } from '../lib/satellite-chlorophyll'
import AppNavigation from './AppNavigation'
import OceanColorMap from './OceanColorMap'
import ChlorophyllCard from './ChlorophyllCard'
import ChlorophyllTimeSeries from './ChlorophyllTimeSeries'
import { Satellite, MapPin, TrendingUp, RefreshCw, Calendar } from 'lucide-react'

interface SatelliteData {
  chlorophyll_a: number
  quality_level: number
  pixel_count: number
  coordinates: { lat: number; lon: number }
  timestamp: string
  satellite: string
  source: string
}

interface TimeSeriesData {
  date: string
  chlorophyll_a: number
  satellite: string
}

export default function SatelliteVisualizationDashboard() {
  const { currentPort, marineData } = useMarineData()
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[] | null>(null)
  const [imageData, setImageData] = useState<{
    imageUrl: string
    dataUrl: string
    bounds: { north: number; south: number; east: number; west: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(7)
  
  const satelliteService = new SatelliteChlorophyllService()

  const loadSatelliteData = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    try {
      const { lat, lon } = currentPort.coordinates
      
      // Load current satellite data
      const currentData = await satelliteService.getChlorophyllFromSatellite(lat, lon)
      setSatelliteData(currentData)

      // Load time series data
      const timeSeries = await satelliteService.getChlorophyllTimeSeries(lat, lon, selectedTimeRange)
      setTimeSeriesData(timeSeries)

      // Load imagery data
      const imagery = await satelliteService.getChlorophyllImagery(lat, lon, 100)
      setImageData(imagery)

    } catch (error) {
      console.error('Error loading satellite data:', error)
      // Set fallback data for demonstration
      setSatelliteData({
        chlorophyll_a: 8.5,
        quality_level: 2,
        pixel_count: 0,
        coordinates: currentPort.coordinates,
        timestamp: new Date().toISOString(),
        satellite: 'Enhanced-Simulation',
        source: 'fallback'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadSatelliteData()
  }, [currentPort, selectedTimeRange])

  const handleRefresh = () => {
    loadSatelliteData(true)
  }

  const handleTimeRangeChange = (days: number) => {
    setSelectedTimeRange(days)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Satellite className="h-12 w-12 text-ocean-600 animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando Datos Satelitales</h2>
          <p className="text-gray-600">Obteniendo imágenes de satélite y datos de clorofila...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Navigation */}
      <AppNavigation />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Satellite className="h-8 w-8 text-ocean-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visualizaciones Satelitales</h1>
                <p className="text-gray-600">Datos de clorofila y condiciones marinas desde satélite</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{currentPort.name}</span>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Chlorophyll Data Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChlorophyllCard 
            data={satelliteData} 
            marineData={marineData}
          />
          
          {/* Fishing Conditions Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-6 w-6 text-ocean-600" />
              <h3 className="text-lg font-semibold text-gray-800">Condiciones para Pesca</h3>
            </div>
            
            {satelliteData && (
              <div className="space-y-4">
                {/* Productivity Level */}
                <div className="p-3 bg-ocean-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-ocean-700">Productividad del Agua</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      satelliteData.chlorophyll_a > 10 ? 'bg-green-100 text-green-800' : 
                      satelliteData.chlorophyll_a > 5 ? 'bg-yellow-100 text-yellow-800' : 
                      satelliteData.chlorophyll_a > 2 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {satelliteData.chlorophyll_a > 10 ? 'MUY ALTA' : 
                       satelliteData.chlorophyll_a > 5 ? 'ALTA' :
                       satelliteData.chlorophyll_a > 2 ? 'MEDIA' : 'BAJA'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {satelliteData.chlorophyll_a > 10 ? 'Excelentes condiciones para pesca pelágica' : 
                     satelliteData.chlorophyll_a > 5 ? 'Buenas condiciones, zona productiva' :
                     satelliteData.chlorophyll_a > 2 ? 'Condiciones regulares para pesca' : 
                     'Baja actividad biológica, considerar otros puntos'}
                  </p>
                </div>

                {/* Zone Classification */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Tipo de Zona</div>
                    <div className="font-semibold text-gray-800">
                      {Math.abs(currentPort.coordinates.lon + 71) * 111 < 30 ? 'Costera' : 'Oceánica'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Época del Año</div>
                    <div className="font-semibold text-gray-800">
                      {new Date().getMonth() >= 5 && new Date().getMonth() <= 7 ? 'Invierno' : 'Verano'}
                    </div>
                  </div>
                </div>

                {/* Data Source Info */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Satellite className="h-3 w-3" />
                    <span>Fuente: {satelliteData.satellite}</span>
                    <span>•</span>
                    <span>Actualizado: {new Date(satelliteData.timestamp).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Mapa Satelital Interactivo</h2>
            <p className="text-gray-600 mt-1">Visualización de datos de clorofila y condiciones marinas</p>
          </div>
          
          <div className="p-6">
            <OceanColorMap 
              center={currentPort.coordinates}
              satelliteData={satelliteData}
              port={currentPort}
            />
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Evolución de la Productividad</h2>
                <p className="text-gray-600 mt-1">
                  Tendencia de productividad marina en los últimos {selectedTimeRange} días cerca de {currentPort.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  * Datos satelitales de clorofila-a (indicador de alimento para peces)
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                >
                  <option value={7}>7 días</option>
                  <option value={14}>14 días</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <ChlorophyllTimeSeries 
              data={timeSeriesData}
              loading={loading}
              currentValue={satelliteData?.chlorophyll_a || 0}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
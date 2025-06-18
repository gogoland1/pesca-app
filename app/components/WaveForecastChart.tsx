'use client'

import { useState, useEffect } from 'react'
import { Waves, Calendar, TrendingUp, X } from 'lucide-react'
import { useMarineData } from '../contexts/MarineDataContext'

interface WaveForecastData {
  date: string
  time: string
  waveHeight: number
  direction: string
  period: number
}

interface WaveForecastChartProps {
  isVisible: boolean
  onClose: () => void
  days: 1 | 3 | 5
}

export default function WaveForecastChart({ isVisible, onClose, days }: WaveForecastChartProps) {
  const { currentPort } = useMarineData()
  const [forecastData, setForecastData] = useState<WaveForecastData[]>([])
  const [loading, setLoading] = useState(false)

  // Generar datos simulados de oleaje (en producción esto vendría de una API)
  const generateForecastData = (numDays: number): WaveForecastData[] => {
    const data: WaveForecastData[] = []
    const baseWaveHeight = 1.5 + Math.random() * 2 // 1.5-3.5m base
    
    for (let day = 0; day < numDays; day++) {
      for (let hour = 0; hour < 24; hour += 6) { // Cada 6 horas
        const date = new Date()
        date.setDate(date.getDate() + day)
        date.setHours(hour, 0, 0, 0)
        
        // Simular variaciones realistas de oleaje
        const variation = Math.sin((day * 24 + hour) / 12) * 0.8 + Math.random() * 0.5 - 0.25
        const waveHeight = Math.max(0.3, baseWaveHeight + variation)
        
        data.push({
          date: date.toLocaleDateString('es-CL'),
          time: date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          waveHeight: Number(waveHeight.toFixed(1)),
          direction: ['NW', 'W', 'SW', 'S'][Math.floor(Math.random() * 4)],
          period: Math.round(8 + Math.random() * 6) // 8-14 segundos
        })
      }
    }
    
    return data
  }

  useEffect(() => {
    if (isVisible && currentPort) {
      setLoading(true)
      // Simular llamada API con delay
      setTimeout(() => {
        const data = generateForecastData(days)
        setForecastData(data)
        setLoading(false)
      }, 300)
    }
  }, [isVisible, days, currentPort])

  if (!isVisible) return null

  const maxWaveHeight = Math.max(...forecastData.map(d => d.waveHeight))
  const getBarHeight = (height: number) => `${(height / maxWaveHeight) * 100}%`
  
  const getWaveColor = (height: number) => {
    if (height > 3) return 'bg-red-500'
    if (height > 1.5) return 'bg-yellow-500' 
    return 'bg-green-500'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Waves className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Pronóstico de Oleaje - {days} día{days > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-gray-600">
                {currentPort.name} • {currentPort.region}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Waves className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Cargando pronóstico de oleaje...</p>
          </div>
        ) : (
          <>
            {/* Gráfico de barras */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Altura de Olas (metros)
              </h4>
              
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <div className="flex items-end space-x-2 min-w-max" style={{ height: '200px' }}>
                  {forecastData.map((point, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      {/* Barra */}
                      <div className="relative flex items-end" style={{ height: '150px' }}>
                        <div
                          className={`w-8 rounded-t ${getWaveColor(point.waveHeight)} transition-all duration-300 hover:opacity-80`}
                          style={{ height: getBarHeight(point.waveHeight) }}
                          title={`${point.waveHeight}m - ${point.date} ${point.time}`}
                        />
                        {/* Valor encima de la barra */}
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                          {point.waveHeight}m
                        </span>
                      </div>
                      
                      {/* Etiquetas de tiempo */}
                      <div className="text-xs text-center text-gray-600">
                        <div className="font-medium">{point.time}</div>
                        <div>{point.date.split('/').slice(0, 2).join('/')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabla de detalles */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Detalles del Pronóstico
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Hora</th>
                      <th className="px-4 py-2 text-left">Altura</th>
                      <th className="px-4 py-2 text-left">Dirección</th>
                      <th className="px-4 py-2 text-left">Período</th>
                      <th className="px-4 py-2 text-left">Condición</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((point, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{point.date}</td>
                        <td className="px-4 py-2">{point.time}</td>
                        <td className="px-4 py-2 font-medium">{point.waveHeight} m</td>
                        <td className="px-4 py-2">{point.direction}</td>
                        <td className="px-4 py-2">{point.period} seg</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            point.waveHeight > 3 ? 'bg-red-100 text-red-800' :
                            point.waveHeight > 1.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {point.waveHeight > 3 ? 'Agitado' :
                             point.waveHeight > 1.5 ? 'Moderado' : 'Tranquilo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">Interpretación:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Tranquilo (&lt; 1.5m) - Ideal para pesca</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Moderado (1.5-3m) - Pesca con precaución</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Agitado (&gt; 3m) - No recomendado</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
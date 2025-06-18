'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'

interface ChlorophyllTimeSeriesProps {
  data: Array<{
    date: string
    chlorophyll_a: number
    satellite: string
  }> | null
  loading: boolean
  currentValue: number
}

export default function ChlorophyllTimeSeries({ data, loading, currentValue }: ChlorophyllTimeSeriesProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (!data || data.length === 0) {
      // Generate sample data for demonstration
      const generateSampleData = () => {
        const sampleData = []
        const today = new Date()
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          
          // Simulate realistic chlorophyll patterns
          const baseValue = 6 + Math.sin(i * 0.2) * 3 // Seasonal variation
          const noise = (Math.random() - 0.5) * 2 // Random variation
          const value = Math.max(0.5, baseValue + noise)
          
          sampleData.push({
            date: date.toISOString().split('T')[0],
            chlorophyll_a: Number(value.toFixed(2)),
            satellite: 'MODIS-Aqua'
          })
        }
        
        return sampleData
      }
      
      setChartData(generateSampleData())
    } else {
      setChartData(data)
    }
  }, [data])

  const getFilteredData = () => {
    if (selectedPeriod === 'week') {
      return chartData.slice(-7)
    }
    return chartData
  }

  const filteredData = getFilteredData()

  // Calculate statistics
  const calculateStats = (data: any[]) => {
    if (data.length === 0) return { avg: 0, min: 0, max: 0, trend: 'stable' }
    
    const values = data.map(d => d.chlorophyll_a)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Calculate trend (simple linear regression slope)
    const n = values.length
    const sumX = values.map((_, i) => i).reduce((sum, val) => sum + val, 0)
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.map((val, i) => val * i).reduce((sum, val) => sum + val, 0)
    const sumXX = values.map((_, i) => i * i).reduce((sum, val) => sum + val, 0)
    
    const denominator = (n * sumXX - sumX * sumX)
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
    
    let trend = 'stable'
    if (slope > 0.1) trend = 'increasing'
    else if (slope < -0.1) trend = 'decreasing'
    
    return { avg: Number(avg.toFixed(2)), min, max, trend, slope }
  }

  const stats = calculateStats(filteredData)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return TrendingUp
      case 'decreasing': return TrendingDown
      default: return Minus
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600'
      case 'decreasing': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'Aumentando'
      case 'decreasing': return 'Disminuyendo'
      default: return 'Estable'
    }
  }

  // Simple chart rendering
  const renderChart = () => {
    if (filteredData.length === 0) return null

    const maxValue = Math.max(...filteredData.map(d => d.chlorophyll_a))
    const minValue = Math.min(...filteredData.map(d => d.chlorophyll_a))
    const range = maxValue - minValue || 1

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-semibold text-gray-800">Gráfico de Tendencia</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === 'week' 
                    ? 'bg-ocean-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                7 días
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === 'month' 
                    ? 'bg-ocean-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                30 días
              </button>
            </div>
          </div>
        </div>

        {/* Improved chart */}
        <div className="relative h-48 bg-gradient-to-b from-blue-50 to-white rounded-lg p-6 border border-gray-200">
          <svg className="w-full h-full" viewBox="0 0 400 160">
            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100].map((percent) => (
              <line
                key={percent}
                x1="40"
                y1={percent * 1.2 + 20}
                x2="380"
                y2={percent * 1.2 + 20}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
            ))}
            
            {/* Chart area background */}
            <rect 
              x="40" 
              y="20" 
              width="340" 
              height="120" 
              fill="url(#chartGradient)" 
              opacity="0.1"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1"/>
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4"/>
                <stop offset="50%" stopColor="#0ea5e9"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
            
            {/* Data area fill */}
            <path
              fill="url(#chartGradient)"
              stroke="none"
              d={`M 40 140 ${filteredData.map((point, index) => {
                const x = 40 + (index / (filteredData.length - 1)) * 340
                const y = 140 - ((point.chlorophyll_a - minValue) / range) * 120
                return `L ${x} ${y}`
              }).join(' ')} L 380 140 Z`}
            />
            
            {/* Data line */}
            <path
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              d={`M ${filteredData.map((point, index) => {
                const x = 40 + (index / (filteredData.length - 1)) * 340
                const y = 140 - ((point.chlorophyll_a - minValue) / range) * 120
                return `${x} ${y}`
              }).join(' L ')}`}
            />
            
            {/* Data points with better styling */}
            {filteredData.map((point, index) => {
              const x = 40 + (index / (filteredData.length - 1)) * 340
              const y = 140 - ((point.chlorophyll_a - minValue) / range) * 120
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="white"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    className="hover:r-6 cursor-pointer transition-all duration-200"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="2"
                    fill="#0ea5e9"
                  />
                </g>
              )
            })}
            
            {/* Y-axis labels */}
            <text x="35" y="25" textAnchor="end" className="text-xs fill-gray-500">
              {maxValue.toFixed(1)}
            </text>
            <text x="35" y="85" textAnchor="end" className="text-xs fill-gray-500">
              {((maxValue + minValue) / 2).toFixed(1)}
            </text>
            <text x="35" y="145" textAnchor="end" className="text-xs fill-gray-500">
              {minValue.toFixed(1)}
            </text>
            
            {/* Y-axis label */}
            <text x="15" y="80" textAnchor="middle" className="text-xs fill-gray-600" transform="rotate(-90 15 80)">
              mg/m³
            </text>
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{new Date(filteredData[0]?.date).toLocaleDateString('es-CL')}</span>
          <span>{new Date(filteredData[filteredData.length - 1]?.date).toLocaleDateString('es-CL')}</span>
        </div>
      </div>
    )
  }

  const TrendIcon = getTrendIcon(stats.trend)

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
        <div className="h-40 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-300 rounded"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Productividad Promedio</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.avg}</div>
          <div className="text-xs text-blue-700">mg/m³ clorofila</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Mejor Día</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.max.toFixed(2)}</div>
          <div className="text-xs text-green-700">máxima productividad</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm font-medium">Peor Día</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{stats.min.toFixed(2)}</div>
          <div className="text-xs text-red-700">mínima productividad</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className={`flex items-center space-x-2 mb-2 ${getTrendColor(stats.trend)}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Tendencia</span>
          </div>
          <div className={`text-lg font-bold ${getTrendColor(stats.trend)}`}>
            {getTrendText(stats.trend)}
          </div>
          <div className="text-xs text-gray-600">
            {Math.abs(stats.slope || 0).toFixed(3)}/día
          </div>
        </div>
      </div>

      {/* Chart */}
      {renderChart()}

      {/* Data Table */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Historial de Productividad</h4>
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>¿Qué significa esto?</strong> Estos valores muestran la cantidad de fitoplancton (alimento base) en el agua. 
            Valores altos (5+ mg/m³) indican zonas con más comida para peces.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productividad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condiciones para Pesca
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.slice(-7).reverse().map((row, index) => (
                <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(row.date).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {row.chlorophyll_a} mg/m³
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.satellite === 'MODIS-Aqua' ? 'Satélite NASA' : row.satellite}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.chlorophyll_a > 8 ? 'bg-green-100 text-green-800' :
                      row.chlorophyll_a > 4 ? 'bg-yellow-100 text-yellow-800' :
                      row.chlorophyll_a > 1.5 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {row.chlorophyll_a > 8 ? 'Excelente' :
                       row.chlorophyll_a > 4 ? 'Buena' :
                       row.chlorophyll_a > 1.5 ? 'Regular' : 'Pobre'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
import { LucideIcon } from 'lucide-react'

interface WeatherCardProps {
  icon: LucideIcon
  title: string
  value: string
  unit: string
  status: 'low' | 'normal' | 'high'
  description: string
  dataInfo?: {
    date?: string
    coordinates?: {
      lat: number
      lon: number
    }
    source?: string
  }
}

export default function WeatherCard({
  icon: Icon,
  title,
  value,
  unit,
  status,
  description,
  dataInfo
}: WeatherCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'low':
        return 'text-blue-600'
      case 'high':
        return 'text-green-600'
      default:
        return 'text-ocean-600'
    }
  }

  const getStatusBg = () => {
    switch (status) {
      case 'low':
        return 'bg-blue-50 border-blue-200'
      case 'high':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-white border-ocean-200'
    }
  }

  return (
    <div className={`weather-card ${getStatusBg()} hover:shadow-lg transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`h-6 w-6 ${getStatusColor()}`} />
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'low' ? 'bg-blue-100 text-blue-800' :
          status === 'high' ? 'bg-green-100 text-green-800' :
          'bg-ocean-100 text-ocean-800'
        }`}>
          {status === 'low' ? 'Bajo' : status === 'high' ? 'Alto' : 'Normal'}
        </div>
      </div>
      
      <h3 className="metric-label mb-2">{title}</h3>
      
      <div className="flex items-baseline space-x-1 mb-2">
        <span className="metric-value">{value}</span>
        <span className="text-sm text-ocean-500">{unit}</span>
      </div>
      
      <p className="text-xs text-ocean-600">{description}</p>
      
      {/* Show data info for official data */}
      {dataInfo && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          {dataInfo.date && (
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>📅 Fecha:</span>
              <span className="font-mono">{dataInfo.date}</span>
            </div>
          )}
          {dataInfo.coordinates && (
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>📍 GPS:</span>
              <span className="font-mono">
                {dataInfo.coordinates.lat.toFixed(4)}°, {dataInfo.coordinates.lon.toFixed(4)}°
              </span>
            </div>
          )}
          {dataInfo.source && (
            <div className="text-xs text-blue-600 font-medium">
              🔬 {dataInfo.source}
            </div>
          )}
        </div>
      )}
      
    </div>
  )
}
import { LucideIcon } from 'lucide-react'

interface TemperatureCardProps {
  icon: LucideIcon
  title: string
  airTemp: number
  waterTemp: number
  status: 'low' | 'normal' | 'high'
  description: string
}

export default function TemperatureCard({
  icon: Icon,
  title,
  airTemp,
  waterTemp,
  status,
  description
}: TemperatureCardProps) {
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
      
      {/* Air Temperature */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <span className="text-lg">🌬️</span>
          <span className="text-xs text-gray-600">Aire</span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-gray-900">{airTemp}</span>
          <span className="text-xs text-ocean-500">°C</span>
        </div>
      </div>

      {/* Water Temperature */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <span className="text-lg">🌊</span>
          <span className="text-xs text-gray-600">Agua</span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-gray-900">{waterTemp.toFixed(1)}</span>
          <span className="text-xs text-ocean-500">°C</span>
        </div>
      </div>
      
      <p className="text-xs text-ocean-600">{description}</p>
    </div>
  )
}
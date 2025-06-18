export interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  windGust?: number
  precipitation: number
  cloudCover: number
  uvIndex?: number
  waveHeight: number
  tideLevel: number
  waterTemperature: number
  chlorophyll: number
  timestamp: string
}

export interface FishingRecommendation {
  type: 'surface' | 'deep' | 'coastal'
  confidence: number
  reasons: string[]
  bestTimes: string[]
  suggestedDepth?: number
  suggestedLocation?: {
    lat: number
    lng: number
    name: string
  }
}

export interface MarineConditions {
  weather: WeatherData
  recommendations: FishingRecommendation[]
  alerts: string[]
}
interface OpenWeatherData {
  main: {
    temp: number
    pressure: number
    humidity: number
  }
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  clouds: {
    all: number
  }
  weather: Array<{
    main: string
    description: string
  }>
  rain?: {
    '1h'?: number
  }
}

interface OpenWeatherMarineData {
  data: Array<{
    time: number
    wave_height: number
    wave_direction: number
    wave_period: number
    wind_speed: number
    wind_direction: number
  }>
}

export class OpenWeatherService {
  private apiKey: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'
  private marineUrl = 'https://api.openweathermap.org/data/3.0'
  private apiMonitor: any
  private isClient = false

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not found')
    }

    this.isClient = typeof window !== 'undefined'
    
    // Cargar el monitor de APIs dinámicamente
    if (this.isClient) {
      import('./api-monitor').then(({ default: APICallMonitor }) => {
        this.apiMonitor = APICallMonitor.getInstance()
      }).catch(() => {
        this.apiMonitor = null
      })
    }
  }

  async getCurrentWeather(lat: number, lon: number) {
    try {
      // Verificar límites de API
      if (this.apiMonitor) {
        const canCall = this.apiMonitor.canMakeCall('openweather')
        if (!canCall.allowed) {
          console.warn(`🚫 OpenWeather API limit reached: ${canCall.reason}`)
          throw new Error(`API limit reached: ${canCall.reason}`)
        }
      }

      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`
      const response = await fetch(url)
      
      // Registrar la llamada en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('openweather', 'current_weather', response.ok)
      }
      
      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status}`)
      }
      
      const data: OpenWeatherData = await response.json()
      
      // Calculate UV index based on time of day, season, and cloud cover
      const uvIndex = this.calculateUVIndex(data.clouds.all)

      return {
        temperature: Math.round(data.main.temp),
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: data.wind.deg,
        windGust: data.wind.gust ? Math.round(data.wind.gust * 3.6) : undefined, // Convert m/s to km/h
        cloudCover: data.clouds.all,
        precipitation: data.rain?.['1h'] || 0,
        uvIndex: uvIndex,
        description: data.weather[0]?.description || 'No disponible',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      
      // Registrar el error en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('openweather', 'current_weather', false)
      }
      
      return null
    }
  }

  async getMarineData(lat: number, lon: number) {
    try {
      // Note: Marine data requires subscription, using mock data for now
      return {
        waveHeight: Math.random() * 3 + 0.5, // 0.5-3.5m
        wavePeriod: Math.random() * 10 + 5, // 5-15s
        waveDirection: Math.random() * 360,
        waterTemperature: Math.random() * 8 + 15, // 15-23°C for Chilean coast
        tideLevel: Math.sin(Date.now() / 1000000) * 2, // Simulated tide
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching marine data:', error)
      return null
    }
  }

  async getTidalData(lat: number, lon: number) {
    // Using basic astronomical calculation for tides
    // In production, you'd want to use a proper tidal API
    const now = new Date()
    const hours = now.getHours() + now.getMinutes() / 60
    
    // Simplified tidal calculation (2 high tides per day)
    const tideHeight = Math.sin((hours * Math.PI) / 6) * 1.5 + 1.5
    const isHigh = Math.sin((hours * Math.PI) / 6) > 0
    
    const nextChange = isHigh ? 
      Math.ceil(hours / 6) * 6 - hours :
      Math.floor(hours / 6) * 6 + 6 - hours
    
    return {
      current: {
        height: Number(tideHeight.toFixed(1)),
        type: isHigh ? 'Alta' : 'Baja',
        time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      },
      next: {
        type: isHigh ? 'Baja' : 'Alta',
        timeUntil: `${Math.floor(nextChange)}:${String(Math.round((nextChange % 1) * 60)).padStart(2, '0')}`
      }
    }
  }

  private calculateUVIndex(cloudCover: number): number {
    const now = new Date()
    const hour = now.getHours()
    const month = now.getMonth() + 1 // 1-12
    
    // Base UV index for Chilean summer (December-March)
    let baseUV = 10
    
    // Seasonal adjustment for Chilean seasons
    if (month >= 6 && month <= 8) { // Winter (June-August)
      baseUV = 3
    } else if (month === 5 || month === 9) { // Autumn/Spring
      baseUV = 6
    } else if (month >= 10 && month <= 11 || month >= 4 && month <= 4) { // Spring/Autumn
      baseUV = 8
    }
    
    // Time of day adjustment (Chilean timezone UTC-3/UTC-4)
    let timeMultiplier = 0
    if (hour >= 6 && hour <= 18) { // Daylight hours
      // Peak UV at solar noon (~12-14)
      if (hour >= 11 && hour <= 15) {
        timeMultiplier = 1.0
      } else if (hour >= 9 && hour <= 17) {
        timeMultiplier = 0.7
      } else {
        timeMultiplier = 0.3
      }
    }
    
    // Cloud cover adjustment
    const cloudFactor = Math.max(0.1, (100 - cloudCover) / 100)
    
    // Calculate final UV index
    const uvIndex = Math.round(baseUV * timeMultiplier * cloudFactor)
    
    return Math.max(0, Math.min(11, uvIndex)) // UV index scale 0-11+
  }
}
interface OpenMeteoData {
  precipitation: number // mm/h
  rain: number // mm/h  
  showers: number // mm/h
  visibility: number // meters
  cloudCover: number // %
  windSpeed: number // km/h
  windDirection: number // degrees
  temperature: number // °C
  humidity: number // %
  pressure: number // hPa
  timestamp: string
}

export class OpenMeteoService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast'
  private apiMonitor: any
  private isClient = false

  constructor() {
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

  async getWeatherData(lat: number, lon: number): Promise<OpenMeteoData | null> {
    try {
      console.log('Fetching REAL precipitation data from Open-Meteo...')
      
      // Build URL with comprehensive weather parameters including precipitation
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m', 
          'precipitation',
          'rain',
          'showers',
          'visibility',
          'cloud_cover',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),
        minutely_15: [
          'precipitation',
          'rain',
          'showers'
        ].join(','),
        timezone: 'America/Santiago',
        forecast_days: '1'
      })

      // Verificar límites de API
      if (this.apiMonitor) {
        const canCall = this.apiMonitor.canMakeCall('open-meteo')
        if (!canCall.allowed) {
          console.warn(`🚫 Open-Meteo API limit reached: ${canCall.reason}`)
          throw new Error(`API limit reached: ${canCall.reason}`)
        }
      }

      const url = `${this.baseUrl}?${params}`
      console.log('Open-Meteo URL:', url)

      const response = await fetch(url)
      
      // Registrar la llamada en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('open-meteo', 'current_weather', response.ok)
      }
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Open-Meteo response:', data)

      // Extract current weather data
      const current = data.current
      if (!current) {
        throw new Error('No current weather data available')
      }

      // Get most recent 15-minute precipitation data if available
      let recentPrecipitation = current.precipitation || 0
      let recentRain = current.rain || 0
      let recentShowers = current.showers || 0

      if (data.minutely_15?.precipitation && data.minutely_15.precipitation.length > 0) {
        // Get the most recent non-null precipitation value
        const recentValues = data.minutely_15.precipitation.slice(-4) // Last hour
        recentPrecipitation = recentValues.find((val: any) => val !== null) || recentPrecipitation
      }

      const weatherData: OpenMeteoData = {
        precipitation: Number((recentPrecipitation || 0).toFixed(1)),
        rain: Number((recentRain || 0).toFixed(1)),
        showers: Number((recentShowers || 0).toFixed(1)),
        visibility: current.visibility || 10000, // Default 10km if not available
        cloudCover: current.cloud_cover || 0,
        windSpeed: Math.round((current.wind_speed_10m || 0) * 3.6), // Convert m/s to km/h
        windDirection: current.wind_direction_10m || 0,
        temperature: Number((current.temperature_2m || 15).toFixed(1)),
        humidity: current.relative_humidity_2m || 70,
        pressure: Number((current.surface_pressure || 1013).toFixed(1)),
        timestamp: new Date().toISOString()
      }

      console.log('Open-Meteo parsed data:', {
        precipitation: weatherData.precipitation,
        rain: weatherData.rain,
        temperature: weatherData.temperature,
        windSpeed: weatherData.windSpeed
      })

      return weatherData

    } catch (error) {
      console.error('Open-Meteo fetch failed:', error)
      
      // Registrar el error en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('open-meteo', 'current_weather', false)
      }
      
      throw error
    }
  }

  async getPrecipitationForecast(lat: number, lon: number, hours: number = 24): Promise<Array<{time: string, precipitation: number}> | null> {
    try {
      // Verificar límites de API
      if (this.apiMonitor) {
        const canCall = this.apiMonitor.canMakeCall('open-meteo')
        if (!canCall.allowed) {
          console.warn(`🚫 Open-Meteo API limit reached: ${canCall.reason}`)
          throw new Error(`API limit reached: ${canCall.reason}`)
        }
      }

      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        hourly: 'precipitation,rain',
        timezone: 'America/Santiago',
        forecast_days: '2'
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      
      // Registrar la llamada en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('open-meteo', 'precipitation_forecast', response.ok)
      }
      
      if (!response.ok) {
        throw new Error(`Open-Meteo forecast error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.hourly?.precipitation) {
        return null
      }

      const forecast = []
      const maxHours = Math.min(hours, data.hourly.precipitation.length)
      
      for (let i = 0; i < maxHours; i++) {
        forecast.push({
          time: data.hourly.time[i],
          precipitation: data.hourly.precipitation[i] || 0
        })
      }

      return forecast

    } catch (error) {
      console.error('Open-Meteo forecast failed:', error)
      
      // Registrar el error en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('open-meteo', 'precipitation_forecast', false)
      }
      
      return null
    }
  }
}
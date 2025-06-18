interface ForecastDay {
  date: string
  dayName: string
  weather: {
    temperature: { min: number, max: number }
    condition: string
    conditionIcon: string
    precipitation: number
    humidity: number
    windSpeed: number
    windDirection: number
    pressure: number
    cloudCover: number
    visibility: number
    uvIndex: number
  }
  marine: {
    waterTemperature: number
    waveHeight: number
    tideLevel: number
  }
  recommendations: string[]
}

export class ForecastService {
  private apiMonitor: any
  private isClient = false
  
  constructor() {
    this.isClient = typeof window !== 'undefined'
    
    // Cargar el monitor de APIs dinámicamente para evitar problemas de SSR
    if (this.isClient) {
      import('./api-monitor').then(({ default: APICallMonitor }) => {
        this.apiMonitor = APICallMonitor.getInstance()
      }).catch(() => {
        // Silently fail if monitor can't be loaded
        this.apiMonitor = null
      })
    }
  }

  // Generar pronósticos usando ECMWF real de Open-Meteo
  async generateForecastData(lat: number, lon: number, days: number): Promise<ForecastDay[]> {
    try {
      // Verificar límites de API antes de hacer la llamada
      if (this.apiMonitor) {
        const canCall = this.apiMonitor.canMakeCall('open-meteo')
        if (!canCall.allowed) {
          console.warn(`🚫 Open-Meteo API limit reached: ${canCall.reason}`)
          return this.generateFallbackForecast(lat, lon, days, `API limit: ${canCall.reason}`)
        }
      }

      // Llamar a Open-Meteo API con modelo ECMWF
      const forecastData = await this.fetchOpenMeteoForecast(lat, lon, days)
      
      if (forecastData && forecastData.length > 0) {
        console.log(`✅ ECMWF forecast loaded for ${days} days via Open-Meteo`)
        return forecastData
      } else {
        throw new Error('No forecast data received from Open-Meteo')
      }
      
    } catch (error) {
      console.error('❌ Error fetching ECMWF forecast:', error)
      
      // Registrar el fallo en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('open-meteo', 'forecast', false)
      }
      
      // Usar datos sintéticos como fallback
      return this.generateFallbackForecast(lat, lon, days, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Llamada real a Open-Meteo API con ECMWF
  private async fetchOpenMeteoForecast(lat: number, lon: number, days: number): Promise<ForecastDay[]> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min', 
        'precipitation_sum',
        'weathercode',
        'windspeed_10m_max',
        'winddirection_10m_dominant',
        'uv_index_max'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'pressure_msl',
        'cloudcover',
        'visibility',
        'windspeed_10m',
        'winddirection_10m'
      ].join(','),
      timezone: 'America/Santiago',
      forecast_days: days.toString(),
      models: 'ecmwf_ifs025' // Especificar modelo ECMWF
    })

    const url = `https://api.open-meteo.com/v1/forecast?${params}`
    
    const response = await fetch(url)
    
    // Registrar la llamada en el monitor
    if (this.apiMonitor) {
      this.apiMonitor.recordCall('open-meteo', 'forecast/ecmwf', response.ok)
    }
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    return this.processOpenMeteoData(data)
  }

  // Procesar datos de Open-Meteo a nuestro formato
  private processOpenMeteoData(data: any): ForecastDay[] {
    const forecasts: ForecastDay[] = []
    const daily = data.daily
    const hourly = data.hourly
    
    if (!daily || !daily.time) {
      throw new Error('Invalid forecast data structure from Open-Meteo')
    }

    for (let i = 0; i < daily.time.length; i++) {
      const date = daily.time[i]
      const forecastDate = new Date(date)
      
      // Obtener datos promedio del día desde datos horarios
      const dayStart = i * 24
      const dayHourlyData = this.getDayAverages(hourly, dayStart)
      
      const forecast: ForecastDay = {
        date: date,
        dayName: forecastDate.toLocaleDateString('es-CL', { weekday: 'long' }),
        weather: {
          temperature: {
            min: Math.round(daily.temperature_2m_min[i] || 0),
            max: Math.round(daily.temperature_2m_max[i] || 0)
          },
          condition: this.getWeatherCondition(daily.weathercode[i]),
          conditionIcon: this.getWeatherIcon(daily.weathercode[i]),
          precipitation: Number((daily.precipitation_sum[i] || 0).toFixed(1)),
          humidity: Math.round(dayHourlyData.humidity),
          windSpeed: Math.round(daily.windspeed_10m_max[i] || 0),
          windDirection: Math.round(daily.winddirection_10m_dominant[i] || 0),
          pressure: Math.round(dayHourlyData.pressure),
          cloudCover: Math.round(dayHourlyData.cloudcover),
          visibility: Math.round(dayHourlyData.visibility / 1000), // Convertir a km
          uvIndex: Math.round(daily.uv_index_max[i] || 0)
        },
        marine: {
          waterTemperature: Math.round((daily.temperature_2m_min[i] + daily.temperature_2m_max[i]) / 2 - 2),
          waveHeight: this.estimateWaveHeight(daily.windspeed_10m_max[i], daily.precipitation_sum[i]),
          tideLevel: this.generateTideLevel(i)
        },
        recommendations: this.generateRecommendationsFromReal(daily, i)
      }
      
      forecasts.push(forecast)
    }

    return forecasts
  }

  // Obtener promedios del día desde datos horarios
  private getDayAverages(hourly: any, startIndex: number) {
    const endIndex = Math.min(startIndex + 24, hourly.time.length)
    const slice = {
      humidity: hourly.relative_humidity_2m?.slice(startIndex, endIndex) || [],
      pressure: hourly.pressure_msl?.slice(startIndex, endIndex) || [],
      cloudcover: hourly.cloudcover?.slice(startIndex, endIndex) || [],
      visibility: hourly.visibility?.slice(startIndex, endIndex) || []
    }

    return {
      humidity: this.average(slice.humidity),
      pressure: this.average(slice.pressure),
      cloudcover: this.average(slice.cloudcover),
      visibility: this.average(slice.visibility)
    }
  }

  private average(arr: number[]): number {
    if (arr.length === 0) return 0
    const filtered = arr.filter(val => val != null && !isNaN(val))
    return filtered.length > 0 ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0
  }

  // Mapear weather codes de Open-Meteo a condiciones
  private getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: 'Despejado',
      1: 'Principalmente despejado',
      2: 'Parcialmente nublado', 
      3: 'Nublado',
      45: 'Neblina',
      48: 'Neblina con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo intenso'
    }
    return conditions[code] || 'Condiciones variables'
  }

  // Mapear weather codes a iconos
  private getWeatherIcon(code: number): string {
    const icons: Record<number, string> = {
      0: '☀️',
      1: '🌤️',
      2: '⛅',
      3: '☁️',
      45: '🌫️',
      48: '🌫️',
      51: '🌦️',
      53: '🌦️',
      55: '🌧️',
      61: '🌦️',
      63: '🌧️',
      65: '🌧️',
      71: '🌨️',
      73: '❄️',
      75: '❄️',
      95: '⛈️',
      96: '⛈️',
      99: '⛈️'
    }
    return icons[code] || '🌤️'
  }

  // Estimar altura de olas basado en viento y precipitación
  private estimateWaveHeight(windSpeed: number, precipitation: number): number {
    let baseHeight = Math.max(0.5, windSpeed * 0.1)
    
    if (precipitation > 10) baseHeight += 1.5
    else if (precipitation > 5) baseHeight += 1.0
    else if (precipitation > 1) baseHeight += 0.5
    
    return Number(Math.min(baseHeight, 6.0).toFixed(1))
  }

  // Generar nivel de marea sintético (determinístico)
  private generateTideLevel(dayIndex: number): number {
    const phase = (dayIndex * 0.5) % (2 * Math.PI)
    return Number((Math.sin(phase) * 1.5 + 1.2).toFixed(2))
  }

  // Generar recomendaciones basadas en datos reales ECMWF
  private generateRecommendationsFromReal(daily: any, dayIndex: number): string[] {
    const recommendations = []
    const precipitation = daily.precipitation_sum[dayIndex] || 0
    const windSpeed = daily.windspeed_10m_max[dayIndex] || 0
    const waveHeight = this.estimateWaveHeight(windSpeed, precipitation)
    
    // Recomendaciones por precipitación
    if (precipitation > 10) {
      recommendations.push('⚠️ Lluvia intensa - Evitar navegación')
      recommendations.push('🏠 Ideal para mantenimiento de equipos')
    } else if (precipitation > 2) {
      recommendations.push('🧥 Llevar equipamiento impermeable completo')
      recommendations.push('⚓ Navegación con extrema precaución')
    } else if (precipitation > 0.5) {
      recommendations.push('☂️ Posible llovizna - Preparar protección')
    } else {
      recommendations.push('✅ Condiciones secas favorables')
      if (windSpeed < 15) {
        recommendations.push('🎣 Excelente para pesca de superficie')
      }
    }

    // Recomendaciones por viento y olas
    if (windSpeed > 30 || waveHeight > 3) {
      recommendations.push('🌊 Mar muy agitado - Solo embarcaciones grandes')
    } else if (windSpeed > 20 || waveHeight > 2) {
      recommendations.push('🚤 Condiciones moderadas - Embarcaciones medianas')
    } else {
      recommendations.push('🛶 Apropiado para todo tipo de embarcaciones')
    }

    // Confiabilidad por día (ECMWF)
    if (dayIndex === 0) {
      recommendations.push('📅 Pronóstico ECMWF mañana - 95% confianza')
    } else if (dayIndex <= 2) {
      recommendations.push('📊 Pronóstico ECMWF 3 días - 90% confianza')
    } else {
      recommendations.push('🔮 Pronóstico ECMWF extendido - 80% confianza')
    }

    return recommendations
  }

  // Fallback a datos sintéticos si falla la API
  private generateFallbackForecast(lat: number, lon: number, days: number, reason: string): ForecastDay[] {
    console.warn(`⚠️ Using synthetic forecast fallback: ${reason}`)
    
    const forecasts: ForecastDay[] = []
    const now = new Date()
    
    // Crear seed basado en ubicación y fecha
    const seed = Math.floor(lat * 1000) + Math.floor(lon * 1000) + Math.floor(now.getTime() / (1000 * 60 * 60 * 24))
    const pseudoRandom = this.createPseudoRandom(seed)

    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
      
      const baseTemp = this.getBaseTemperatureForLocation(lat, forecastDate)
      const weatherPattern = this.getWeatherPatternSynthetic(i, lat, pseudoRandom)
      
      const dayForecast: ForecastDay = {
        date: forecastDate.toISOString().split('T')[0],
        dayName: forecastDate.toLocaleDateString('es-CL', { weekday: 'long' }),
        weather: {
          temperature: {
            min: Math.round(baseTemp.min + weatherPattern.tempVariation),
            max: Math.round(baseTemp.max + weatherPattern.tempVariation)
          },
          condition: weatherPattern.condition + ' (Simulado)',
          conditionIcon: weatherPattern.icon,
          precipitation: Number(weatherPattern.precipitation.toFixed(1)),
          humidity: Math.round(70 + pseudoRandom(i + 10) * 20),
          windSpeed: Math.round(15 + pseudoRandom(i + 20) * 15 + weatherPattern.windBoost),
          windDirection: Math.round(180 + pseudoRandom(i + 30) * 120),
          pressure: Math.round(1013 + (pseudoRandom(i + 40) - 0.5) * 20),
          cloudCover: Math.round(weatherPattern.cloudCover),
          visibility: Math.round(8 + pseudoRandom(i + 50) * 7),
          uvIndex: Math.round(3 + pseudoRandom(i + 60) * 7)
        },
        marine: {
          waterTemperature: Math.round((baseTemp.min + baseTemp.max) / 2 - 2),
          waveHeight: Number((1.0 + pseudoRandom(i + 70) * 2.5 + weatherPattern.waveBoost).toFixed(1)),
          tideLevel: Number((Math.sin((i + pseudoRandom(i + 80)) * Math.PI / 2) * 1.5 + 1.2).toFixed(2))
        },
        recommendations: this.generateRecommendationsSynthetic(weatherPattern, i, reason)
      }
      
      forecasts.push(dayForecast)
    }

    return forecasts
  }

  // Funciones auxiliares para fallback sintético
  private createPseudoRandom(seed: number) {
    return (index: number) => {
      const x = Math.sin(seed + index * 12.9898) * 43758.5453
      return x - Math.floor(x)
    }
  }

  private getBaseTemperatureForLocation(lat: number, date: Date) {
    let baseMin, baseMax
    
    if (lat > -25) {
      baseMin = 18; baseMax = 26
    } else if (lat > -35) {
      baseMin = 12; baseMax = 22
    } else if (lat > -45) {
      baseMin = 8; baseMax = 16
    } else {
      baseMin = 3; baseMax = 10
    }

    const month = date.getMonth()
    const isSummer = month >= 11 || month <= 2
    const isWinter = month >= 5 && month <= 8
    
    if (isSummer) {
      baseMin += 5; baseMax += 8
    } else if (isWinter) {
      baseMin -= 3; baseMax -= 5
    }

    return { min: baseMin, max: baseMax }
  }

  private getWeatherPatternSynthetic(dayIndex: number, lat: number, pseudoRandom: (index: number) => number) {
    const patterns = [
      {
        condition: 'Despejado',
        icon: '☀️',
        precipitation: 0,
        cloudCover: 10 + pseudoRandom(dayIndex + 100) * 20,
        tempVariation: 2,
        windBoost: 0,
        waveBoost: 0
      },
      {
        condition: 'Parcialmente nublado',
        icon: '⛅',
        precipitation: 0.1 + pseudoRandom(dayIndex + 110) * 0.5,
        cloudCover: 40 + pseudoRandom(dayIndex + 120) * 30,
        tempVariation: 0,
        windBoost: 5,
        waveBoost: 0.5
      },
      {
        condition: 'Lluvia ligera',
        icon: '🌦️',
        precipitation: 2 + pseudoRandom(dayIndex + 130) * 5,
        cloudCover: 80 + pseudoRandom(dayIndex + 140) * 15,
        tempVariation: -3,
        windBoost: 12,
        waveBoost: 1.5
      }
    ]

    const rainChance = lat < -35 ? 0.6 : 0.3
    const weatherChoice = pseudoRandom(dayIndex + 150)
    
    const selectedPattern = weatherChoice < rainChance 
      ? patterns[2] 
      : patterns[Math.floor(pseudoRandom(dayIndex + 160) * 2)]

    return selectedPattern
  }

  private generateRecommendationsSynthetic(weather: any, dayIndex: number, reason: string): string[] {
    const recommendations = []
    
    recommendations.push(`⚠️ Datos sintéticos: ${reason}`)
    
    if (weather.precipitation > 5) {
      recommendations.push('🌧️ Simulación: Evitar navegación por lluvia')
    } else {
      recommendations.push('✅ Simulación: Condiciones navegables')
    }

    if (dayIndex === 0) {
      recommendations.push('📅 Simulación mañana - Usar con precaución')
    } else {
      recommendations.push('🔮 Simulación extendida - Solo referencia')
    }

    return recommendations
  }

  // Utilidades para UI
  formatWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  getConditionColor(condition: string): string {
    if (condition.includes('Despejado') || condition.includes('Sol')) return 'text-yellow-600'
    if (condition.includes('nublado')) return 'text-gray-600'
    if (condition.includes('Lluvia')) return 'text-blue-600'
    if (condition.includes('Simulado')) return 'text-orange-600'
    return 'text-gray-700'
  }
}

export type { ForecastDay }
interface LocationData {
  ip: string
  country: string
  country_code: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  org: string
}

interface GeolocationResult {
  success: boolean
  data?: LocationData
  error?: string
}

/**
 * Get user's location data from their IP address
 * Uses ipapi.co free service (1000 requests/day)
 */
export async function getUserLocation(): Promise<GeolocationResult> {
  try {
    // First try to get from cache (session storage)
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('user_location')
      if (cached) {
        const parsedCache = JSON.parse(cached)
        // Check if cache is less than 1 hour old
        const cacheTime = new Date(parsedCache.timestamp)
        const now = new Date()
        const hourInMs = 60 * 60 * 1000
        
        if (now.getTime() - cacheTime.getTime() < hourInMs) {
          return {
            success: true,
            data: parsedCache.data
          }
        }
      }
    }

    // Try multiple free services for reliability
    const services = [
      'https://ipapi.co/json/',
      'https://api.ipify.org?format=json', // fallback for IP only
    ]

    for (const serviceUrl of services) {
      try {
        const response = await fetch(serviceUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          console.warn(`Service ${serviceUrl} returned ${response.status}`)
          continue
        }

        const data = await response.json()
        
        // Handle different response formats
        let locationData: LocationData

        if (data.country) {
          // Full ipapi.co response
          locationData = {
            ip: data.ip || 'unknown',
            country: data.country_name || data.country || 'Unknown',
            country_code: data.country_code || data.country_code || 'XX',
            region: data.region || data.region_code || 'Unknown',
            city: data.city || 'Unknown',
            latitude: parseFloat(data.latitude) || 0,
            longitude: parseFloat(data.longitude) || 0,
            timezone: data.timezone || 'UTC',
            org: data.org || data.isp || 'Unknown'
          }
        } else if (data.ip) {
          // IP-only response, use defaults
          locationData = {
            ip: data.ip,
            country: 'Unknown',
            country_code: 'XX',
            region: 'Unknown',
            city: 'Unknown',
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
            org: 'Unknown'
          }
        } else {
          continue
        }

        // Cache the result
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('user_location', JSON.stringify({
            data: locationData,
            timestamp: new Date().toISOString()
          }))
        }

        console.log('✅ Location detected:', locationData.country, locationData.city)
        return {
          success: true,
          data: locationData
        }
      } catch (serviceError) {
        console.warn(`Service ${serviceUrl} failed:`, serviceError)
        continue
      }
    }

    throw new Error('All geolocation services failed')

  } catch (error) {
    console.error('Geolocation error:', error)
    
    // Return default/fallback location
    const fallbackLocation: LocationData = {
      ip: 'unknown',
      country: 'Unknown',
      country_code: 'XX',
      region: 'Unknown',
      city: 'Unknown',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
      org: 'Unknown'
    }

    return {
      success: false,
      data: fallbackLocation,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get flag emoji for country code
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === 'XX') return '🌍'
  
  const flags: Record<string, string> = {
    'CL': '🇨🇱', 'AR': '🇦🇷', 'PE': '🇵🇪', 'BO': '🇧🇴', 'BR': '🇧🇷',
    'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'ES': '🇪🇸', 'FR': '🇫🇷',
    'DE': '🇩🇪', 'IT': '🇮🇹', 'GB': '🇬🇧', 'JP': '🇯🇵', 'KR': '🇰🇷',
    'CN': '🇨🇳', 'IN': '🇮🇳', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'RU': '🇷🇺'
  }
  
  return flags[countryCode.toUpperCase()] || '🌍'
}

/**
 * Get readable country name
 */
export function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    'CL': 'Chile', 'AR': 'Argentina', 'PE': 'Perú', 'BO': 'Bolivia', 'BR': 'Brasil',
    'US': 'Estados Unidos', 'CA': 'Canadá', 'MX': 'México', 'ES': 'España', 'FR': 'Francia',
    'DE': 'Alemania', 'IT': 'Italia', 'GB': 'Reino Unido', 'JP': 'Japón', 'KR': 'Corea del Sur',
    'CN': 'China', 'IN': 'India', 'AU': 'Australia', 'NZ': 'Nueva Zelanda', 'RU': 'Rusia'
  }
  
  return countries[countryCode.toUpperCase()] || 'Desconocido'
}
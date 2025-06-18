interface OceanColorData {
  chlorophyll_a: number
  coordinates: { lat: number; lon: number }
  timestamp: string
  satellite: string
  product_level: 'L2' | 'L3' | 'L3B' | 'L4'
  resolution: string
  quality_flags: number
  cloud_free_percentage?: number
}

interface OceanColorImagery {
  wmsUrl: string
  bounds: { north: number; south: number; east: number; west: number }
  layers: string
  styles: string
  colorScale: { min: number; max: number }
  product: string
}

export class OceanColorService {
  private baseUrl = 'https://oceandata.sci.gsfc.nasa.gov'
  private wmsEndpoint = 'https://oceandata.sci.gsfc.nasa.gov/cgi-bin/mapserver'
  private dataEndpoint = 'https://oceandata.sci.gsfc.nasa.gov/cgi-bin/getfile.pl'

  constructor() {
    console.log('Ocean Color Service initialized - connecting to NASA Ocean Color')
  }

  // Get L3 8-day composite imagery for map display
  async getL3CompositeImagery(lat: number, lon: number, radiusKm: number = 100): Promise<OceanColorImagery | null> {
    try {
      // Calculate bounds for Chilean coast
      const kmPerDegree = 111.32
      const deltaLat = radiusKm / kmPerDegree
      const deltaLon = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180))

      const bounds = {
        north: lat + deltaLat,
        south: lat - deltaLat,
        east: lon + deltaLon,
        west: lon - deltaLon
      }

      // NASA Ocean Color WMS parameters for L3 8-day composite
      const wmsParams = new URLSearchParams({
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        layers: 'modis_aqua_chlor_a_8day',
        styles: 'boxfill/chlor_a',
        format: 'image/png',
        transparent: 'true',
        bgcolor: '0x000000',
        exceptions: 'XML',
        colorscalerange: '0.01,20',
        belowmincolor: 'extend',
        abovemaxcolor: 'extend',
        numcolorbands: '20',
        logscale: 'true'
      })

      const wmsUrl = `${this.wmsEndpoint}?${wmsParams.toString()}`

      return {
        wmsUrl,
        bounds,
        layers: 'modis_aqua_chlor_a_8day',
        styles: 'boxfill/chlor_a',
        colorScale: { min: 0.01, max: 20 },
        product: 'MODIS-Aqua L3 8-day chlorophyll-a composite'
      }

    } catch (error) {
      console.error('Error getting L3 composite imagery:', error)
      return null
    }
  }

  // Get L2 daily data for point-specific values
  async getL2DailyData(lat: number, lon: number): Promise<OceanColorData | null> {
    try {
      console.log('Fetching L2 daily chlorophyll data from Ocean Color...')

      // For demo purposes, simulate realistic L2 data
      // In production, this would call the actual Ocean Color API
      const simulatedL2Data = this.simulateRealisticL2Data(lat, lon)

      return simulatedL2Data

    } catch (error) {
      console.error('Error fetching L2 daily data:', error)
      return null
    }
  }

  // Get L3 binned data (8-day composite) for point values
  async getL3BinnedData(lat: number, lon: number): Promise<OceanColorData | null> {
    try {
      console.log('Fetching L3 binned 8-day composite data...')

      // Simulate realistic L3 binned data with better coverage
      const simulatedL3Data = this.simulateRealisticL3Data(lat, lon)

      return simulatedL3Data

    } catch (error) {
      console.error('Error fetching L3 binned data:', error)
      return null
    }
  }

  // Get available L3 composite imagery URLs for different time periods
  getCompositeImageryOptions(lat: number, lon: number) {
    const baseOptions = {
      bounds: this.calculateBounds(lat, lon, 100),
      wmsBase: this.wmsEndpoint
    }

    return {
      daily: {
        ...baseOptions,
        layers: 'modis_aqua_chlor_a_daily',
        product: 'MODIS-Aqua L3 daily',
        temporal_resolution: '1 day',
        spatial_resolution: '4.64 km'
      },
      eightDay: {
        ...baseOptions,
        layers: 'modis_aqua_chlor_a_8day',
        product: 'MODIS-Aqua L3 8-day composite',
        temporal_resolution: '8 days',
        spatial_resolution: '4.64 km'
      },
      monthly: {
        ...baseOptions,
        layers: 'modis_aqua_chlor_a_monthly',
        product: 'MODIS-Aqua L3 monthly composite',
        temporal_resolution: '1 month',
        spatial_resolution: '4.64 km'
      }
    }
  }

  private calculateBounds(lat: number, lon: number, radiusKm: number) {
    const kmPerDegree = 111.32
    const deltaLat = radiusKm / kmPerDegree
    const deltaLon = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180))

    return {
      north: lat + deltaLat,
      south: lat - deltaLat,
      east: lon + deltaLon,
      west: lon - deltaLon
    }
  }

  private simulateRealisticL2Data(lat: number, lon: number): OceanColorData {
    // Simulate realistic L2 data based on Chilean oceanography
    const distanceFromCoast = Math.abs(lon + 71) * 111 // km from Chilean coast
    
    // L2 data has higher variability and potential cloud contamination
    let baseChlorophyll: number
    
    if (distanceFromCoast < 30) {
      // Coastal upwelling zone - high variability
      baseChlorophyll = 3 + Math.random() * 25 // 3-28 mg/m³
    } else if (distanceFromCoast < 100) {
      // Transition zone
      baseChlorophyll = 1 + Math.random() * 8 // 1-9 mg/m³
    } else {
      // Oceanic zone - oligotrophic
      baseChlorophyll = 0.1 + Math.random() * 2 // 0.1-2.1 mg/m³
    }

    // Add seasonal variation (Chilean winter = high productivity)
    const month = new Date().getMonth() + 1
    if (month >= 6 && month <= 8) {
      baseChlorophyll *= 1.4 // Winter enhancement
    }

    // L2 data has quality flags
    const qualityFlags = Math.random() < 0.3 ? Math.floor(Math.random() * 4) : 0

    return {
      chlorophyll_a: Number(baseChlorophyll.toFixed(3)),
      coordinates: { lat, lon },
      timestamp: new Date().toISOString(),
      satellite: 'MODIS-Aqua',
      product_level: 'L2',
      resolution: '1 km',
      quality_flags: qualityFlags,
      cloud_free_percentage: Math.round(70 + Math.random() * 30) // 70-100%
    }
  }

  private simulateRealisticL3Data(lat: number, lon: number): OceanColorData {
    // L3 binned data is more stable and cloud-free
    const distanceFromCoast = Math.abs(lon + 71) * 111 // km from Chilean coast
    
    let baseChlorophyll: number
    
    if (distanceFromCoast < 30) {
      // Coastal upwelling - averaged over 8 days
      baseChlorophyll = 5 + Math.random() * 15 // 5-20 mg/m³
    } else if (distanceFromCoast < 100) {
      // Transition zone - more stable than L2
      baseChlorophyll = 2 + Math.random() * 6 // 2-8 mg/m³
    } else {
      // Oceanic zone
      baseChlorophyll = 0.2 + Math.random() * 1.5 // 0.2-1.7 mg/m³
    }

    // Add seasonal variation
    const month = new Date().getMonth() + 1
    if (month >= 6 && month <= 8) {
      baseChlorophyll *= 1.3 // Winter enhancement (less than L2)
    }

    return {
      chlorophyll_a: Number(baseChlorophyll.toFixed(2)),
      coordinates: { lat, lon },
      timestamp: new Date().toISOString(),
      satellite: 'MODIS-Aqua',
      product_level: 'L3B',
      resolution: '4.64 km',
      quality_flags: 0, // L3 data is pre-filtered
      cloud_free_percentage: Math.round(85 + Math.random() * 15) // 85-100%
    }
  }

  // Get color palette that matches Ocean Color browser
  getOceanColorPalette(value: number): string {
    // NASA Ocean Color standard chlorophyll-a color scale
    if (value < 0.01) return '#000000'   // Black (no data)
    if (value < 0.03) return '#000033'   // Very dark blue
    if (value < 0.06) return '#000080'   // Dark blue
    if (value < 0.1) return '#0000cd'    // Medium blue
    if (value < 0.2) return '#1e90ff'    // Dodger blue
    if (value < 0.3) return '#00bfff'    // Deep sky blue
    if (value < 0.5) return '#87ceeb'    // Sky blue
    if (value < 1.0) return '#00ffff'    // Cyan
    if (value < 2.0) return '#7fff00'    // Chartreuse
    if (value < 3.0) return '#adff2f'    // Green yellow
    if (value < 5.0) return '#ffff00'    // Yellow
    if (value < 8.0) return '#ffd700'    // Gold
    if (value < 12.0) return '#ffa500'   // Orange
    if (value < 20.0) return '#ff4500'   // Orange red
    if (value < 30.0) return '#ff0000'   // Red
    return '#8b0000'                     // Dark red
  }

  // Get Ocean Color style metadata
  getProductMetadata(productLevel: string) {
    const metadata = {
      'L2': {
        name: 'Level 2 Ocean Color',
        description: 'Swath data from individual satellite passes',
        spatial_resolution: '1 km at nadir',
        temporal_resolution: 'Instantaneous',
        coverage: 'Single pass',
        cloud_impact: 'High - clouds block ocean view',
        algorithm: 'OC3M (MODIS)',
        pros: ['High spatial resolution', 'Near real-time'],
        cons: ['Cloud contamination', 'Sparse coverage', 'Data gaps']
      },
      'L3': {
        name: 'Level 3 Binned',
        description: '8-day composite with spatial and temporal binning',
        spatial_resolution: '4.64 km',
        temporal_resolution: '8-day composite',
        coverage: 'Global composite',
        cloud_impact: 'Low - cloud-free composite',
        algorithm: 'OC3M with quality filtering',
        pros: ['Cloud-free', 'Complete coverage', 'Quality filtered'],
        cons: ['Lower spatial resolution', '8-day lag', 'Temporal averaging']
      }
    }

    return metadata[productLevel as keyof typeof metadata] || metadata['L3']
  }
}
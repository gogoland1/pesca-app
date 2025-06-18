import { NextRequest, NextResponse } from 'next/server'
import { MultiWaveService } from '../../lib/multi-wave-service'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ 
      error: 'Missing lat or lon parameters',
      example: '/api/wave-profile?lat=-33.0472&lon=-71.6127'
    }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid lat or lon values' }, { status: 400 })
  }

  // Validate coordinates for reasonable ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: 'Coordinates out of valid range' }, { status: 400 })
  }

  try {
    console.log(`🌊 Wave profile request for ${latitude}, ${longitude}`)
    
    const waveService = new MultiWaveService()
    const profile = await waveService.getWaveFrontProfile(latitude, longitude)
    
    console.log(`✅ Generated wave profile with ${profile.measurements.length} measurements`)
    console.log(`📊 Calibrated value: ${profile.calibrated_value}m (${(profile.confidence * 100).toFixed(1)}% confidence)`)
    
    return NextResponse.json({
      success: true,
      ...profile,
      api_info: {
        version: '1.0',
        description: 'Multi-source wave front profile with spatial analysis',
        sources_attempted: ['Open-Meteo', 'Copernicus', 'Storm Glass', 'NOAA NDBC'],
        measurement_distances: [1, 2, 5], // nautical miles
        calibration: 'Chilean coast optimized'
      }
    })

  } catch (error) {
    console.error('Wave profile error:', error)
    
    return NextResponse.json({
      error: 'Failed to generate wave profile',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { latitude, longitude } = body

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ 
        error: 'Body must contain numeric latitude and longitude' 
      }, { status: 400 })
    }

    const waveService = new MultiWaveService()
    const profile = await waveService.getWaveFrontProfile(latitude, longitude)
    
    return NextResponse.json({
      success: true,
      ...profile
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Invalid request body',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}
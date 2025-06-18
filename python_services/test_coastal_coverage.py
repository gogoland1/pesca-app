#!/usr/bin/env python3
"""
Test Copernicus wave data coverage at different distances from Chilean coast
1, 2, and 5 nautical miles offshore
"""

import copernicusmarine
import numpy as np
from datetime import datetime
import math

def nautical_miles_to_degrees(nautical_miles, latitude):
    """Convert nautical miles to degrees at given latitude"""
    # 1 nautical mile = 1/60 degree latitude
    lat_degrees = nautical_miles / 60.0
    
    # Longitude degrees depend on latitude (cos projection)
    lon_degrees = nautical_miles / (60.0 * math.cos(math.radians(latitude)))
    
    return lat_degrees, lon_degrees

def test_coastal_points():
    """Test wave data availability at different coastal locations and distances"""
    
    # Key Chilean coastal cities and their coordinates
    coastal_cities = [
        ("Arica", -18.4783, -70.3126),
        ("Iquique", -20.2307, -70.1355),
        ("Antofagasta", -23.6509, -70.3975),
        ("Caldera", -27.0664, -70.8231),
        ("Coquimbo", -29.9533, -71.3436),
        ("Valparaíso", -33.0472, -71.6127),
        ("San Antonio", -33.5957, -71.6203),
        ("Constitución", -35.3321, -72.4148),
        ("Concepción", -36.8270, -73.0498),
        ("Valdivia", -39.8142, -73.2459),
        ("Puerto Montt", -41.4693, -72.9424),
        ("Castro", -42.4827, -73.7615)
    ]
    
    # Test distances (nautical miles)
    test_distances = [1, 2, 5]
    
    dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"
    
    print("🌊 Testing Copernicus Wave Data Coverage for Chilean Coast")
    print("=" * 60)
    
    results = []
    
    for city_name, lat, lon in coastal_cities:
        print(f"\n📍 Testing {city_name} ({lat:.4f}°, {lon:.4f}°)")
        
        city_results = {"city": city_name, "lat": lat, "lon": lon, "distances": {}}
        
        for distance_nm in test_distances:
            print(f"   🔍 Testing {distance_nm} nautical miles offshore...")
            
            # Calculate offshore coordinates
            lat_offset, lon_offset = nautical_miles_to_degrees(distance_nm, lat)
            
            # Move offshore (west, so decrease longitude)
            offshore_lat = lat
            offshore_lon = lon - lon_offset
            
            try:
                # Test with a small time window in 2024 (known good data)
                dataset = copernicusmarine.open_dataset(
                    dataset_id=dataset_id,
                    minimum_longitude=offshore_lon - 0.05,
                    maximum_longitude=offshore_lon + 0.05,
                    minimum_latitude=offshore_lat - 0.05,
                    maximum_latitude=offshore_lat + 0.05,
                    start_datetime="2024-06-01",
                    end_datetime="2024-06-02"
                )
                
                # Check if we have wave data
                vhm0 = dataset['VHM0']
                
                # Get a sample point
                sample_data = vhm0.isel(time=0).sel(
                    latitude=offshore_lat,
                    longitude=offshore_lon,
                    method="nearest"
                ).values.item()
                
                # Check actual coordinates used
                actual_coords = vhm0.isel(time=0).sel(
                    latitude=offshore_lat,
                    longitude=offshore_lon,
                    method="nearest"
                )
                actual_lat = float(actual_coords.latitude.values)
                actual_lon = float(actual_coords.longitude.values)
                
                # Calculate actual distance from coast
                lat_diff = actual_lat - lat
                lon_diff = actual_lon - lon
                distance_km = math.sqrt((lat_diff * 111)**2 + (lon_diff * 111 * math.cos(math.radians(lat)))**2)
                actual_nm = distance_km / 1.852  # Convert km to nautical miles
                
                if not (str(sample_data) == 'nan' or sample_data != sample_data):
                    print(f"      ✅ Data available: {sample_data:.2f}m")
                    print(f"         Grid point: {actual_lat:.4f}°, {actual_lon:.4f}°")
                    print(f"         Actual distance: {actual_nm:.1f} nm")
                    
                    city_results["distances"][distance_nm] = {
                        "status": "available",
                        "wave_height": float(sample_data),
                        "actual_lat": actual_lat,
                        "actual_lon": actual_lon,
                        "actual_distance_nm": actual_nm
                    }
                else:
                    print(f"      ❌ No valid data (NaN)")
                    city_results["distances"][distance_nm] = {
                        "status": "no_data",
                        "actual_lat": actual_lat,
                        "actual_lon": actual_lon
                    }
                
            except Exception as e:
                print(f"      ❌ Error: {e}")
                city_results["distances"][distance_nm] = {
                    "status": "error",
                    "error": str(e)
                }
        
        results.append(city_results)
    
    # Summary
    print(f"\n" + "=" * 60)
    print("📊 COVERAGE SUMMARY")
    print("=" * 60)
    
    for distance_nm in test_distances:
        available_cities = []
        for city_result in results:
            if distance_nm in city_result["distances"]:
                if city_result["distances"][distance_nm]["status"] == "available":
                    available_cities.append(city_result["city"])
        
        coverage_pct = (len(available_cities) / len(coastal_cities)) * 100
        print(f"\n🌊 {distance_nm} nautical miles offshore:")
        print(f"   Coverage: {len(available_cities)}/{len(coastal_cities)} cities ({coverage_pct:.1f}%)")
        
        if available_cities:
            print(f"   ✅ Available: {', '.join(available_cities)}")
        
        missing_cities = [city["city"] for city in results if distance_nm not in city["distances"] or city["distances"][distance_nm]["status"] != "available"]
        if missing_cities:
            print(f"   ❌ Missing: {', '.join(missing_cities)}")
    
    return results

def find_best_coverage_zone():
    """Find the zone with best wave data coverage"""
    print(f"\n" + "=" * 60)
    print("🎯 FINDING OPTIMAL COVERAGE ZONE")
    print("=" * 60)
    
    # Test a grid of points along Chilean coast
    test_points = []
    
    # From north to south, every 2 degrees
    for lat in range(-18, -44, -2):  # -18 to -42
        for distance_nm in [1, 2, 5]:
            lat_offset, lon_offset = nautical_miles_to_degrees(distance_nm, lat)
            
            # Estimate Chilean coast longitude
            coast_lon = -70.5  # Approximate Chilean coast longitude
            offshore_lon = coast_lon - lon_offset
            
            test_points.append((f"Zone_{lat}S_{distance_nm}nm", lat, offshore_lon, distance_nm))
    
    dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"
    best_points = []
    
    for name, lat, lon, distance in test_points[:10]:  # Test first 10 points
        try:
            print(f"Testing {name}: {lat:.2f}, {lon:.2f}")
            
            dataset = copernicusmarine.open_dataset(
                dataset_id=dataset_id,
                minimum_longitude=lon - 0.1,
                maximum_longitude=lon + 0.1,
                minimum_latitude=lat - 0.1,
                maximum_latitude=lat + 0.1,
                start_datetime="2024-06-01",
                end_datetime="2024-06-02"
            )
            
            vhm0 = dataset['VHM0']
            sample_data = vhm0.isel(time=0).sel(
                latitude=lat,
                longitude=lon,
                method="nearest"
            ).values.item()
            
            if not (str(sample_data) == 'nan' or sample_data != sample_data):
                best_points.append((name, lat, lon, distance, sample_data))
                print(f"   ✅ {sample_data:.2f}m")
            else:
                print(f"   ❌ No data")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    if best_points:
        print(f"\n✅ Found {len(best_points)} zones with good coverage:")
        for name, lat, lon, distance, wave_height in best_points:
            print(f"   {name}: {lat:.3f}, {lon:.3f} ({distance}nm) - {wave_height:.2f}m")
        
        return best_points
    else:
        print(f"\n❌ No zones found with data coverage")
        return []

if __name__ == "__main__":
    print("Copernicus Chilean Coast Coverage Test")
    print("Testing 1, 2, and 5 nautical miles offshore")
    
    # Test major coastal cities
    city_results = test_coastal_points()
    
    # Find optimal zones
    best_zones = find_best_coverage_zone()
    
    print(f"\n🏁 Test completed!")
    if best_zones:
        print(f"✅ Recommended coordinates for reliable data:")
        best_zone = best_zones[0]
        print(f"   Latitude: {best_zone[1]:.4f}°")
        print(f"   Longitude: {best_zone[2]:.4f}°")
        print(f"   Distance: {best_zone[3]} nautical miles")
        print(f"   Wave height: {best_zone[4]:.2f}m")
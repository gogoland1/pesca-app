#!/usr/bin/env python3
"""
Quick test of Copernicus wave data coverage near Chilean coast
"""

import copernicusmarine
import math

def test_basic_coverage():
    """Quick test of basic coverage near Chilean fishing ports"""
    
    # Test points near major Chilean fishing ports
    # Format: (name, lat, lon, distance_from_coast_nm)
    test_points = [
        ("Valparaíso 1nm", -33.0472, -71.63, 1),      # ~1nm offshore
        ("Valparaíso 2nm", -33.0472, -71.65, 2),      # ~2nm offshore  
        ("Valparaíso 5nm", -33.0472, -71.70, 5),      # ~5nm offshore
        ("San Antonio 1nm", -33.5957, -71.64, 1),     # ~1nm offshore
        ("San Antonio 2nm", -33.5957, -71.66, 2),     # ~2nm offshore
        ("San Antonio 5nm", -33.5957, -71.71, 5),     # ~5nm offshore
        ("Coquimbo 1nm", -29.9533, -71.36, 1),        # ~1nm offshore
        ("Coquimbo 2nm", -29.9533, -71.38, 2),        # ~2nm offshore
        ("Coquimbo 5nm", -29.9533, -71.43, 5),        # ~5nm offshore
    ]
    
    dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"
    
    print("🌊 Quick Coverage Test for Chilean Fishing Waters")
    print("=" * 50)
    
    available_points = []
    
    for name, lat, lon, distance_nm in test_points:
        try:
            print(f"Testing {name} ({lat:.4f}, {lon:.4f})... ", end="")
            
            # Test with small area and known good date
            dataset = copernicusmarine.open_dataset(
                dataset_id=dataset_id,
                minimum_longitude=lon - 0.05,
                maximum_longitude=lon + 0.05,
                minimum_latitude=lat - 0.05,
                maximum_latitude=lat + 0.05,
                start_datetime="2024-06-01",
                end_datetime="2024-06-01"
            )
            
            # Check wave data
            vhm0 = dataset['VHM0']
            sample_data = vhm0.isel(time=0).sel(
                latitude=lat,
                longitude=lon,
                method="nearest"
            ).values.item()
            
            if not (str(sample_data) == 'nan' or sample_data != sample_data):
                print(f"✅ {sample_data:.2f}m")
                available_points.append((name, lat, lon, distance_nm, sample_data))
            else:
                print(f"❌ No data")
                
        except Exception as e:
            print(f"❌ Error: {str(e)[:50]}...")
    
    print(f"\n📊 RESULTS:")
    print(f"Available points: {len(available_points)}/{len(test_points)}")
    
    if available_points:
        print(f"\n✅ Points with data coverage:")
        for name, lat, lon, distance_nm, wave_height in available_points:
            print(f"   {name}: {wave_height:.2f}m at {lat:.4f}, {lon:.4f}")
        
        # Group by distance
        distances = {}
        for _, _, _, distance_nm, _ in available_points:
            distances[distance_nm] = distances.get(distance_nm, 0) + 1
        
        print(f"\n📏 Coverage by distance:")
        for dist in sorted(distances.keys()):
            count = distances[dist]
            total_for_dist = len([p for p in test_points if p[3] == dist])
            print(f"   {dist}nm offshore: {count}/{total_for_dist} points")
        
        # Recommend best point
        best_point = available_points[0]
        print(f"\n🎯 Recommended coordinates:")
        print(f"   Location: {best_point[0]}")
        print(f"   Latitude: {best_point[1]:.6f}")
        print(f"   Longitude: {best_point[2]:.6f}")
        print(f"   Distance: {best_point[3]}nm from coast")
        print(f"   Wave height: {best_point[4]:.2f}m")
        
        return best_point
    else:
        print(f"\n❌ No coverage found in tested areas")
        return None

if __name__ == "__main__":
    result = test_basic_coverage()
    if result:
        print(f"\n✅ Success! Use these coordinates for reliable data access.")
    else:
        print(f"\n❌ No reliable coverage found. May need to use simulation fallback.")
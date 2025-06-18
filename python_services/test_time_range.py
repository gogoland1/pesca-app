#!/usr/bin/env python3
"""
Test available time range in Copernicus dataset
"""

import copernicusmarine
from datetime import datetime, timedelta

def test_available_times():
    """Check what time range is actually available"""
    
    dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"
    
    try:
        print(f"🔍 Checking available time range for: {dataset_id}")
        
        # Open dataset with a broader area for Chilean coast
        dataset = copernicusmarine.open_dataset(
            dataset_id=dataset_id,
            minimum_longitude=-75,  # Broader longitude range
            maximum_longitude=-70,
            minimum_latitude=-35,   # Broader latitude range
            maximum_latitude=-30
        )
        
        print(f"✅ Dataset opened successfully!")
        
        # Check time range
        times = dataset.time.values
        print(f"📅 Available time range:")
        print(f"   Start: {times[0]}")
        print(f"   End: {times[-1]}")
        print(f"   Total time steps: {len(times)}")
        
        # Check if we have recent data
        latest_time = times[-1]
        print(f"   Latest data: {latest_time}")
        
        # Check VHM0 data at a specific point
        vhm0 = dataset['VHM0']
        print(f"\n🌊 VHM0 variable info:")
        print(f"   Shape: {vhm0.shape}")
        print(f"   Dimensions: {vhm0.dims}")
        
        # Try to get some actual data from the middle of the domain and recent time
        mid_lat_idx = vhm0.shape[1] // 2
        mid_lon_idx = vhm0.shape[2] // 2
        
        # Get data from the last few time steps
        recent_data = vhm0[-10:, mid_lat_idx, mid_lon_idx].values
        print(f"   Recent wave heights (last 10 steps): {recent_data}")
        
        # Check if we have valid (non-NaN) data
        valid_data = recent_data[~pd.isna(recent_data)] if 'pd' in globals() else [x for x in recent_data if not str(x) == 'nan']
        
        if len(valid_data) > 0:
            print(f"   ✅ Found valid data! Example values: {valid_data[:5]}")
            return str(times[-1])  # Return latest time as string
        else:
            print(f"   ❌ All recent data is NaN")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_specific_coordinates():
    """Test if the issue is with the specific coordinates"""
    
    dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"
    
    # Test different coordinate sets
    test_coords = [
        (-33.0, -71.6, "Valparaíso area"),
        (-36.8, -73.0, "Concepción area"),
        (-30.0, -71.0, "Northern Chile"),
        (-40.0, -74.0, "Southern Chile")
    ]
    
    for lat, lon, name in test_coords:
        try:
            print(f"\n🔍 Testing coordinates: {name} ({lat}, {lon})")
            
            dataset = copernicusmarine.open_dataset(
                dataset_id=dataset_id,
                minimum_longitude=lon - 0.5,
                maximum_longitude=lon + 0.5,
                minimum_latitude=lat - 0.5,
                maximum_latitude=lat + 0.5,
                start_datetime="2024-01-01",  # Try historical data
                end_datetime="2024-01-02"
            )
            
            vhm0 = dataset['VHM0']
            sample_data = vhm0[0, :, :].values.flatten()
            valid_count = sum(1 for x in sample_data if str(x) != 'nan')
            
            print(f"   Shape: {vhm0.shape}")
            print(f"   Valid data points: {valid_count}/{len(sample_data)}")
            
            if valid_count > 0:
                valid_values = [x for x in sample_data if str(x) != 'nan']
                print(f"   ✅ Sample values: {valid_values[:5]}")
                return lat, lon
            else:
                print(f"   ❌ No valid data")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return None, None

if __name__ == "__main__":
    print("Copernicus Time Range and Data Availability Tester")
    print("=" * 50)
    
    # Check overall time range
    latest_time = test_available_times()
    
    if latest_time:
        print(f"\n✅ Dataset has data until: {latest_time}")
    
    # Test specific coordinates
    print(f"\n" + "="*50)
    valid_lat, valid_lon = test_specific_coordinates()
    
    if valid_lat and valid_lon:
        print(f"\n✅ Found valid coordinates: {valid_lat}, {valid_lon}")
    else:
        print(f"\n❌ No valid coordinates found")
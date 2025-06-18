#!/usr/bin/env python3
"""
Debug Copernicus dataset variables and data availability
"""

import copernicusmarine
import sys

def debug_dataset_variables():
    """Check what variables are available in the wave dataset"""
    
    dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"
    
    try:
        print(f"🔍 Inspecting dataset: {dataset_id}")
        
        # Get dataset info
        dataset_info = copernicusmarine.describe(dataset_id=dataset_id)
        print(f"✅ Dataset found!")
        
        # Print basic info
        print(f"Title: {getattr(dataset_info, 'title', 'N/A')}")
        print(f"Description: {getattr(dataset_info, 'description', 'N/A')[:200]}...")
        
        # Check available variables
        if hasattr(dataset_info, 'variables'):
            print(f"\n📊 Available variables ({len(dataset_info.variables)}):")
            for var in dataset_info.variables:
                var_id = getattr(var, 'variable_id', 'N/A')
                var_name = getattr(var, 'standard_name', 'N/A')
                var_units = getattr(var, 'units', 'N/A')
                print(f"   - {var_id}: {var_name} ({var_units})")
                
                # Look for wave-related variables
                if any(keyword in var_id.lower() for keyword in ['wave', 'vhm', 'swh', 'height']):
                    print(f"     🌊 WAVE VARIABLE: {var_id}")
        
        # Check coordinates and time coverage
        if hasattr(dataset_info, 'coordinates'):
            print(f"\n🗺️ Coordinates:")
            for coord in dataset_info.coordinates:
                coord_id = getattr(coord, 'coordinate_id', 'N/A')
                coord_min = getattr(coord, 'minimum_value', 'N/A')
                coord_max = getattr(coord, 'maximum_value', 'N/A')
                print(f"   - {coord_id}: {coord_min} to {coord_max}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error inspecting dataset: {e}")
        return False

def test_open_dataset():
    """Test opening the dataset directly"""
    
    dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"
    
    try:
        print(f"\n🔍 Testing direct dataset access...")
        
        # Try to open the dataset with minimal parameters
        dataset = copernicusmarine.open_dataset(
            dataset_id=dataset_id,
            minimum_longitude=-72,
            maximum_longitude=-71,
            minimum_latitude=-34,
            maximum_latitude=-33
        )
        
        print(f"✅ Dataset opened successfully!")
        print(f"Variables in dataset: {list(dataset.variables.keys())}")
        print(f"Coordinates: {list(dataset.coords.keys())}")
        print(f"Data variables: {list(dataset.data_vars.keys())}")
        
        # Check for specific wave variables
        possible_wave_vars = ['VHM0', 'vhm0', 'VHMO', 'SWH', 'swh', 'wave_height', 'VTM02']
        found_vars = []
        
        for var in possible_wave_vars:
            if var in dataset.variables:
                found_vars.append(var)
                print(f"🌊 Found wave variable: {var}")
                
                # Print some info about the variable
                var_data = dataset[var]
                print(f"   Shape: {var_data.shape}")
                print(f"   Dimensions: {var_data.dims}")
                print(f"   Attrs: {dict(var_data.attrs)}")
        
        if found_vars:
            return found_vars[0]  # Return the first found variable
        else:
            print("❌ No standard wave variables found")
            return None
            
    except Exception as e:
        print(f"❌ Error opening dataset: {e}")
        return None

if __name__ == "__main__":
    print("Copernicus Dataset Variable Inspector")
    print("=" * 40)
    
    # First inspect the dataset metadata
    if debug_dataset_variables():
        # Then try to open it directly
        wave_var = test_open_dataset()
        
        if wave_var:
            print(f"\n✅ Success! Use wave variable: {wave_var}")
        else:
            print(f"\n❌ Could not identify wave variable")
    else:
        print(f"\n❌ Could not access dataset metadata")
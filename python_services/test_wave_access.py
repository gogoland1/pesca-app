#!/usr/bin/env python3
"""
Test direct access to wave datasets
"""

import copernicusmarine
import sys

def test_wave_datasets():
    """Test different wave dataset IDs"""
    
    # Common wave dataset patterns to try
    possible_datasets = [
        "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i",
        "cmems_mod_glo_wav_my_0.2deg_PT3H-i", 
        "GLOBAL_ANALYSISFORECAST_WAV_001_027",
        "WAVE_GLO_PHY_SWH_L4_NRT_014_003",
        "WAVE_GLO_WAV_L4_SWH_NRT_OBSERVATIONS_014_001"
    ]
    
    print("🌊 Testing wave dataset access...")
    
    for dataset_id in possible_datasets:
        try:
            print(f"\n🔍 Testing dataset: {dataset_id}")
            
            # Try to describe the dataset
            dataset_info = copernicusmarine.describe(dataset_id=dataset_id)
            print(f"✅ Found dataset: {dataset_id}")
            print(f"   Title: {dataset_info.get('title', 'N/A')}")
            
            # Check variables
            variables = dataset_info.get('variables', [])
            print(f"   Variables: {[v.get('variable_id', 'N/A') for v in variables]}")
            
            # Look for wave height variables
            wave_vars = [v for v in variables if any(
                keyword in v.get('variable_id', '').lower() 
                for keyword in ['vhm0', 'wave', 'swh', 'height']
            )]
            
            if wave_vars:
                print(f"   🌊 Wave variables found: {[v.get('variable_id') for v in wave_vars]}")
                return dataset_id, wave_vars[0].get('variable_id')
            
        except Exception as e:
            print(f"❌ Dataset {dataset_id} not accessible: {e}")
    
    return None, None

def test_simple_access():
    """Test basic access without specifying dataset"""
    try:
        print("\n🔍 Testing simple catalogue access...")
        catalogue = copernicusmarine.describe()
        print(f"✅ Catalogue accessed, found {len(catalogue)} products")
        
        # Look for products with 'wav' in the name
        wave_products = [p for p in catalogue if 'wav' in p.get('product_id', '').lower()]
        print(f"🌊 Found {len(wave_products)} wave products:")
        
        for product in wave_products[:3]:  # Show first 3
            product_id = product.get('product_id', 'N/A')
            title = product.get('title', 'N/A')
            print(f"   - {product_id}: {title}")
            
            # Try to get dataset info
            try:
                datasets = product.get('datasets', [])
                if datasets:
                    dataset_id = datasets[0].get('dataset_id', 'N/A')
                    print(f"     First dataset: {dataset_id}")
                    return product_id, dataset_id
            except:
                pass
        
        return None, None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

if __name__ == "__main__":
    print("Copernicus Wave Dataset Tester")
    print("=" * 35)
    
    # Test specific datasets
    dataset_id, variable_id = test_wave_datasets()
    
    if not dataset_id:
        # Try simple access
        product_id, dataset_id = test_simple_access()
    
    if dataset_id:
        print(f"\n✅ Success! Use dataset: {dataset_id}")
        if variable_id:
            print(f"✅ Wave variable: {variable_id}")
    else:
        print("\n❌ No accessible wave datasets found")
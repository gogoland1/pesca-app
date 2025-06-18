#!/usr/bin/env python3
"""
Explore Copernicus Marine catalogue to find correct dataset IDs
"""

import copernicusmarine
import sys

def explore_catalogue():
    """Explore the catalogue to find wave datasets"""
    try:
        print("🔍 Exploring Copernicus Marine catalogue...")
        
        # Get catalogue
        catalogue = copernicusmarine.describe(include_datasets=True)
        
        print(f"✅ Retrieved catalogue with {len(catalogue)} products")
        
        # Look for wave-related products
        wave_products = []
        for product in catalogue:
            product_id = product.get('product_id', '')
            title = product.get('title', '')
            
            # Look for wave-related keywords
            if any(keyword in product_id.lower() or keyword in title.lower() 
                   for keyword in ['wav', 'wave', 'VHM0', 'swell']):
                wave_products.append(product)
                print(f"\n🌊 Found wave product: {product_id}")
                print(f"   Title: {title}")
                
                # Check if it has datasets
                datasets = product.get('datasets', [])
                if datasets:
                    print(f"   Datasets ({len(datasets)}):")
                    for dataset in datasets:
                        dataset_id = dataset.get('dataset_id', '')
                        dataset_title = dataset.get('title', '')
                        print(f"     - {dataset_id}: {dataset_title}")
        
        if not wave_products:
            print("❌ No wave products found. Showing first 5 products for reference:")
            for i, product in enumerate(catalogue[:5]):
                print(f"   {i+1}. {product.get('product_id', 'N/A')}: {product.get('title', 'N/A')}")
        
        return wave_products
        
    except Exception as e:
        print(f"❌ Error exploring catalogue: {e}")
        return []

def test_authentication():
    """Test if credentials work"""
    try:
        print("🔐 Testing authentication...")
        # Credentials should be configured via login, test by accessing catalogue
        result = copernicusmarine.describe()
        print("✅ Authentication successful!")
        return True
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return False

if __name__ == "__main__":
    print("Copernicus Marine Catalogue Explorer")
    print("=" * 40)
    
    # Test auth first
    if test_authentication():
        # Explore catalogue
        wave_products = explore_catalogue()
        
        if wave_products:
            print(f"\n📊 Summary: Found {len(wave_products)} wave-related products")
        else:
            print("\n❌ No wave products found")
    else:
        print("\n❌ Cannot proceed without authentication")
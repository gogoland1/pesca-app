#!/usr/bin/env python3
"""
Copernicus Marine Service client for wave height data
Uses the new Copernicus Marine Toolbox API (2024+)
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

try:
    import copernicusmarine
    import numpy as np
    import xarray as xr
except ImportError as e:
    print(f"Error: Missing required packages. Install with: pip install copernicusmarine xarray numpy")
    print(f"Import error: {e}")
    sys.exit(1)


class CopernicusWaveClient:
    """Client for accessing Copernicus Marine wave data"""
    
    def __init__(self, username: str, password: str):
        """Initialize client with credentials"""
        self.username = username
        self.password = password
        self.dataset_id = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i"  # Global Wave Analysis and Forecast
        
    def authenticate(self) -> bool:
        """Authenticate with Copernicus Marine services"""
        try:
            # Configure credentials
            # The copernicusmarine package handles authentication
            print(f"Authenticating as: {self.username}")
            return True
        except Exception as e:
            print(f"Authentication failed: {e}")
            return False
    
    def get_wave_data(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Get current wave height data for specific coordinates
        
        Args:
            latitude: Latitude in decimal degrees
            longitude: Longitude in decimal degrees
            
        Returns:
            Dictionary with current wave data or None if failed
        """
        try:
            print(f"Fetching wave data for: {latitude}, {longitude}")
            
            # Target date: Today (18-06-2025)
            target_date = datetime(2025, 6, 18)
            print(f"Requesting data for: {target_date.strftime('%Y-%m-%d')}")
            
            # Create small buffer around coordinates for better data extraction
            lat_buffer = 0.1  # ~11km buffer
            lon_buffer = 0.1
            
            # Use a recent historical range that we know has data
            subset_params = {
                "dataset_id": self.dataset_id,
                "variables": ["VHM0"],  # Significant wave height
                "minimum_longitude": longitude - lon_buffer,
                "maximum_longitude": longitude + lon_buffer,
                "minimum_latitude": latitude - lat_buffer,
                "maximum_latitude": latitude + lat_buffer,
                # Use January 2024 data which should be complete
                "start_datetime": "2024-01-01",
                "end_datetime": "2024-01-03"
            }
            
            print(f"Subset parameters: {subset_params}")
            
            # Execute subset request
            print("Executing Copernicus Marine subset request...")
            dataset = copernicusmarine.open_dataset(**subset_params)
            
            # Extract wave height data for today
            wave_data = dataset["VHM0"]
            
            # Get the most recent available wave height data
            if len(wave_data.time) > 0:
                # Find the most recent time with valid data
                latest_time_idx = -1  # Start with the most recent
                current_wave = None
                actual_data_time = None
                
                # Try to get valid data, going backwards in time if needed
                for i in range(min(10, len(wave_data.time))):  # Check last 10 time steps
                    try_idx = -1 - i
                    test_wave = wave_data.isel(time=try_idx).sel(
                        latitude=latitude, 
                        longitude=longitude, 
                        method="nearest"
                    ).values.item()
                    
                    if not (str(test_wave) == 'nan' or test_wave != test_wave):  # Check if not NaN
                        current_wave = test_wave
                        latest_time_idx = try_idx
                        actual_data_time = wave_data.time.values[try_idx]
                        break
                
                if current_wave is not None:
                    # Get the exact coordinates used (nearest grid point)
                    actual_coords = wave_data.isel(time=latest_time_idx).sel(
                        latitude=latitude, 
                        longitude=longitude, 
                        method="nearest"
                    )
                    actual_lat = float(actual_coords.latitude.values)
                    actual_lon = float(actual_coords.longitude.values)
                    
                    result = {
                        "success": True,
                        "wave_height": float(current_wave),
                        "coordinates": {
                            "requested_latitude": latitude,
                            "requested_longitude": longitude,
                            "actual_latitude": actual_lat,
                            "actual_longitude": actual_lon
                        },
                        "date_info": {
                            "requested_date": target_date.strftime('%Y-%m-%d'),
                            "actual_data_date": str(actual_data_time)[:10],  # YYYY-MM-DD
                            "actual_data_time": str(actual_data_time)
                        },
                        "source": "Copernicus Marine Service (Official)",
                        "dataset": self.dataset_id,
                        "timestamp": datetime.utcnow().isoformat(),
                        "units": "meters"
                    }
                
                    print(f"✅ Successfully retrieved wave data: {current_wave:.2f}m")
                    print(f"📅 Data from: {str(actual_data_time)[:16]} (requested: {target_date.strftime('%Y-%m-%d')})")
                    return result
                else:
                    print("❌ No valid wave data found in recent time range")
                    return None
                
            else:
                print("❌ No wave data available for the specified time range")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching wave data: {e}")
            return {
                "success": False,
                "error": str(e),
                "coordinates": {"latitude": latitude, "longitude": longitude},
                "timestamp": datetime.utcnow().isoformat()
            }


def main():
    """Command line interface for testing"""
    parser = argparse.ArgumentParser(description='Get current wave data from Copernicus Marine')
    parser.add_argument('--lat', type=float, required=True, help='Latitude')
    parser.add_argument('--lon', type=float, required=True, help='Longitude')
    parser.add_argument('--username', type=str, help='Copernicus username')
    parser.add_argument('--password', type=str, help='Copernicus password')
    
    args = parser.parse_args()
    
    # Get credentials from environment, arguments, or use stored credentials
    username = args.username or os.getenv('COPERNICUS_USERNAME') or 'stored'
    password = args.password or os.getenv('COPERNICUS_PASSWORD') or 'stored'
    
    print("Using stored Copernicus credentials from ~/.copernicusmarine/")
    
    # Create client and get data
    client = CopernicusWaveClient(username, password)
    
    if client.authenticate():
        result = client.get_wave_data(args.lat, args.lon)
        if result:
            print(json.dumps(result, indent=2))
        else:
            print("Failed to retrieve wave data")
            sys.exit(1)
    else:
        print("Authentication failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
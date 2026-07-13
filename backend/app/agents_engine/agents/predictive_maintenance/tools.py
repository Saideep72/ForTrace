"""
Placeholder tools for Predictive Maintenance Agent.

These will later be replaced by backend APIs/database calls.
"""

from typing import List, Dict, Any

def get_asset_information(query: str) -> List[Dict[str, Any]]:
    """
    Fetch asset details.
    Backend team will replace this later.
    """
    # Note: Currently ignores `query` and always returns mock data for TR-101.
    return [{
        "asset_id": "TR-101",
        "asset_type": "Power Transformer",
        "location": "Substation A",
        "installation_year": 2018,
        "current_status": "Operational"
    }]


def get_sensor_summary(query: str) -> List[Dict[str, Any]]:
    """
    Fetch latest sensor readings.
    Backend team will replace this later.
    """
    # Note: Currently ignores `query` and always returns mock data for TR-101.
    return [{
        "temperature": "92°C",
        "vibration": "High",
        "oil_level": "Low",
        "load_percentage": 87
    }]


def get_maintenance_history(query: str) -> List[Dict[str, Any]]:
    """
    Fetch previous maintenance records.
    Backend team will replace this later.
    """
    # Note: Currently ignores `query` and always returns mock data for TR-101.
    return [{
        "last_maintenance": "2026-05-15",
        "previous_failures": 2,
        "maintenance_notes": [
            "Oil leakage detected",
            "Cooling system inspected"
        ]
    }]
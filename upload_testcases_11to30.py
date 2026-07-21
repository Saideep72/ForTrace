import os
import sys
import requests
from dotenv import load_dotenv

# Load env variables from backend/.env
env_path = os.path.abspath("backend/.env")
if os.path.exists(env_path):
    load_dotenv(env_path)

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.core.security import create_access_token
from app.core.config import settings

def generate_admin_token():
    token_payload = {
        "user_id": "2e202d00-be17-47e5-83e3-2c21657678bf",
        "email": "aadesh@gmail.com",
        "role": "Plant_Manager"
    }
    return create_access_token(data=token_payload)

def upload_testcases_11_to_30():
    BASE_URL = "http://127.0.0.1:8000/api/v1"
    token = generate_admin_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }

    base_dir = os.path.join("10_testcases", "11to30", "aad")

    items = [
        {
            "rel_path": "MOC_pump_upgrade_E-401.docx",
            "uat": "STL-HYD-P401-001",
            "title": "Management of Change - Centrifugal Pump E-401 Upgrade",
            "doc_type": "SOP",
            "revision": "1.0",
            "compliance_scope": "Operational Safety & MOC"
        },
        {
            "rel_path": "PHA_HAZOP_reactor_R-102(1).pdf",
            "uat": "REF-HTX-R101-001",
            "title": "Process Hazard Analysis & HAZOP Study Reactor R-102",
            "doc_type": "REGULATORY_FILING",
            "revision": "2.0",
            "compliance_scope": "Process Safety Management"
        },
        {
            "rel_path": "alarm_config_DCS_unit2.json",
            "uat": "REF-UTIL-C101-001",
            "title": "DCS Unit 2 Telemetry & Alarm Setpoint Configuration",
            "doc_type": "OEM_MANUAL",
            "revision": "1.5",
            "compliance_scope": "Control Systems"
        },
        {
            "rel_path": "env_report_2024_Q2.pdf",
            "uat": "PET-POLY-TK307-001",
            "title": "Environmental Emission & Effluent Audit Report Q2 2024",
            "doc_type": "REGULATORY_FILING",
            "revision": "1.0",
            "compliance_scope": "EHS Compliance"
        },
        {
            "rel_path": "gasket_failure_flange_12inch.jpg",
            "uat": "PET-DIST-E303-001",
            "title": "12-inch Pipe Flange Mechanical Gasket Failure Inspection Image",
            "doc_type": "INSPECTION_REPORT",
            "revision": "1.0",
            "compliance_scope": "Asset Integrity"
        },
        {
            "rel_path": "incident_investigation_2024_007.pdf",
            "uat": "STL-BF-BF201-001",
            "title": "Root Cause Failure Analysis Incident Report #2024-007",
            "doc_type": "LESSONS_LEARNED",
            "revision": "1.0",
            "compliance_scope": "Incident Prevention"
        },
        {
            "rel_path": "leak_report_areaG_memo.mp3",
            "uat": "REF-UTIL-CW101-001",
            "title": "Field Operator Audio Memo - Area G Cooling Water Line Leak",
            "doc_type": "INSPECTION_REPORT",
            "revision": "1.0",
            "compliance_scope": "Field Observation"
        },
        {
            "rel_path": "ppe_station_areaC_new.jpg",
            "uat": "REF-HTX-T401-001",
            "title": "Safety Inspection Photo - Area C PPE & Eyewash Station",
            "doc_type": "INSPECTION_REPORT",
            "revision": "1.0",
            "compliance_scope": "Occupational Safety"
        },
        {
            "rel_path": "shift_handover_night_20240714.docx",
            "uat": "PET-DIST-C301-001",
            "title": "Shift Handover Log Night Duty July 14 2024",
            "doc_type": "SOP",
            "revision": "1.0",
            "compliance_scope": "Plant Operations"
        },
        {
            "rel_path": "spare_parts_inventory_2024.csv",
            "uat": "REF-HTX-E201-001",
            "title": "Master Equipment Spare Parts Catalog FY2024",
            "doc_type": "OEM_MANUAL",
            "revision": "2.0",
            "compliance_scope": "Supply Chain"
        },
        {
            "rel_path": "turnaround_TA2024_unit1.zip",
            "uat": "STL-RM-RM101-001",
            "title": "Unit 1 Plant Turnaround Major Overhaul Archive 2024",
            "doc_type": "OEM_MANUAL",
            "revision": "1.0",
            "compliance_scope": "Major Turnaround"
        },
        {
            "rel_path": "ultrasonic_leak_valve_V-701.wav",
            "uat": "PET-DIST-V304-001",
            "title": "Ultrasonic Acoustic Leak Detection Audio Signal Valve V-701",
            "doc_type": "INSPECTION_REPORT",
            "revision": "1.0",
            "compliance_scope": "Predictive Maintenance"
        },
        {
            "rel_path": "unknown_tag_found_areaH.jpg",
            "uat": "STL-CCM-CCM301-001",
            "title": "Unregistered Field Equipment Nameplate Photo Area H",
            "doc_type": "INSPECTION_REPORT",
            "revision": "1.0",
            "compliance_scope": "Asset Cataloging"
        },
        {
            "rel_path": "vendor_quote_valve_replacement.pdf",
            "uat": "PET-DIST-V304-001",
            "title": "Commercial Vendor Procurement Quotation Valve Replacement",
            "doc_type": "OEM_MANUAL",
            "revision": "1.0",
            "compliance_scope": "Capital Procurement"
        },
        {
            "rel_path": "vibration_data_motor_M-401_weekly.csv",
            "uat": "REF-HTX-P201-001",
            "title": "High-Frequency Motor Vibration Sensor Time Series Log",
            "doc_type": "INSPECTION_REPORT",
            "revision": "1.0",
            "compliance_scope": "Machinery Reliability"
        },
        {
            "rel_path": "EPA_submission_2024_permit.zip",
            "uat": "PET-POLY-T305-001",
            "title": "Environmental Protection Agency Regulatory Filing Permit Package 2024",
            "doc_type": "REGULATORY_FILING",
            "revision": "1.0",
            "compliance_scope": "EPA Statutory Filing"
        },
        {
            "rel_path": os.path.join("control_panel_HMI", "11dec.txt"),
            "uat": "REF-UTIL-B101-001",
            "title": "Boiler Control Panel HMI Alarm Log Dec 11",
            "doc_type": "SOP",
            "revision": "1.0",
            "compliance_scope": "Control Room Operations"
        },
        {
            "rel_path": os.path.join("control_panel_HMI", "control_panel_HMI_Rev3.png"),
            "uat": "REF-UTIL-B101-001",
            "title": "Control Room Main Boiler HMI Console Screen Capture Rev3",
            "doc_type": "OEM_MANUAL",
            "revision": "3.0",
            "compliance_scope": "Human Machine Interface"
        }
    ]

    print("==================================================")
    print("Starting Bulk Test Cases (11-30) Upload to ForTrace API")
    print("==================================================")

    success_count = 0
    duplicate_count = 0
    fail_count = 0

    for item in items:
        file_path = os.path.join(base_dir, item["rel_path"])
        filename = os.path.basename(file_path)
        
        if not os.path.exists(file_path):
            print(f"[FAIL] File not found locally: {file_path}")
            fail_count += 1
            continue

        print(f"\nUploading '{filename}' linked to asset UAT '{item['uat']}'...")
        
        with open(file_path, "rb") as f:
            files = {
                "file": (filename, f, "application/octet-stream")
            }
            data = {
                "uat": item["uat"],
                "title": item["title"],
                "doc_type": item["doc_type"],
                "revision": item["revision"],
                "compliance_scope": item["compliance_scope"]
            }

            try:
                response = requests.post(
                    f"{BASE_URL}/documents/upload",
                    headers=headers,
                    files=files,
                    data=data
                )
                if response.status_code == 201:
                    res_json = response.json()
                    print(f"[OK] Success! Registered ID: {res_json.get('doc_id')}")
                    success_count += 1
                elif response.status_code == 409:
                    print("[DUPLICATE] Already Uploaded (SHA-256 duplicate hash protection).")
                    duplicate_count += 1
                else:
                    print(f"[FAIL] HTTP {response.status_code} - {response.text}")
                    fail_count += 1
            except Exception as e:
                print(f"[ERROR] Connection error: {e}")
                fail_count += 1

    print("\n==================================================")
    print(f"Upload Completed: {success_count} Uploaded | {duplicate_count} Duplicates | {fail_count} Failed")
    print("==================================================")

if __name__ == "__main__":
    upload_testcases_11_to_30()

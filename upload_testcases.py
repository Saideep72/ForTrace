import os
import sys
import requests

# Add backend app directory to sys.path to access security/config
sys.path.append(os.path.abspath("backend/app"))
try:
    from app.core.security import create_access_token
    from app.core.config import settings
except ImportError:
    # If run from backend directory
    sys.path.append(os.path.abspath("app"))
    from app.core.security import create_access_token
    from app.core.config import settings

def generate_admin_token():
    # Construct claims payload for aadesh@gmail.com (Plant_Manager role)
    token_payload = {
        "user_id": "2e202d00-be17-47e5-83e3-2c21657678bf",
        "email": "aadesh@gmail.com",
        "role": "Plant_Manager"
    }
    # Create signed token
    token = create_access_token(data=token_payload)
    return token

def upload_all_test_files():
    BASE_URL = "http://127.0.0.1:8000/api/v1"
    token = generate_admin_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }

    testcase_dir = "10_testcases"
    
    # Map the 10 files to correct metadata: UATs, Titles, and DocTypes
    files_metadata = [
        {
            "filename": "alarm_config_DCS_unit2.json",
            "uat": "REF-UTIL-C101-001",
            "title": "Air Compressor DCS Alarm Configuration",
            "doc_type": "OEM_MANUAL",
            "revision": "1.0",
            "compliance_scope": "Safety Systems"
        },
        {
            "filename": "digital_twin_reactor_R-301.json",
            "uat": "REF-HTX-V301-001",
            "title": "Digital Twin Reactor R-301 Specification",
            "doc_type": "OEM_MANUAL",
            "revision": "2.1",
            "compliance_scope": "Digital Twin Integration"
        },
        {
            "filename": "env_report_2024_Q2.pdf",
            "uat": "REF-HTX-T401-001",
            "title": "Environmental Compliance Report 2024 Q2",
            "doc_type": "REGULATORY_FILING",
            "revision": "1.0",
            "compliance_scope": "Environmental Safety"
        },
        {
            "filename": "maintenance_checklist_Q3.docx",
            "uat": "REF-HTX-E201-001",
            "title": "Heat Exchanger E-201 Q3 Maintenance Checklist",
            "doc_type": "SOP",
            "revision": "1.2",
            "compliance_scope": "Preventative Maintenance"
        },
        {
            "filename": "reactor_R-200_project.zip",
            "uat": "REF-HTX-V301-001",
            "title": "Reactor R-200 Project Structural Specs",
            "doc_type": "OEM_MANUAL",
            "revision": "1.0",
            "compliance_scope": "Engineering Standards"
        },
        {
            "filename": "safety_procedure_v2.pdf",
            "uat": "REF-HTX-T401-001",
            "title": "Storage Tank Safety Standards & Procedures",
            "doc_type": "SOP",
            "revision": "2.0",
            "compliance_scope": "Operational Safety"
        },
        {
            "filename": "spare_parts_inventory_2024.csv",
            "uat": "REF-HTX-E201-001",
            "title": "Heat Exchanger E-201 Spare Parts Catalog 2024",
            "doc_type": "OEM_MANUAL",
            "revision": "1.0",
            "compliance_scope": "Inventory Audit"
        },
        {
            "filename": "temp_log_reactor_Q1.csv",
            "uat": "REF-HTX-V301-001",
            "title": "Pressure Vessel Reactor Q1 Temperature Telemetry Log",
            "doc_type": "REGULATORY_FILING",
            "revision": "1.0",
            "compliance_scope": "Performance Auditing"
        },
        {
            "filename": "temp_log_reactor_Q1.json",
            "uat": "REF-HTX-V301-001",
            "title": "Pressure Vessel Reactor Q1 Temp Structured Log JSON",
            "doc_type": "OEM_MANUAL",
            "revision": "1.0",
            "compliance_scope": "Sensor Telemetry Archive"
        },
        {
            "filename": "vibration_data_motor_M-401_weekly.csv",
            "uat": "REF-HTX-P201-001",
            "title": "Centrifugal Pump P-201 Weekly Motor Vibration Log",
            "doc_type": "INSPECTION_REPORT",
            "revision": "3.4",
            "compliance_scope": "Vibration Analysis"
        }
    ]

    print("==================================================")
    print("Starting Bulk Test Cases Upload to FortTrace API")
    print("==================================================")

    for item in files_metadata:
        file_path = os.path.join(testcase_dir, item["filename"])
        
        if not os.path.exists(file_path):
            print(f"❌ File not found locally: {file_path}")
            continue

        print(f"\n📤 Uploading '{item['filename']}' linked to asset UAT '{item['uat']}'...")
        
        with open(file_path, "rb") as f:
            # Multipart Form fields
            files = {
                "file": (item["filename"], f, "application/octet-stream")
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
                    print(f"✅ Success! Registered ID: {res_json.get('doc_id')}")
                elif response.status_code == 409:
                    print("⚠️ Already Uploaded (SHA-256 duplicate protection triggered).")
                else:
                    print(f"❌ Failed: HTTP {response.status_code} - {response.text}")
            except Exception as e:
                print(f"❌ Connection error: {e}")

    print("\n==================================================")
    print("Bulk Upload Flow Completed.")
    print("==================================================")

if __name__ == "__main__":
    upload_all_test_files()

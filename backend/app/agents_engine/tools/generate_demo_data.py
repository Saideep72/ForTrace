"""
Script to generate realistic industrial demo data for the ET Hackathon.
Generates CSV datasets and text manuals for the AI orchestration MVP.
"""

import random
import datetime
from pathlib import Path
import pandas as pd

def generate_demo_data():
    """Generates synthetic CSV datasets and industrial manuals."""
    
    # Define directories relative to the current working directory
    base_dir = Path.cwd()
    data_dir = base_dir / "data"
    docs_dir = base_dir / "documents"

    # Create directories if they do not exist
    data_dir.mkdir(parents=True, exist_ok=True)
    docs_dir.mkdir(parents=True, exist_ok=True)

    print("Generating demo data...")

    # -------------------------------------------------------------------------
    # 1. Generate equipment_master.csv (300 rows)
    # -------------------------------------------------------------------------
    asset_types = ["Pump", "Motor", "Valve", "Compressor", "Transformer", "Boiler"]
    manufacturers = ["Siemens", "GE", "ABB", "Schneider Electric", "Emerson", "Honeywell"]
    plants = ["Plant Alpha", "Plant Beta", "Plant Gamma", "Plant Delta"]
    statuses = ["Active", "Inactive", "Under Maintenance"]
    criticalities = ["Low", "Medium", "High", "Critical"]

    # Generate 300 consistent asset IDs
    asset_ids = [f"AST-{str(i).zfill(4)}" for i in range(1, 301)]
    equipment_data = []
    
    for asset_id in asset_ids:
        atype = random.choice(asset_types)
        install_date = datetime.datetime(2015, 1, 1) + datetime.timedelta(days=random.randint(0, 3000))
        
        equipment_data.append({
            "asset_id": asset_id,
            "asset_name": f"{atype} {asset_id.split('-')[1]}",
            "asset_type": atype,
            "manufacturer": random.choice(manufacturers),
            "plant": random.choice(plants),
            "installation_date": install_date.strftime("%Y-%m-%d"),
            "status": random.choices(statuses, weights=[0.8, 0.1, 0.1], k=1)[0],
            "criticality": random.choice(criticalities)
        })
        
    df_eq = pd.DataFrame(equipment_data)
    df_eq.to_csv(data_dir / "equipment_master.csv", index=False)

    # -------------------------------------------------------------------------
    # 2. Generate maintenance_history.csv (400 rows)
    # -------------------------------------------------------------------------
    issues = [
        "Vibration anomaly", "Overheating", "Seal leakage", 
        "Bearing failure", "Calibration error", "Corrosion detected", 
        "Filter clogged", "Voltage drop"
    ]
    actions = [
        "Replaced bearing", "Tightened seals", "Recalibrated sensor", 
        "Cleaned filter", "Lubricated parts", "Replaced worn out parts", 
        "Complete overhaul", "Adjusted pressure"
    ]
    technicians = ["John Doe", "Jane Smith", "Bob Builder", "Alice Cooper", "Charlie Brown", "David Clark"]

    maint_data = []
    for i in range(1, 401):
        m_date = datetime.datetime(2023, 1, 1) + datetime.timedelta(days=random.randint(0, 900))
        maint_data.append({
            "maintenance_id": f"MNT-{str(i).zfill(4)}",
            "asset_id": random.choice(asset_ids),
            "maintenance_date": m_date.strftime("%Y-%m-%d"),
            "issue": random.choice(issues),
            "action_taken": random.choice(actions),
            "technician": random.choice(technicians),
            "downtime_hours": round(random.uniform(1.0, 48.0), 1),
            "cost": round(random.uniform(100.0, 5000.0), 2)
        })
        
    df_maint = pd.DataFrame(maint_data)
    df_maint.to_csv(data_dir / "maintenance_history.csv", index=False)

    # -------------------------------------------------------------------------
    # 3. Generate sensor_readings.csv (300 rows)
    # -------------------------------------------------------------------------
    sensor_data = []
    now = datetime.datetime.now()
    
    for _ in range(300):
        t_stamp = now - datetime.timedelta(minutes=random.randint(1, 10000))
        sensor_data.append({
            "timestamp": t_stamp.strftime("%Y-%m-%d %H:%M:%S"),
            "asset_id": random.choice(asset_ids),
            "temperature": round(random.uniform(20.0, 110.0), 1),
            "pressure": round(random.uniform(2.0, 15.0), 2),
            "vibration": round(random.uniform(0.2, 8.0), 2),
            "rpm": random.randint(900, 3000),
            "humidity": round(random.uniform(30.0, 90.0), 1)
        })
        
    df_sensor = pd.DataFrame(sensor_data)
    # Sort chronologically
    df_sensor = df_sensor.sort_values(by="timestamp", ascending=False)
    df_sensor.to_csv(data_dir / "sensor_readings.csv", index=False)

    # -------------------------------------------------------------------------
    # 4. Generate asset_relationships.csv (100 rows)
    # -------------------------------------------------------------------------
    relationships = ["connected_to", "powered_by", "feeds", "located_in", "controls"]
    rel_data = []
    
    for _ in range(100):
        src = random.choice(asset_ids)
        tgt = random.choice(asset_ids)
        while src == tgt:
            tgt = random.choice(asset_ids)  # Prevent self-referencing
            
        rel_data.append({
            "source_asset": src,
            "relationship": random.choice(relationships),
            "target_asset": tgt
        })
        
    df_rel = pd.DataFrame(rel_data)
    df_rel.to_csv(data_dir / "asset_relationships.csv", index=False)

    # -------------------------------------------------------------------------
    # 5. Generate Industrial Manuals (10 files)
    # -------------------------------------------------------------------------
    industrial_sentences = [
        "The equipment must be securely fastened to a level concrete foundation.",
        "Prior to startup, ensure all safety interlocks are functioning correctly.",
        "Inspect the mechanical seals for any signs of leakage or unusual wear.",
        "Bearing temperatures should not exceed 85 degrees Celsius under normal load.",
        "Lubricate all moving parts according to the schedule specified in the OEM guidelines.",
        "In case of abnormal vibration, shut down the unit immediately and inspect the coupling.",
        "Routine inspections include checking fluid levels, verifying pressures, and logging temperatures.",
        "Operators must wear appropriate personal protective equipment (PPE) when servicing the machine.",
        "Ensure the electrical connections are tight and free from corrosion.",
        "The control panel displays diagnostic codes that can be used to troubleshoot common faults.",
        "Replacement of filters should be performed every 500 operating hours.",
        "Calibration of sensors is critical to maintaining operational efficiency and safety.",
        "A drop in output pressure may indicate a clogged intake or internal bypass.",
        "Thermal imaging can be utilized to detect hot spots before catastrophic failure occurs.",
        "Maintain a detailed log of all maintenance activities to support warranty claims.",
        "Emergency stop buttons must be tested weekly to guarantee they respond instantly.",
        "The cooling system requires an unobstructed airflow to prevent the motor from overheating.",
        "During the break-in period, closely monitor vibration and thermal trends.",
        "Any modifications to the factory settings will void the warranty and may compromise safety.",
        "Follow standard lockout/tagout (LOTO) procedures before opening any access panels."
    ]

    manuals = [
        "pump_manual.txt",
        "motor_manual.txt",
        "valve_manual.txt",
        "compressor_manual.txt",
        "transformer_manual.txt",
        "boiler_manual.txt",
        "maintenance_guidelines.txt",
        "predictive_maintenance_guide.txt",
        "safety_manual.txt",
        "troubleshooting_guide.txt"
    ]

    for manual_name in manuals:
        title = manual_name.replace(".txt", "").replace("_", " ").upper()
        # Generate text of roughly 400 - 700 words
        target_words = random.randint(400, 700)
        
        text_content = f"{title}\n\n"
        word_count = len(text_content.split())
        
        while word_count < target_words:
            # Create a paragraph of 4 to 10 random sentences
            paragraph = " ".join(random.choices(industrial_sentences, k=random.randint(4, 10)))
            text_content += paragraph + "\n\n"
            word_count = len(text_content.split())
            
        # Write to file
        with open(docs_dir / manual_name, "w", encoding="utf-8") as f:
            f.write(text_content)

    # -------------------------------------------------------------------------
    # Print Summary
    # -------------------------------------------------------------------------
    print("\nGenerated:")
    print(f"equipment_master.csv ({len(df_eq)} rows)")
    print(f"maintenance_history.csv ({len(df_maint)} rows)")
    print(f"sensor_readings.csv ({len(df_sensor)} rows)")
    print(f"asset_relationships.csv ({len(df_rel)} rows)")
    print(f"\nGenerated {len(manuals)} industrial manuals in documents/ folder.")

if __name__ == "__main__":
    generate_demo_data()

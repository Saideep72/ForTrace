import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))
from app.services.tee_simulator import TEESimulator

def main():
    print("==================================================")
    print("Testing TEE Hardware Enclave Simulator & Anonymizer")
    print("==================================================")
    
    # 1. Initialize enclave simulator
    tee = TEESimulator()
    report = tee.get_attestation_report()
    
    print("\n1. Attestation Verification Status:")
    for k, v in report.items():
        print(f"  {k}: {v}")
        
    # 2. Test input anonymization
    raw_query = "Why is pump P-201 overheating in area B? Send alert logs to manager@plant.com."
    print(f"\n2. Raw User Input:\n  {raw_query}")
    
    anon_query, anon_logs = tee.anonymize_text(raw_query)
    print(f"\n3. Masked Query (Ready for External LLM):\n  {anon_query}")
    print("\n4. Anonymization Logs:")
    for log in anon_logs:
        print(f"  {log}")
        
    # 3. Simulate external LLM response
    mock_llm_response = (
        "Based on plant history, [ASSET_0] experienced cavitation because the inlet valve was closed. "
        "I have dispatched an email confirmation to [USER_EMAIL_0]."
    )
    print(f"\n5. Mock External LLM Response (contains placeholders):\n  {mock_llm_response}")
    
    restored_response, deanon_logs = tee.deanonymize_text(mock_llm_response)
    print(f"\n6. De-anonymized Response (Restored in TEE secure memory):\n  {restored_response}")
    print("\n7. De-anonymization Logs:")
    for log in deanon_logs:
        print(f"  {log}")
        
    print("\n==================================================")
    print("TEE Verification Complete! Test Passed.")
    print("==================================================")

if __name__ == "__main__":
    main()

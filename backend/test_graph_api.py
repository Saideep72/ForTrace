import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

# 1. Log in to get token
print("Logging in...")
login_payload = {
    "username": "manager@plant.com",
    "password": "Manager@123"
}
try:
    response = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
    if not response.ok:
        print(f"Login failed: {response.text}")
        exit()

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Graph Topology
    print("Fetching graph topology...")
    res = requests.get(f"{BASE_URL}/graph/topology", headers=headers)
    if not res.ok:
        print(f"Graph topology failed: {res.text}")
        exit()

    data = res.json()
    print("\n=== Graph Topology Retrieval Successful ===")
    print(f"Total Nodes: {len(data['nodes'])} (Assets & Documents)")
    print(f"Total Edges: {len(data['edges'])} (Asset Dependencies & Doc Links)")
    
    print("\nSample Nodes:")
    for node in data["nodes"][:5]:
         print(f"  - Group: [{node['group']}] | Label: '{node['label']}'")
         
    print("\nSample Edges:")
    for edge in data["edges"][:5]:
         print(f"  - From: {edge['from']} -> To: {edge['to']} | Label: '{edge['label']}'")
         
except Exception as e:
    print(f"Network error: {e}")

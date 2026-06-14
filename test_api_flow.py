import requests
import time

def run_test():
    print("1. Resetting Demo...")
    requests.post("http://localhost:8001/api/demo/reset")
    
    # Simulate Storefront Identity
    headers = {"Content-Type": "application/json"}
    
    # 1. First Add to Cart & Abandon
    print("2. First Cart Abandonment (Expected: WhatsApp)")
    requests.post("http://localhost:8001/api/cart/add", json={"customer_id": "CUST_DEMO_001", "product_id": "P101"}, headers=headers)
    requests.post("http://localhost:8001/api/cart/abandon", json={"customer_id": "CUST_DEMO_001"}, headers=headers)
    
    msg1 = requests.get("http://localhost:8001/api/messages/latest/CUST_DEMO_001").json()
    print("-> Latest Message Channel:", msg1.get("generated_message", {}).get("channel"))
    
    # 2. Second Add to Cart & Abandon
    print("3. Second Cart Abandonment (Expected: Push/SMS)")
    requests.post("http://localhost:8001/api/cart/add", json={"customer_id": "CUST_DEMO_001", "product_id": "P101"}, headers=headers)
    requests.post("http://localhost:8001/api/cart/abandon", json={"customer_id": "CUST_DEMO_001"}, headers=headers)
    
    msg2 = requests.get("http://localhost:8001/api/messages/latest/CUST_DEMO_001").json()
    print("-> Latest Message Channel:", msg2.get("generated_message", {}).get("channel"))
    
    # 3. Third Add to Cart & Abandon
    print("4. Third Cart Abandonment (Expected: Email)")
    requests.post("http://localhost:8001/api/cart/add", json={"customer_id": "CUST_DEMO_001", "product_id": "P101"}, headers=headers)
    requests.post("http://localhost:8001/api/cart/abandon", json={"customer_id": "CUST_DEMO_001"}, headers=headers)
    
    msg3 = requests.get("http://localhost:8001/api/messages/latest/CUST_DEMO_001").json()
    print("-> Latest Message Channel:", msg3.get("generated_message", {}).get("channel"))

if __name__ == "__main__":
    run_test()

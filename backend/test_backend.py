import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def check(name, req, expected_keys=[], expected_val=None):
    print(f"TEST: {name}")
    try:
        if req['method'] == 'POST':
            res = requests.post(f"{BASE_URL}{req['path']}", json=req.get('json'))
        else:
            res = requests.get(f"{BASE_URL}{req['path']}")
        
        if res.status_code != 200:
            print(f"FAIL: HTTP {res.status_code} - {res.text}")
            return
            
        data = res.json()
        
        if expected_val:
            for k, v in expected_val.items():
                curr = data
                for part in k.split('.'):
                    curr = curr.get(part, {}) if isinstance(curr, dict) else curr
                if curr != v:
                    print(f"FAIL: Expected {k}={v}, got {curr}")
                    return
        
        for key in expected_keys:
            if key not in str(data):
                print(f"FAIL: Expected {key} in response")
                return
                
        print("PASS")
    except Exception as e:
        print(f"FAIL: Exception {str(e)}")

print("Running tests...")

check("A: Reset", {"method": "POST", "path": "/demo/reset"}, 
      expected_val={"status": "reset", "customer.customer_id": "CUST_DEMO_001", "twin.journey_stage": "anonymous"})

check("B: Products", {"method": "GET", "path": "/products"}, 
      expected_keys=["Wireless Headphones"])

check("C: Initial Cart", {"method": "GET", "path": "/cart/CUST_DEMO_001"}, 
      expected_val={"status": "empty", "cart_value": 0})

check("D: Product View", {"method": "POST", "path": "/event", "json": {"event_type":"product_view","source":"storefront","device_id":"D88","properties":{"product_id":"P101","product_name":"Wireless Headphones","price":2499}}},
      expected_val={"updated_twin.journey_stage": "browsing"})

check("E: Add to Cart", {"method": "POST", "path": "/cart/add", "json": {"customer_id":"CUST_DEMO_001","product_id":"P101"}},
      expected_val={"cart.status": "active", "cart.cart_value": 2499, "event_result.updated_twin.journey_stage": "cart_active"})

check("F: Cart Abandon", {"method": "POST", "path": "/cart/abandon", "json": {"customer_id":"CUST_DEMO_001"}},
      expected_val={"cart.status": "abandoned", "event_result.updated_twin.journey_stage": "cart_abandoned"})

check("G: Second Cart Abandon", {"method": "POST", "path": "/cart/abandon", "json": {"customer_id":"CUST_DEMO_001"}},
      expected_keys=["generated_message"])

check("H: Latest Message", {"method": "GET", "path": "/messages/latest/CUST_DEMO_001"},
      expected_keys=["generated_message"])

check("I: Message Click", {"method": "POST", "path": "/messages/react", "json": {"customer_id":"CUST_DEMO_001","reaction":"clicked"}},
      expected_keys=["event_result"])

check("J: Purchase", {"method": "POST", "path": "/cart/purchase", "json": {"customer_id":"CUST_DEMO_001"}},
      expected_val={"cart.status": "purchased"})

check("K: Metrics", {"method": "GET", "path": "/metrics/summary"},
      expected_keys=["revenue_recovered"])

check("L1: Audience Segments", {"method": "GET", "path": "/audience/segments"},
      expected_keys=["segment"])

check("L2: Audience Heatmap", {"method": "GET", "path": "/audience/fatigue-heatmap"},
      expected_keys=["fatigue"])

check("M: Predictive Twin", {"method": "GET", "path": "/predictive/CUST_DEMO_001"},
      expected_keys=["impact_summary"])

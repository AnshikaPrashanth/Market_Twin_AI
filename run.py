import sys
import os
import uvicorn

# Append 'backend' directory to python runtime load path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, backend_path)

if __name__ == "__main__":
    print("Booting MarketTwin AI Core Engine Development Server...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)

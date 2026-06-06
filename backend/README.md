# MarketTwin AI - Core Backend Intelligence Engine

MarketTwin AI is a real-time event-driven customer intelligence and digital twin platform. It ingests customer event streams, resolves fragmented user identities into unified profiles, and maintains live, high-fidelity customer digital twin states to determine scoring indicators and recommended marketing triggers.

---

## Technical Stack
- **Web Framework**: FastAPI (Python 3.11+)
- **Data Analysis**: Pandas, NumPy
- **Object Mapping / DB**: SQLAlchemy with SQLite
- **Validation**: Pydantic v2
- **Environment Handling**: Pydantic Settings

---

## Directory Architecture

```
backend/
├── app/
│   ├── main.py                # App entrypoint and startup configurations
│   ├── core/                  # Core logs, configs, and constants
│   ├── api/                   # Router declarations and route dependencies
│   ├── models/                # SQLAlchemy database models
│   ├── schemas/               # Input/Output validation Pydantic models
│   ├── services/              # Modularity services logic
│   │   ├── event_service/     # Validator, normalizer, store, and processor
│   │   ├── identity_service/  # Deterministic, probabilistic, confidence engines
│   │   └── twin_service/      # Metrics scoring, journey transitions, segmentation
│   ├── shared/                # EventBus, Storage fallbacks, cache Providers
│   └── database/              # SQLite connection setup and demo data seeds
├── requirements.txt           # Dependency mapping
└── README.md                  # Documentation
```

---

## Core Algorithmic Details

### 1. Identity Confidence Scoring
When exact email or phone hashes are not matching (deterministic lookup failed), the engine triggers **Probabilistic Matching** against registered customer profiles:
- **Same Location / City**: `+15`
- **Same Device Type**: `+30`
- **Product Category Overlap**: `+25`
- **Hourly Pattern Overlap**: `+20`

*Threshold for linking*: **Score >= 70**

### 2. Behavioral scoring models
- **Intent Score**: $\min(100, \text{views} \times 3 + \text{carts} \times 20 + \text{repeated\_views} \times 10 + \text{recent\_activity} \times 15)$
- **Churn Risk**: $\max(0, \min(100, \text{inactive\_days} \times 2 + \text{ignored\_messages} \times 10 + \text{abandonments} \times 15 - \text{purchases} \times 20))$
- **Fatigue Score**: $\max(0, \min(100, \text{messages\_last\_48h} \times 20 - \text{clicks\_last\_48h} \times 10))$
- **Conversion Probability**: $\max(0, \min(100, 0.4 \times \text{intent\_score} + 0.3 \times \text{channel\_affinity} + 0.2 \times \text{discount\_affinity} - 0.1 \times \text{fatigue\_score}))$

---

## API Documentation

### Ingest Customer Event
`POST /api/event`

**Request Payload**:
```json
{
  "event_type": "add_to_cart",
  "source": "website",
  "identifiers": {
    "device_id": "DEV_88",
    "email": "user@example.com"
  },
  "properties": {
    "product_id": "P101",
    "category": "Headphones",
    "price": 2999
  }
}
```

**Response Payload**:
```json
{
  "status": "processed",
  "event_id": "EVT_A1B2C3D4",
  "customer_id": "CUST_9918237F",
  "updated_twin": {
    "customer_id": "CUST_9918237F",
    "journey_stage": "cart_active",
    "intent_score": 38,
    "churn_risk": 0,
    "fatigue_score": 0,
    "conversion_probability": 45,
    "segment": "Standard Customer",
    "preferred_channel": "website",
    "next_best_action": "recommend_checkout",
    "raw_counters": { ... },
    "updated_at": "2026-06-06T11:45:00+00:00"
  }
}
```

### Additional Endpoints
- `GET /api/customer/{customer_id}`: Fetch demographics profile.
- `GET /api/customer/{customer_id}/twin`: Fetch live Digital Twin state.
- `GET /api/customer/{customer_id}/events`: Fetch historical event logs.
- `GET /api/health`: Verify system connection readiness.

---

## Running the Application

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Database Migrations & Seed Data
Startup events automatically trigger database table creation and seed data loading.

### 3. Launch Development Server
From the workspace root directory:
```bash
python run.py
```
Server is hosted locally on [http://127.0.0.1:8000](http://127.0.0.1:8000). Interactive Swagger API documentation can be viewed at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

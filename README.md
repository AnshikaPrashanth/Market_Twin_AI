# MarketTwin AI

## Real-Time Omnichannel Customer Intelligence & Digital Twin Platform

MarketTwin AI is a real-time event-driven customer intelligence platform that simulates how modern enterprise Customer Data Platforms (CDPs) and personalization systems work.

The project continuously:

* ingests customer behavior events,
* resolves customer identity across channels,
* maintains a live digital twin,
* tracks customer journey stages,
* calculates behavioral intelligence scores,
* and updates a realtime analytics dashboard.

The system architecture is inspired by platforms such as:

* Salesforce CDP
* Adobe Experience Platform
* Segment Personas
* Braze
* MoEngage
* Insider

---

# Core Architecture

```text id="mjlwm6"
Customer Interaction Layer (Storefront)
            ↓
Event Generation
            ↓
FastAPI Event Service
            ↓
Identity Resolution Engine
            ↓
Digital Twin Engine
            ↓
Realtime Dashboard / Visualization Layer
```

---

# Features Implemented So Far

## 1. Event-Driven Architecture

Implemented a realtime event processing system where customer actions generate events dynamically.

Supported events:

* session_start
* product_view
* add_to_cart
* remove_from_cart
* cart_abandon
* purchase
* email_open
* email_click
* whatsapp_click
* push_click

---

## 2. Identity Resolution Engine

Implemented omnichannel customer identity resolution.

Features:

* deterministic matching
* unified customer IDs
* identity graph mapping
* device persistence
* cross-event customer linking

Example:

```text id="wjlwm2"
DEV_88
EMAIL_991
PHONE_771
        ↓
CUST_001
```

---

## 3. Digital Twin Engine

Implemented realtime customer state intelligence.

The digital twin continuously updates:

* intent score
* churn risk
* fatigue score
* conversion probability
* journey stage
* customer segment
* next best action

Example journey transitions:

```text id="0jlwm7"
anonymous
→ browsing
→ cart_active
→ cart_abandoned
→ converted
```

---

## 4. Customer Journey State Machine

Implemented event-driven journey stage transitions.

Examples:

* browsing
* interested
* cart_active
* cart_abandoned
* converted
* dormant
* churn_risk

---

## 5. Next Best Action (NBA) Logic

Implemented rule-based decision intelligence.

Example:

```text id="4jlwm2"
High Intent + Cart Abandonment
→ Recommend Coupon
```

---

## 6. Realtime Dashboard / Control Room

Implemented frontend visualization layer.

Features:

* live digital twin monitoring
* realtime score updates
* journey timeline visualization
* identity graph visualization
* backend health monitor
* raw API response viewer
* event logs

---

## 7. Mini Ecommerce Storefront

Implemented simplified ecommerce storefront to generate REAL behavioral events.

Features:

* product browsing
* product detail pages
* add to cart
* remove from cart
* checkout flow
* cart abandonment simulation

All customer actions automatically generate backend events.

---

# Tech Stack

## Frontend

* React
* Vite
* TailwindCSS
* Zustand
* Axios
* Framer Motion

## Backend

* FastAPI
* Python
* Pydantic
* SQLite
* SQLAlchemy

---

# Project Structure

```text id="5jlwm4"
MarketTwin-AI/
│
├── frontend/
│
├── backend/
│
├── README.md
│
└── .gitignore
```

---

# Backend Architecture

```text id="6jlwm5"
Event Service
    ↓
Identity Resolution Service
    ↓
Digital Twin Service
    ↓
Next Best Action Engine
```

---

# Running The Project
python run.py

# Frontend Setup

## Step 1 — Open frontend folder

```bash id="9jlwm6"
cd frontend
```

## Step 2 — Install dependencies

```bash id="2jlwm6"
npm install
```

## Step 3 — Run frontend

```bash id="4jlwm5"
npm run dev
```


---

# How The System Works

## Step 1 — Customer interacts with storefront

Examples:

* views product
* adds to cart
* abandons cart
* purchases

---

## Step 2 — Frontend generates events automatically

Example:

```json id="9jlwm5"
{
  "event_type": "add_to_cart",
  "device_id": "DEV_88"
}
```

---

## Step 3 — Backend processes event

Flow:

```text id="2jlwm5"
Event Service
→ Identity Resolution
→ Digital Twin Update
→ NBA Engine
```

---

## Step 4 — Dashboard updates live

UI updates:

* intent score
* journey stage
* timeline
* customer segment
* next best action

---

# Current Status

## Implemented

* event ingestion
* identity resolution
* realtime digital twin
* journey engine
* ecommerce event generation
* realtime frontend dashboard
* NBA logic
* timeline visualization
* identity graph visualization

---

## Planned Future Enhancements

* ML-based churn prediction
* recommendation engine
* campaign orchestration
* Kafka event streaming
* Redis realtime cache
* WebSocket realtime updates
* advanced analytics
* multi-channel simulations
* AI-generated campaigns

---

# Demo Flow

Recommended demo sequence:

1. Open storefront
2. Browse products
3. Add product to cart
4. Wait for cart abandonment
5. Watch dashboard update
6. Return and purchase
7. Observe journey transition and score updates

---

# Authors

Built as a realtime customer intelligence and digital twin platform project.

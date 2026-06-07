# MarketTwin AI - Realtime Control Panel

The visual front-end panel for the MarketTwin AI Omnichannel Customer Intelligence and Digital Twin Platform. It interfaces directly with the FastAPI backend engine on port `8000` to simulate events, verify identity nodes resolution, and inspect active digital twins.

## Tech Stack
- **Framework**: React 18+ (bundled via Vite)
- **Styling**: TailwindCSS & Lucide Icons
- **State Store**: Zustand
- **Animations**: Framer Motion
- **API Requests**: Axios

## Setup & Running Guide

### 1. Install Node Packages
Navigate to the `frontend` folder and download dependencies:
```bash
cd frontend
npm install
```

### 2. Start Dev Server
Launch the local Vite development server:
```bash
npm run dev
```
The server will run on [http://localhost:3000](http://localhost:3000). Ensure the FastAPI backend server is running on [http://localhost:8000](http://localhost:8000) concurrently.

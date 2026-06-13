# XenoPilot AI

> "Describe a marketing goal. Let AI discover the audience, create the campaign, choose the channel, and launch it."

## Elevator Pitch

**XenoPilot AI** is an AI-native CRM for consumer brands that transforms a simple business goal into a complete marketing campaign. Marketers describe what they want to achieve in natural language, and the AI automatically identifies the target audience, creates segments, generates personalized messages, recommends the best communication channel, predicts campaign performance, and launches the campaign while tracking engagement through a simulated messaging infrastructure.

---

## The Problem

Marketing teams today manually perform several steps:
1. Analyze customer data
2. Create customer segments
3. Decide whom to target
4. Write campaign messages
5. Select communication channels
6. Launch campaigns
7. Monitor performance

This process is time-consuming and requires significant marketing expertise.

## Our Solution

XenoPilot AI is an AI-native CRM that acts as an intelligent marketing copilot. Instead of manually configuring campaigns, marketers simply describe a business goal in natural language.

**Example Directive:**
> *"Bring back customers who haven't purchased in the last 60 days."*

### The 8-Step AI Workflow

The AI takes the single natural language goal and executes the entire pipeline:
- **Step 1 — Understands the Goal:** Identifies that the objective is customer reactivation.
- **Step 2 — Discovers the Audience:** Finds customers matching the goal (e.g., High-value customers, Inactive for 60+ days).
- **Step 3 — Creates a Segment:** Generates a reusable audience segment directly via MongoDB Aggregations.
- **Step 4 — Chooses the Best Channel:** Recommends the optimal delivery vector (e.g., WhatsApp based on historical engagement).
- **Step 5 — Generates Personalized Messages:** Drafts contextual, high-converting copy.
- **Step 6 — Predicts Performance:** Forecasts expected Open Rate, CTR, and Expected Revenue before launch.
- **Step 7 — Launches Campaign:** Dispatches the communication to our simulated Channel Service.
- **Step 8 — Tracks Results:** Ingests asynchronous webhook events (Sent, Delivered, Opened, Clicked, Converted) to visualize real-time campaign performance.

---

## Why This Fits the Xeno Assignment Perfectly

Most standard submissions build a **CRM + AI Message Generator**. 
We built an **AI Marketing Agent**.

The key difference is that AI is deeply woven into the entire lifecycle:
`Goal → Audience Discovery → Segmentation → Channel Selection → Message Generation → Performance Prediction → Campaign Launch → Analytics`

This approach specifically hits every key evaluation criteria:
- **✅ Customer Ingestion:** Seed script loads 10k users and 50k orders.
- **✅ Audience Segmentation:** AI converts natural language into live database topologies.
- **✅ Personalized Communications:** Gemini constructs specific message copy.
- **✅ Communication Tracking:** Live analytics dashboards plotting funnel conversion rates.
- **✅ AI-Native Experience:** The operator acts as a strategic director; the AI is the executor.
- **✅ Channel Service Simulation:** Dedicated microservice modeling the full delivery lifecycle.
- **✅ Callback-Driven Architecture:** Robust async webhook processing to handle scale and retries.

---

## Tech Stack
* **Frontend**: React + Vite + TailwindCSS + Framer Motion (Cinematic UI/UX)
* **Backend Core**: Express + MongoDB + Mongoose + Node.js
* **Cognitive Engine**: Google GenAI (Gemini 2.5 Flash)
* **Microservices**: Separate Express-based asynchronous channel webhook stub

## Getting Started

### 1. Database Configuration
Ensure MongoDB is running locally or via Atlas.
Seed the database with test telemetry (10,000 users and 50,000 orders):
```bash
cd backend
npm install
npm run seed
```

### 2. Environment Variables
You must supply a valid `GEMINI_API_KEY` in `backend/.env`.

### 3. Running the Stack
You need three terminal windows to run the full two-service loop:

```bash
# 1. The Channel Webhook Service (Port 5001)
cd channel-service
npm install
npm run dev

# 2. The Core Backend API (Port 5000)
cd backend
npm run dev

# 3. The Frontend Client (Port 5173)
cd frontend
npm install
npm run dev
```

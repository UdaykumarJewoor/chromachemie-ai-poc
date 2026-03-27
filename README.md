# 🤖 Chromachemie AI PO Validation
**AI-Powered Purchase Order Validation System — v2.0**
Built by PGC Digital | March 2026

---

## What Changed from POC v1 → AI v2

| Feature | v1 (Static POC) | v2 (AI-Powered) |
|---------|----------------|----------------|
| Read PO | ❌ Type manually | ✅ Upload PDF |
| Extract fields | ❌ You fill form | ✅ AI extracts all 15+ fields |
| Product matching | ❌ Exact CAS match only | ✅ Fuzzy: "Aspirin Ref Std" = "Aspirin Reference Standard" |
| Master data | ❌ Hardcoded in JS | ✅ Editable via dashboard |
| Validation | ❌ 15 IF-ELSE rules | ✅ AI reasoning with context |
| Add products | ❌ Edit source code | ✅ Add via UI |
| Insights | ❌ None | ✅ AI explains why it passed/failed |

---

## 📁 Project Structure

```
chromachemie-ai-poc/
├── mock-erp-server/          ← Node.js AI Backend
│   ├── server.js             ← Express entry point
│   ├── package.json
│   ├── .env.example          ← Copy to .env and add your key
│   ├── create-sample-pos.js  ← Generate test POs
│   ├── ai-agents/
│   │   └── poValidationAgent.js  ← 🤖 OpenAI GPT agent (THE BRAIN)
│   ├── routes/
│   │   ├── ocr.js            ← PDF upload + AI extract + validate
│   │   ├── purchaseOrders.js ← PO log CRUD
│   │   ├── products.js       ← Product master CRUD
│   │   ├── customers.js      ← Customer master CRUD
│   │   └── stats.js          ← Dashboard stats
│   └── services/
│       └── database.js       ← In-memory store (swap with DB in production)
│
├── poc-dashboard/
│   └── chromachemie_ai_dashboard.html  ← Standalone UI (open in browser!)
│
└── README.md
```

---

## 🚀 Quick Start

### Step 1: Set up the server

```bash
cd mock-erp-server
npm install
cp .env.example .env
```

### Step 2: Add your OpenAI key

Edit `.env`:
```
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Step 3: Start the server

```bash
node server.js
# Server runs on http://localhost:3001
```

You should see:
```
🚀 Chromachemie AI PO Validation Server
   Running at: http://localhost:3001
   AI Mode:    ✅ ENABLED (OpenAI)
   Model:      gpt-4o-mini
```

### Step 4: Open the dashboard

Open `poc-dashboard/chromachemie_ai_dashboard.html` in your browser.

Click **Check** to connect. You'll see the AI status badge turn green.

---

## 🧪 Testing

### Test with JSON (no PDF needed)

```bash
# Generate sample POs
node create-sample-pos.js

# Test GOOD PO (should score 90%+ → GREEN)
curl -X POST http://localhost:3001/api/ocr/validate-json \
  -H "Content-Type: application/json" \
  -d @sample-pos/good-po.json

# Test BAD PO (should score <70% → RED)
curl -X POST http://localhost:3001/api/ocr/validate-json \
  -H "Content-Type: application/json" \
  -d @sample-pos/bad-po.json
```

### Test with a real PDF

Upload any pharmaceutical PO PDF through the dashboard.
The AI will:
1. Extract text from the PDF
2. Parse all fields (CAS number, product name, GST, etc.)
3. Validate against master data with fuzzy matching
4. Return GREEN / AMBER / RED with explanation

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Server status + AI enabled check |
| POST | /api/ocr/upload | **Upload PDF → AI extract + validate** |
| POST | /api/ocr/validate-json | Validate a JSON PO directly |
| GET | /api/po/all | Full PO validation log |
| GET | /api/po/pending | Only RED/AMBER POs |
| POST | /api/po/:id/approve | Approve a PO |
| POST | /api/po/:id/reject | Reject a PO |
| GET | /api/products | List all products |
| POST | /api/products | Add a product |
| PUT | /api/products/:id | Update a product |
| DELETE | /api/products/:id | Delete a product |
| GET | /api/customers | List all customers |
| POST | /api/customers | Add a customer |
| GET | /api/stats | Dashboard statistics |

---

## 📊 What the AI Validates (15 checks)

| ID | Check | Severity |
|----|-------|----------|
| P01 | CAS Number exists in product master | HIGH |
| P02 | Product name matches CAS record (fuzzy) | HIGH |
| P03 | Pack size matches master specification | HIGH |
| P04 | Pharmacopoeia compliance (USP/EP/BP) | HIGH |
| P05 | Lot number format validity | HIGH |
| P06 | HSN code matches product category | HIGH |
| C01 | Customer name found in customer master | HIGH |
| C02 | GST number format valid | HIGH |
| C03 | Bill-to address matches customer master | HIGH |
| C04 | Ship-to address valid for this customer | HIGH |
| C05 | Transaction type specified (B2B/B2C) | HIGH |
| C06 | PO number present and formatted | HIGH |
| C07 | PO date reasonable (not >90 days old) | HIGH |
| C08 | Quantity is positive and reasonable | MEDIUM |
| C09 | Unit price specified | MEDIUM |

---

## ⚙️ Managing Master Data

**No more hardcoded arrays.** Add/remove products and customers:

1. Via the dashboard → "Master Data" button
2. Via the REST API (see endpoints above)
3. By editing `services/database.js` (the data layer)

---

## 🛠 Production Migration Path

| POC Component | Production Replacement | Change Needed |
|---------------|----------------------|---------------|
| In-memory store | PostgreSQL / MongoDB | Swap `database.js` |
| pdf-parse OCR | AWS Textract / Azure Form Recognizer | Swap in `ocr.js` |
| OpenAI GPT-4o-mini | Azure OpenAI / on-premise | Change `.env` |
| Local server | Docker / Cloud Run | Containerize |
| JSON master data | SAP ERP / Google Sheets API | Swap `database.js` |

**Key principle:** All AI agent prompts are model-agnostic. Changing the LLM only requires updating `.env`.

---

## 💰 Cost

| Component | Cost |
|-----------|------|
| Node.js server | Free |
| OpenAI GPT-4o-mini | ~$0.002 per PO validation |
| 200 POs/day | ~$0.40/day = ~$12/month |
| Dashboard | Free |

---

## 🔧 Troubleshooting

**"AI extraction failed"** → Check `OPENAI_API_KEY` in `.env`

**"PDF appears to be scanned"** → Use a text-based PDF (not a scanned image)

**Server won't start** → Run `npm install` first

**Dashboard shows "Server offline"** → Make sure `node server.js` is running

# Chromachemie AI PO Validation

AI-powered system for validating Purchase Orders (POs) using automated extraction and intelligent validation.

---

## Overview

This project provides a backend service and dashboard to:

* Upload Purchase Order PDFs
* Extract structured data automatically
* Validate against master data
* Provide clear validation results with reasoning

The system replaces manual validation and rule-based logic with AI-assisted processing.

---

## Key Features

* Upload and process PDF purchase orders
* Automatic field extraction (15+ fields)
* Intelligent product matching (supports fuzzy matching)
* Master data management via UI and APIs
* AI-based validation with detailed explanations
* Dashboard for monitoring and insights

---

## Project Structure

```
chromachemie-ai-poc/
├── mock-erp-server/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── ai-agents/
│   └── .env
│
├── poc-dashboard/
│   └── chromachemie_ai_dashboard.html
│
└── README.md
```

---

## Getting Started

### 1. Install dependencies

```bash
cd mock-erp-server
npm install
```

### 2. Configure environment

Create a `.env` file:

```
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
PORT=3001
```

### 3. Start the server

```bash
node server.js
```

Server will run at:

```
http://localhost:3001
```

---

## Using the Dashboard

Open the dashboard file in your browser:

```
poc-dashboard/chromachemie_ai_dashboard.html
```

Use it to:

* Upload PDFs
* View validation results
* Manage master data

---

## API Endpoints

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | /health                | Check server status     |
| POST   | /api/ocr/upload        | Upload and validate PDF |
| POST   | /api/ocr/validate-json | Validate JSON data      |
| GET    | /api/po/all            | Fetch all POs           |
| GET    | /api/products          | Get product list        |
| POST   | /api/products          | Add product             |
| GET    | /api/customers         | Get customers           |

---

## Validation Checks

The system validates:

* Product and CAS number matching
* Customer and GST validation
* Address consistency
* Quantity and pricing
* PO format and date validity

---

## Testing

### Generate sample data

```bash
node create-sample-pos.js
```

### Validate sample JSON

```bash
curl -X POST http://localhost:3001/api/ocr/validate-json \
  -H "Content-Type: application/json" \
  -d @sample-pos/good-po.json
```

---

## Notes

* Ensure `OPENAI_API_KEY` is configured
* Use text-based PDFs for best results
* This project uses in-memory storage (can be replaced with a database)

---

## Future Improvements

* Replace in-memory storage with database
* Integrate advanced OCR services
* Deploy using Docker or cloud platforms

---

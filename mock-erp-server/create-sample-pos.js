/**
 * Sample PO Generator
 * Creates realistic pharma PO text files for testing
 * Run: node create-sample-pos.js
 * This creates .txt files you can test the API with via /api/ocr/validate-json
 */

const fs = require('fs');
const path = require('path');

const goodPO = {
  poNumber: "PO-LUP-2024-00456",
  poDate: "2024-03-25",
  customerName: "Lupin Limited",
  gstNumber: "27AABCL1234B1ZA",
  billTo: "Kalina, Santacruz East, Mumbai, Maharashtra 400055",
  shipTo: "Plot No. D-7, MIDC Chikalthana, Aurangabad, Maharashtra 431210",
  casNumber: "50-78-2",
  productName: "Aspirin Reference Standard",
  pharmacopoeia: "USP",
  packSize: "200mg",
  lotNumber: "LOT-USP-2024-0342",
  hsnCode: "29420090",
  quantity: 5,
  unitPrice: 12500,
  totalValue: 62500,
  currency: "INR",
  transactionType: "B2B",
  paymentTerms: "Net 30",
  deliveryTerms: "Ex-Works Mumbai"
};

const badPO = {
  poNumber: "PO-BIO-2024-00789",
  poDate: "2024-03-20",
  customerName: "Biocon Limited",
  gstNumber: "29AABCB1234C1ZB",
  billTo: "Pune, Maharashtra", // WRONG - should be Bengaluru
  shipTo: "Hyderabad, Telangana", // WRONG
  casNumber: "57-27-2",
  productName: "Morphine Sulphate",  // fuzzy - slightly different spelling
  pharmacopoeia: "USP",  // WRONG - should be EP
  packSize: "100mg",     // WRONG - should be 50mg
  lotNumber: "LOT-EP-2024-0871",
  hsnCode: "29399990",
  quantity: 2,
  unitPrice: 45000,
  totalValue: 90000,
  currency: "INR",
  transactionType: "B2B"
};

// Create sample-pos directory
const dir = path.join(__dirname, 'sample-pos');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

fs.writeFileSync(path.join(dir, 'good-po.json'), JSON.stringify(goodPO, null, 2));
fs.writeFileSync(path.join(dir, 'bad-po.json'), JSON.stringify(badPO, null, 2));

// Create realistic-looking PO text (simulates OCR output)
const goodPOText = `
PURCHASE ORDER

To:
Chromachemie Laboratory Pvt. Ltd.
Mumbai, Maharashtra

From:
LUPIN LIMITED
Kalina, Santacruz East
Mumbai, Maharashtra - 400055
GST: 27AABCL1234B1ZA

PO Number: PO-LUP-2024-00456
PO Date: 25-Mar-2024

BILL TO:
Lupin Limited
Kalina, Santacruz East
Mumbai, Maharashtra - 400055

SHIP TO:
Lupin Limited - QC Lab
Plot No. D-7, MIDC Chikalthana
Aurangabad, Maharashtra - 431210

-------------------------------------------------------------------
| Item | Description                    | Qty | Unit Price | Total |
-------------------------------------------------------------------
|  1   | Aspirin Reference Standard USP  |  5  | INR 12,500 | 62,500|
|      | CAS: 50-78-2                    |     |            |       |
|      | Pack Size: 200mg                |     |            |       |
|      | Lot No: LOT-USP-2024-0342       |     |            |       |
|      | HSN Code: 29420090              |     |            |       |
-------------------------------------------------------------------
                                    Total: INR 62,500/-

Transaction Type: B2B
Payment Terms: Net 30 Days
Delivery: Ex-Works Mumbai

Authorized Signatory
Lupin Limited
`;

fs.writeFileSync(path.join(dir, 'good-po-ocr-text.txt'), goodPOText);

console.log('✅ Sample POs created in ./sample-pos/');
console.log('\nTest with API:');
console.log('  curl -X POST http://localhost:3001/api/ocr/validate-json \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d @sample-pos/good-po.json\n');
console.log('  curl -X POST http://localhost:3001/api/ocr/validate-json \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d @sample-pos/bad-po.json\n');

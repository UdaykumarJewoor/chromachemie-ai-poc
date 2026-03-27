/**
 * AI PO Validation Agent
 * Uses OpenAI GPT to:
 * 1. Extract structured data from raw PDF text
 * 2. Validate against master data (fuzzy, not hardcoded)
 * 3. Produce scored validation report with explanations
 */

const OpenAI = require('openai');

class POValidationAgent {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY not set. AI features disabled.');
      this.client = null;
    } else {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    }
  }

  /**
   * Extract structured PO fields from raw PDF text using AI
   */
  async extractPOFromText(rawText) {
    if (!this.client) throw new Error('OpenAI API key not configured');

    const prompt = `You are an expert document extraction AI for pharmaceutical purchase orders in India.
    
Extract ALL purchase order fields from the following raw text. The text may be messy, have OCR artifacts, 
or use abbreviations. Use your knowledge to interpret pharmaceutical terminology correctly.

Raw PO Text:
---
${rawText}
---

Return ONLY a valid JSON object with these fields (use null if not found):
{
  "poNumber": "string",
  "poDate": "YYYY-MM-DD format",
  "customerName": "string - full company name",
  "gstNumber": "string - GST registration number (format: 2 digits + PAN + 1 digit + Z + 1 digit)",
  "billTo": "string - billing address",
  "shipTo": "string - shipping address",
  "casNumber": "string - CAS registry number (format: digits-digits-digit)",
  "productName": "string - full product name",
  "pharmacopoeia": "string - USP, EP, BP, IP, or JP",
  "packSize": "string - e.g., 200mg, 5g, 100mL",
  "lotNumber": "string",
  "hsnCode": "string - HSN/SAC code",
  "quantity": "number",
  "unitPrice": "number in INR",
  "totalValue": "number in INR",
  "currency": "string - default INR",
  "transactionType": "string - B2B or B2C",
  "deliveryTerms": "string if present",
  "paymentTerms": "string if present"
}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Validate extracted PO against master data using AI
   * AI handles fuzzy matching - "Aspirin USP Std" matches "Aspirin Reference Standard USP"
   */
  async validatePO(poData, masterData) {
    if (!this.client) throw new Error('OpenAI API key not configured');

    const prompt = `You are a pharmaceutical compliance validation AI for Chromachemie Laboratory Pvt. Ltd.

Validate the Purchase Order against the master data. Use intelligent fuzzy matching - 
abbreviated product names, alternate spellings, and equivalent descriptions should match.

PURCHASE ORDER TO VALIDATE:
${JSON.stringify(poData, null, 2)}

MASTER DATA (Products, Customers):
${JSON.stringify(masterData, null, 2)}

Run ALL 15 validation checks. For each check:
- Use semantic understanding, not just exact string matching
- "Aspirin Ref Std" should match "Aspirin Reference Standard"  
- GST numbers may have spaces or hyphens - normalize before comparing
- Pack sizes: "200 mg" = "200mg" = "0.2g" (for some contexts)
- Pharmacopoeia: "United States Pharmacopoeia" = "USP"

Return ONLY valid JSON:
{
  "overallScore": <0-100 integer>,
  "overallStatus": <"GREEN" | "AMBER" | "RED">,
  "summary": "brief human-readable summary",
  "checks": [
    {
      "id": "P01",
      "name": "CAS Number in Master",
      "severity": "HIGH",
      "status": "PASS" | "FAIL" | "WARN",
      "poValue": "<what was in the PO>",
      "masterValue": "<what master data says>",
      "message": "explanation of pass/fail"
    }
  ],
  "aiInsights": [
    "insight about this PO..."
  ],
  "recommendedAction": "AUTO_APPROVE" | "REVIEW" | "REJECT",
  "flags": ["list of specific issues if any"]
}

Required checks (run all 15):
P01 - CAS Number exists in product master
P02 - Product name matches CAS record (fuzzy match ok)
P03 - Pack size matches master specification
P04 - Pharmacopoeia compliance (USP/EP/BP/IP matches master)
P05 - Lot number format validity
P06 - HSN code matches product category
C01 - Customer name found in customer master
C02 - GST number format valid (2 state code + 10 PAN + 1Z1)
C03 - Bill-to address matches customer master
C04 - Ship-to address is a valid delivery location for this customer
C05 - Transaction type specified (B2B or B2C)
C06 - PO number present and properly formatted
C07 - PO date present and not in the past >90 days or future >30 days
C08 - Quantity is positive and reasonable
C09 - Unit price is specified and reasonable for this product type`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Full pipeline: raw text → extract → validate → report
   */
  async processRawText(rawText, masterData) {
    const extracted = await this.extractPOFromText(rawText);
    const validation = await this.validatePO(extracted, masterData);
    return { extracted, validation };
  }
}

module.exports = new POValidationAgent();

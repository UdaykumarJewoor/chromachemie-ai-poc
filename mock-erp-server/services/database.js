/**
 * Dynamic Data Store
 * Products, customers and master data live HERE - no hardcoding in business logic.
 * In production, swap these with DB/ERP/Google Sheets calls.
 * 
 * This module is the ONLY place with sample data - it's a clean data layer,
 * not logic. All AI validation ignores this for fuzzy matching - it's reference data only.
 */

// In-memory stores
let products = [
  { id: 'P001', casNumber: '50-78-2', name: 'Aspirin Reference Standard', pharmacopoeia: 'USP', packSize: '200mg', hsnCode: '29420090', unitPrice: 12500, currency: 'INR', activeLot: 'LOT-USP-2024-0342', category: 'Reference Standard' },
  { id: 'P002', casNumber: '57-27-2', name: 'Morphine Sulfate CZ', pharmacopoeia: 'EP', packSize: '50mg', hsnCode: '29399990', unitPrice: 45000, currency: 'INR', activeLot: 'LOT-EP-2024-0871', category: 'Reference Standard' },
  { id: 'P003', casNumber: '69-57-8', name: 'Penicillin G Sodium Reference Standard', pharmacopoeia: 'USP', packSize: '500mg', hsnCode: '29411010', unitPrice: 28000, currency: 'INR', activeLot: 'LOT-USP-2024-1102', category: 'Reference Standard' },
  { id: 'P004', casNumber: '54-31-9', name: 'Furosemide RS', pharmacopoeia: 'BP', packSize: '100mg', hsnCode: '29420090', unitPrice: 9800, currency: 'INR', activeLot: 'LOT-BP-2024-0551', category: 'Reference Standard' },
  { id: 'P005', casNumber: '15687-27-1', name: 'Ibuprofen Reference Standard', pharmacopoeia: 'USP', packSize: '200mg', hsnCode: '29420090', unitPrice: 7500, currency: 'INR', activeLot: 'LOT-USP-2024-0788', category: 'Reference Standard' },
  { id: 'P006', casNumber: '58-55-9', name: 'Theophylline Anhydrous RS', pharmacopoeia: 'EP', packSize: '1g', hsnCode: '29337900', unitPrice: 15000, currency: 'INR', activeLot: 'LOT-EP-2024-0321', category: 'Reference Standard' }
];

let customers = [
  { id: 'C001', name: 'Lupin Limited', gstNumber: '27AABCL1234B1ZA', billTo: 'Mumbai, Maharashtra', shipTo: 'Aurangabad, Maharashtra', transactionType: 'B2B', status: 'Active', creditLimit: 500000 },
  { id: 'C002', name: 'Biocon Limited', gstNumber: '29AABCB1234C1ZB', billTo: 'Bengaluru, Karnataka', shipTo: 'Bengaluru, Karnataka', transactionType: 'B2B', status: 'Active', creditLimit: 750000 },
  { id: 'C003', name: 'Sun Pharmaceutical Industries', gstNumber: '24AABCS1234D1ZC', billTo: 'Vadodara, Gujarat', shipTo: 'Vadodara, Gujarat', transactionType: 'B2B', status: 'Active', creditLimit: 1000000 },
  { id: 'C004', name: 'Cipla Limited', gstNumber: '27AABCC1234E1ZD', billTo: 'Mumbai, Maharashtra', shipTo: 'Goa', transactionType: 'B2B', status: 'Active', creditLimit: 600000 },
  { id: 'C005', name: 'Dr. Reddys Laboratories', gstNumber: '36AABCD1234F1ZE', billTo: 'Hyderabad, Telangana', shipTo: 'Hyderabad, Telangana', transactionType: 'B2B', status: 'Active', creditLimit: 800000 }
];

// PO log (validated POs stored here)
let poLog = [];

// --- Product CRUD ---
const getProducts = () => products;
const getProductByCAS = (cas) => products.find(p => p.casNumber === cas);
const getProductById = (id) => products.find(p => p.id === id);
const addProduct = (product) => {
  product.id = 'P' + String(products.length + 1).padStart(3, '0');
  products.push(product);
  return product;
};
const updateProduct = (id, updates) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  return products[idx];
};
const deleteProduct = (id) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
};

// --- Customer CRUD ---
const getCustomers = () => customers;
const getCustomerByName = (name) => customers.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
const getCustomerById = (id) => customers.find(c => c.id === id);
const addCustomer = (customer) => {
  customer.id = 'C' + String(customers.length + 1).padStart(3, '0');
  customers.push(customer);
  return customer;
};
const updateCustomer = (id, updates) => {
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...updates };
  return customers[idx];
};
const deleteCustomer = (id) => {
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return false;
  customers.splice(idx, 1);
  return true;
};

// --- PO Log ---
const getPOLog = () => poLog;
const addPOToLog = (po) => { poLog.unshift(po); return po; };
const getPOById = (id) => poLog.find(p => p.id === id);
const updatePOStatus = (id, status, notes) => {
  const po = poLog.find(p => p.id === id);
  if (!po) return null;
  po.status = status;
  if (notes) po.notes = notes;
  po.updatedAt = new Date().toISOString();
  return po;
};

// Master data bundle for AI agent
const getMasterDataForAI = () => ({
  products: products.map(p => ({
    casNumber: p.casNumber,
    name: p.name,
    pharmacopoeia: p.pharmacopoeia,
    packSize: p.packSize,
    hsnCode: p.hsnCode,
    activeLot: p.activeLot,
    category: p.category
  })),
  customers: customers.map(c => ({
    name: c.name,
    gstNumber: c.gstNumber,
    billTo: c.billTo,
    shipTo: c.shipTo,
    transactionType: c.transactionType,
    status: c.status
  }))
});

// Stats
const getStats = () => {
  const total = poLog.length;
  const green = poLog.filter(p => p.validationResult?.overallStatus === 'GREEN').length;
  const amber = poLog.filter(p => p.validationResult?.overallStatus === 'AMBER').length;
  const red = poLog.filter(p => p.validationResult?.overallStatus === 'RED').length;
  const avgScore = total > 0
    ? Math.round(poLog.reduce((sum, p) => sum + (p.validationResult?.overallScore || 0), 0) / total)
    : 0;

  return { total, green, amber, red, avgScore, products: products.length, customers: customers.length };
};

module.exports = {
  getProducts, getProductByCAS, getProductById, addProduct, updateProduct, deleteProduct,
  getCustomers, getCustomerByName, getCustomerById, addCustomer, updateCustomer, deleteCustomer,
  getPOLog, addPOToLog, getPOById, updatePOStatus,
  getMasterDataForAI, getStats
};

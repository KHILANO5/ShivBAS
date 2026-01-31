# 📦 Purchase Order Page Guide

## Overview
The Purchase Order (PO) page allows you to create, manage, and track orders sent to vendors. It is fully integrated with the Contacts (Vendors) and Products modules.

## 🚀 Features

### 1. **Purchase Order List**
- View all purchase orders in a sortable table.
- **Columns:** PO Number, Vendor, Date, Expected Date, Total Amount, Status.
- **Search:** Filter by PO Number or Vendor Name.
- **Status Filter:** Filter by Draft, Sent, Received, etc.

### 2. **Create & Edit Orders**
- **Vendor Selection:** Automatically lists contacts marked as 'Vendor'.
- **Line Items:**
  - Add multiple products.
  - Auto-fills Unit Price and Tax Rate when a product is selected.
  - Standard tax calculation.
  - **Dynamic Totals:** Real-time calculation of Subtotal, Tax, and Grand Total.
- **Dates:** Set Order Date and Expected Delivery Date.
- **Notes:** Add internal notes or terms for the vendor.

### 3. **Status Management**
- **Draft:** Work in progress.
- **Sent:** Order sent to vendor.
- **Received:** Goods received (ready for billing).
- **Cancelled:** Order voided.

---

## 🛠 Technical Implementation

### **Data Source (`mockAPI.js`)**
The page uses the centralized `mockAPI` service which now includes:
- `getPurchaseOrders()`: Fetches POs enriched with vendor names.
- `createPurchaseOrder(data)`: Generates a new PO with ID and PO Number (e.g., PO-2026-003).
- `updatePurchaseOrder(id, data)`: Updates existing PO.
- `deletePurchaseOrder(id)`: Removes a PO.
- `getContacts()`: Used to populate the Vendor dropdown (filtered by `type='vendor'`).
- `getProducts()`: Used to populate the Product dropdown and auto-fill details.

### **State Management**
- **Local State:** Manages form data, line items, and modal visibility.
- **Calculations:** `calculateTotals()` runs on every render/change to ensure accurate financial data.

### **Integration**
- **Contacts:** Must have contacts with `type='vendor'` to create a PO.
- **Products:** Must have products in the system to add line items.

---

## 📝 How to Use

1.  **Navigate** to `Purchase > Purchase Order` via the Navbar.
2.  **Click "New Order"** to open the creation modal.
3.  **Select a Vendor** from the dropdown.
4.  **Add Items**:
    *   Click "+ Add Item".
    *   Select a Product.
    *   Adjust Quantity and Price if needed.
5.  **Review Totals** at the bottom.
6.  **Save** to create the order.

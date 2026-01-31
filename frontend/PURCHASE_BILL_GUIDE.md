# 🧾 Purchase Bill Page Guide

## Overview
The Purchase Bill page tracks bills received from vendors. Unlike Purchase Orders (which are requests), Purchase Bills represent financial liabilities and are used for accounting and payment tracking.

## 🚀 Features

### 1. **Purchase Bill List**
- View all purchase bills with key details.
- **Columns:** Bill Number, Vendor, Date (with Due Date), Total Amount, Status, Payment Status.
- **Visual Badges:** Color-coded status and payment indicators.
- **Filters:** Search by Bill# or Vendor, and filter by Status.

### 2. **Create & Edit Bills**
- **Vendor Selection:** Filters contacts to show only vendors.
- **Dates:** Set **Bill Date** and **Due Date** (defaults to 30 days from bill date).
- **Line Items:**
  - Add products with auto-filled prices.
  - Calculate taxes and totals automatically.
- **Status Options:**
  - **Draft:** Preparing the bill (doesn't affect books).
  - **Posted:** Finalized bill (affects books).
  - **Cancelled:** Voided bill.
- **Payment Status:**
  - **Not Paid**: No payment made.
  - **Partial**: Some amount paid.
  - **Paid**: Fully settled.

### 3. **Smart Features**
- **Auto-Calculations:** Subtotal, Tax, and Grand Total update in real-time.
- **Data Integration:** Pulls vendors and products from the shared data store.

---

## 🛠 Technical Implementation

### **Data Source (`mockAPI.js`)**
The page uses the centralized `mockAPI` service:
- `getPurchaseBills()`: Fetches bills enriched with vendor names.
- `createPurchaseBill(data)`: Creates new bill with auto-generated ID.
- `updatePurchaseBill(id, data)`: Updates existing bill.
- `deletePurchaseBill(id)`: Removes a bill.

### **Difference from Purchase Order**
- **Table:** `vendor_bills` (vs `purchase_orders`).
- **Fields:** Includes `due_date`, `payment_status`.
- **Purpose:** Tracks *actual* debt vs *planned* orders.

---

## 📝 How to Use

1.  **Navigate** to `Purchase > Purchase Bill`.
2.  **Click "New Bill"**.
3.  **Select Vendor** and set Dates.
4.  **Add Items** (Goods/Services received).
5.  **Set Status**:
    *   Use `Draft` while verifying.
    *   Change to `Posted` when confirmed.
6.  **Set Payment Status**: Update as payments are made.
7.  **Save**.

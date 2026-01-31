# 📦 Sales Order Page Guide

## Overview
The Sales Order page manages customer orders. It features a specialized dark-themed modal for creating and managing orders, designed to replicate a traditional sales order form.

## 🚀 Features

### 1. **Order List**
- View all Sales Orders with status badges.
- **Statuses:** `Draft`, `Confirm`, `Cancelled`.

### 2. **"New Order" Modal**
- **Dashboard Theme:** A clean, light-mode interface consistent with the rest of the application.
- **Auto-Generated SO No:** Automatically assigns the next available order number (e.g., `SO00001`).
- **Customer Selection:** Linked to Contact Master.
- **Status Stepper:** Visual tracking of order progress (`Draft` > `Confirm` > `Cancelled`).
- **Action Buttons:**
    - `Confirm`: Moves status forward.
    - `Print` / `Send`: Placeholder actions for future integration.
    - `Cancel`: Voids the order.

### 3. **Line Item Management**
- **Dynamic Table:** Add or remove products using the "Add Product" button.
- **Auto-Fill:** Selecting a product auto-populates the Unit Price from Product Master.
- **Calculations:** Real-time computation of Line Totals and Grand Total.

---

## 🛠 Technical Implementation

### **Data Source**
- **Mock API:** Uses `mockAPI.getSaleOrders()` and related CRUD methods.
- **Master Data:** Fetches Customers (`mockAPI.getContacts`) and Products (`mockAPI.getProducts`) for dropdowns.

### **Database Schema Alignment**
- While specific `sale_orders` table might be abstracted in the mock layer, the structure mirrors `customer_invoices`:
    - `so_number`
    - `customer_id`
    - `so_date`
    - `items` (JSON/Relation)
    - `status`

---

## 📝 How to Use

1.  **Navigate** to `Sale > Sale Order`.
2.  **Click "New Order"**.
3.  **Fill Details**: Select Customer, check Date.
4.  **Add Items**: Click "+ Add Product", choose item, set Qty.
5.  **Save**: Click "Save Order" to store in the system.
6.  **Manage:** Use the "Edit" button on the list view to re-open the modal and change status (e.g., Click "Confirm").

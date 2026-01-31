# 🧾 Receipt & Voucher Page Guide

## Overview
The Receipt page serves as a unified transaction interface for managing incoming receipts and outgoing payments (vouchers). It uses a clean, light-mode dashboard theme consistent with the rest of the application.

## 🚀 Features

### 1. **Transaction List**
- View all receipts and vouchers.
- **Type Indicator:** Visual distinction between `Incoming` (Receive) and `Outgoing` (Send) transactions.

### 2. **Transaction Vouncher Modal**
- **Dashboard Theme:** Clean white card with standard inputs and blue accents (`primary-600`).
- **Flexible Type:** Toggle between "Send" and "Receive" in a single form.
- **Auto-Fill Logic:** 
  - **Partner:** Select from Contact Master (simulated auto-fill from Bill/Invoice).
  - **Amount:** Input field with currency indicator.
- **Status Stepper:** Tracks lifecycle `Draft` > `Confirm` > `Cancelled`.
- **Payment Modes:** Support for Bank, Cash, and UPI.

---

## 🛠 Technical Implementation

### **Data Source**
- **Mock API:** Uses `mockAPI.getReceipts()`, `createReceipt()`, etc.
- **Schema:**
    - `receipt_number`: Auto-generated string (e.g., `Pay/25/0001`).
    - `type`: 'send' | 'receive' (Enum).
    - `partner_id`: FK to Contacts.
    - `amount`: Decimal.
    - `date`: Date string.
    - `payment_mode`: Enum.
    - `status`: Enum.

### **Database Alignment**
- Mirrors a standard `payments` or `vouchers` table structure.
- Designed to handle both AR (Accounts Receivable) and AP (Accounts Payable) entries if needed, or focused on Receipts.

---

## 📝 How to Use

1.  **Navigate** to `Sale > Receipt`.
2.  **Click "New Receipt"**: Opens the voucher modal.
3.  **Select details**:
    - **Type**: Choose if you are Sending or Receiving money.
    - **Partner**: Who is the transaction with?
    - **Amount & Date**: Enter financial details.
4.  **Save**: Click "Save Transaction" to record.
5.  **Actions**: inside the modal, use "Confirm" to change status.

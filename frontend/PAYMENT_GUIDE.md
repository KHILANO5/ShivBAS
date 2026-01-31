# 💳 Payment Page Integration Guide

## Overview
The Payment page allows for the settlement of pending vendor bills using a secure, integrated payment gateway simulation. It replicates the **Razorpay** checkout experience for seamless "Pay Now" functionality.

## 🚀 Features

### 1. **Pending Payments List**
- Automatically fetches **Unpaid Purchase Bills** from the system.
- Displays Bill #, Vendor, Due Date, and Amount.
- "Pay Now" button triggers the payment flow.

### 2. **Razorpay Checkout Simulation**
- **Premium UI:** A pixel-perfect recreation of the Razorpay modal.
- **Methods:** Visual support for UPI/QR, Cards, Netbanking, etc.
- **Workflow:** Clicking "Pay Now" processes the transaction (simulated delay).

### 3. **Success & Automation**
- **Instant Status Update:** Upon successful payment:
  - The Bill's status changes to `Paid`.
  - A transaction record is created in the backend (mock).
- **Confirmation:** A "Payment Successful" receipt is shown.

---

## 🛠 Technical Implementation

### **Data Flow**
1.  **Fetch:** `mockAPI.getPurchaseBills()` -> Filters `payment_status !== 'paid'`.
2.  **Transact:** User confirms payment in Modal.
3.  **Record:**
    - Call `mockAPI.createPayment({ ... })` to log the transaction.
    - Call `mockAPI.updatePurchaseBill(id, { payment_status: 'paid', status: 'posted' })` to close the bill.

### **UI Components**
- **Modal:** Custom-built React component using Tailwind CSS to mimic Razorpay's iframe.
- **Loader:** Visual feedback during transaction processing.

---

## 📝 How to Test

1.  Ensure you have at least one **Unpaid Purchase Bill** (Create one via `Purchase > Purchase Bill` if needed).
2.  Navigate to `Purchase > Payment`.
3.  Click **Pay Now** on a bill.
4.  In the modal, review details and click the blue **Pay Now** button.
5.  Wait for the success animation.
6.  The bill will disappear from the list (as it is now Paid).

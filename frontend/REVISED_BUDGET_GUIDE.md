# 📉 Revised Budget Page Guide

## Overview
The Revised Budget page allows you to create versions of your budgets with updated figures. This is crucial for tracking how financial plans change over time due to unexpected events or strategic shifts.

## 🚀 Features

### 1. **Revised Budget List**
- **Columns:** Event Name, Type, Original Amount, Revised Amount, Reason.
- **Search:** Filter by Event Name.

### 2. **Create Revision**
- **Select Original Budget:** Automatically pulls data from your existing budgets.
- **Input Revision:** Enter the `Revised Budget Amount`.
- **Reasoning:** Mandatory field to explain `Revision Reason` (e.g., "Market price increase", "Scope expansion").
- **Read-Only Fields:** Event Name and Type are locked to ensure integrity.

### 3. **Smart Integration**
- **Mock API:** Fully integrated with the mock backend.
- **Budget Linking:** Directly links revision triggers to the original budget ID.

---

## 🛠 Technical Implementation

### **Data Source (`mockAPI.js`)**
- `getRevisedBudgets()`: Fetches revisions enriched with original budget data.
- `createRevisedBudget(data)`: Creates a new revision record.
- `updateRevisedBudget(id, data)`: Modifies a revision.
- `deleteRevisedBudget(id)`: Removes a revision.

### **Database Alignment**
- Uses the `revised_budget` table structure from the schema.
- Fields: `budget_id`, `revised_budgeted_amount`, `revision_reason`, `start_date`, `end_date`.

---

## 📝 How to Use

1.  **Navigate** to `Budgets > Revised Budget` via the Navbar.
2.  **Click "New Revision"**.
3.  **Select a Budget** to revise.
4.  **Enter New Amount** and **Reason**.
5.  **Save**.

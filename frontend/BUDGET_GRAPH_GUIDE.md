# 📊 Budget Graph Page Guide

## Overview
The Budget Graph page provides a visual dashboard to analyze your financial performance. It transforms raw budget numbers into intuitive charts, allowing for quick identification of variances and trends.

## 🚀 Key Features

### 1. **Visual Analytics**
- **Budget vs Actual (Bar Chart):**
  - **Blue Bars:** Planned Budget.
  - **Green/Red Bars:** Actual Achievement.
  - **Color Logic:** Green when within budget, Red when exceeded (or exceeded income target).
  - **Interactive:** Hovering reveals detailed figures.

- **Allocation (Donut Chart):**
  - visualizes the split between **Income** (Green) and **Expense** (Red).
  - Shows percentage distribution.
  - Animated rendering for a premium feel.

### 2. **KPI Cards**
- **Total Budgeted:** Aggregate of all planned amounts.
- **Total Actual:** Aggregate of actual performance.
- **Achievement Rate:** Overall percentage completion.

### 3. **Smart Filtering**
- **Type Filter:** Toggle between `All`, `Income`, and `Expense` to focus your analysis.
- **Dynamic Updates:** Charts automatically rescale based on filtered data.

### 4. **Revision Tracking**
- **Recent Updates:** A summary table shows the latest budget revisions.
- **Trend Indicators:** Arrows and colors indicate positive or negative changes.

---

## 🛠 Technical Implementation

### **Data Source**
- Fetches from `mockAPI.getBudgets()` and `mockAPI.getRevisedBudgets()`.
- Performs real-time aggregation on the frontend.

### **Visualization Engine**
- **Custom SVG Charts:** Built from scratch using React and SVG for maximum performance and design control (no heavy external libraries).
- **Responsive Design:** Charts adapt to screen width (horizontally scrollable if too many events).

---

## 📝 How to Use

1.  **Navigate** to `Budgets > Budget Graph`.
2.  **View KPI Cards** for high-level summary.
3.  **Analyze Bar Chart** to compare specific events.
4.  **Check Donut Chart** for overall financial balance.
5.  **Use Filters** (top right) to isolate Income or Expenses.
6.  **Review Revisions** table at the bottom for recent changes.

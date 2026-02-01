// ============================================================================
// Dashboard Controller
// Located: backend/src/controllers/dashboardController.js
// Handles: Summary, Budget vs Actual, Reports, Payment Status
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// GET DASHBOARD SUMMARY
// GET /api/dashboard/summary
// ============================================================================
const getDashboardSummary = async (req, res) => {
  try {
    // Total Budgets
    const [budgetStats] = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(budgeted_amount), 0) as total_amount FROM budgets'
    );

    // Total Analytics/Events
    const [analyticsStats] = await pool.query(
      'SELECT COUNT(*) as total FROM analytics WHERE status = "active"'
    );

    // Total Invoices (Income)
    const [invoiceStats] = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(total_amount), 0) as total_amount FROM customer_invoices'
    );

    // Total Bills (Expenses)
    const [billStats] = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(total_amount), 0) as total_amount FROM vendor_bills'
    );

    // Total Payments
    const [paymentStats] = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(amount_paid), 0) as total_amount FROM payments'
    );

    res.json({
      success: true,
      data: {
        total_budgets: parseInt(budgetStats[0].total),
        active_events: parseInt(analyticsStats[0].total),
        total_income: parseFloat(invoiceStats[0].total_amount),
        total_expenses: parseFloat(billStats[0].total_amount),
        budgets: {
          total: parseInt(budgetStats[0].total),
          total_amount: parseFloat(budgetStats[0].total_amount)
        },
        invoices: {
          total: parseInt(invoiceStats[0].total),
          total_amount: parseFloat(invoiceStats[0].total_amount)
        },
        bills: {
          total: parseInt(billStats[0].total),
          total_amount: parseFloat(billStats[0].total_amount)
        },
        payments: {
          total: parseInt(paymentStats[0].total),
          total_amount: parseFloat(paymentStats[0].total_amount)
        }
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary'
    });
  }
};

// ============================================================================
// GET BUDGET VS ACTUAL
// GET /api/dashboard/budget-vs-actual
// ============================================================================
const getBudgetVsActual = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id,
        b.event_name,
        b.analytics_id,
        b.budgeted_amount,
        b.achieved_amount,
        b.percentage_achieved,
        b.amount_to_achieve,
        a.event_name as analytics_event_name
      FROM budgets b
      LEFT JOIN analytics a ON b.analytics_id = a.id
      ORDER BY b.percentage_achieved DESC
    `;

    const [results] = await pool.query(query);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get budget vs actual error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget vs actual data'
    });
  }
};

// ============================================================================
// GET TRANSACTION REPORTS
// GET /api/dashboard/transaction-report
// ============================================================================
const getTransactionReport = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'month' } = req.query;

    let dateFormat;
    switch (group_by) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      case 'month':
      default:
        dateFormat = '%Y-%m';
        break;
    }

    const query = `
      SELECT 
        DATE_FORMAT(transaction_date, ?) as period,
        transaction_type,
        COUNT(*) as transaction_count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_amount
      FROM transactions
      WHERE (? IS NULL OR transaction_date >= ?)
        AND (? IS NULL OR transaction_date <= ?)
      GROUP BY period, transaction_type
      ORDER BY period DESC, transaction_type
    `;

    const [results] = await pool.query(query, [
      dateFormat,
      start_date, start_date,
      end_date, end_date
    ]);

    // Group by period
    const reportByPeriod = {};
    results.forEach(row => {
      if (!reportByPeriod[row.period]) {
        reportByPeriod[row.period] = {
          period: row.period,
          invoices: { count: 0, total: 0, paid: 0, pending: 0 },
          bills: { count: 0, total: 0, paid: 0, pending: 0 }
        };
      }

      const type = row.transaction_type === 'invoice' ? 'invoices' : 'bills';
      reportByPeriod[row.period][type] = {
        count: row.transaction_count,
        total: parseFloat(row.total_amount),
        paid: parseFloat(row.paid_amount),
        pending: parseFloat(row.pending_amount)
      };
    });

    res.json({
      success: true,
      data: Object.values(reportByPeriod)
    });
  } catch (error) {
    console.error('Get transaction report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction report'
    });
  }
};

// ============================================================================
// GET PAYMENT STATUS
// GET /api/dashboard/payment-status
// ============================================================================
const getPaymentStatus = async (req, res) => {
  try {
    const { transaction_type } = req.query;

    let query = `
      SELECT 
        t.transaction_id,
        t.transaction_type,
        t.transaction_date,
        t.due_date,
        t.total_amount,
        t.status,
        c.contact_name,
        COALESCE(SUM(p.amount), 0) as paid_amount,
        t.total_amount - COALESCE(SUM(p.amount), 0) as remaining_amount,
        DATEDIFF(CURDATE(), t.due_date) as days_overdue
      FROM transactions t
      LEFT JOIN contacts c ON t.contact_id = c.contact_id
      LEFT JOIN payments p ON t.transaction_id = p.transaction_id
      WHERE t.status != 'paid'
    `;
    const params = [];

    if (transaction_type) {
      query += ' AND t.transaction_type = ?';
      params.push(transaction_type);
    }

    query += `
      GROUP BY t.transaction_id
      ORDER BY days_overdue DESC, t.due_date ASC
    `;

    const [results] = await pool.query(query, params);

    res.json({
      success: true,
      data: results.map(row => ({
        ...row,
        total_amount: parseFloat(row.total_amount),
        paid_amount: parseFloat(row.paid_amount),
        remaining_amount: parseFloat(row.remaining_amount),
        payment_status: row.days_overdue > 0 ? 'overdue' : 
                       row.days_overdue > -7 ? 'due_soon' : 'upcoming',
        days_overdue: row.days_overdue
      }))
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status'
    });
  }
};

module.exports = {
  getDashboardSummary,
  getBudgetVsActual,
  getTransactionReport,
  getPaymentStatus
};

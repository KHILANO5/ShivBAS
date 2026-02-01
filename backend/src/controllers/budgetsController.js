// ============================================================================
// Budgets Controller
// Located: backend/src/controllers/budgetsController.js
// Handles: Budget CRUD, Revisions, Alerts
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// CREATE BUDGET
// POST /api/budgets
// ============================================================================
const createBudget = async (req, res) => {
  try {
    const { event_name, analytics_id, type, budgeted_amount, start_date, end_date, notes } = req.body;

    if (!event_name || !type || !budgeted_amount || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Event name, type, budgeted amount, start date, and end date are required'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either income or expense'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO budgets (event_name, analytics_id, type, budgeted_amount, achieved_amount, start_date, end_date, notes) VALUES (?, ?, ?, ?, 0, ?, ?, ?)',
      [event_name, analytics_id || null, type, budgeted_amount, start_date, end_date, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: {
        id: result.insertId,
        event_name,
        analytics_id,
        type,
        budgeted_amount,
        achieved_amount: 0,
        start_date,
        end_date,
        notes
      }
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create budget'
    });
  }
};

// ============================================================================
// GET ALL BUDGETS
// GET /api/budgets
// ============================================================================
const getBudgets = async (req, res) => {
  try {
    const { analytics_id, start_date, end_date } = req.query;

    let query = `
      SELECT b.*, a.event_name, a.partner_tag
      FROM budgets b
      LEFT JOIN analytics a ON b.analytics_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (analytics_id) {
      query += ' AND b.analytics_id = ?';
      params.push(analytics_id);
    }

    if (start_date) {
      query += ' AND b.start_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND b.end_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY b.created_at DESC';

    const [budgets] = await pool.query(query, params);

    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budgets'
    });
  }
};

// ============================================================================
// GET BUDGET BY ID
// GET /api/budgets/:id
// ============================================================================
const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;

    const [budgets] = await pool.query(
      `SELECT b.*, a.event_name, a.partner_tag
       FROM budgets b
       LEFT JOIN analytics a ON b.analytics_id = a.id
       WHERE b.id = ?`,
      [id]
    );

    if (budgets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: budgets[0]
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget'
    });
  }
};

// ============================================================================
// UPDATE BUDGET
// PUT /api/budgets/:id
// ============================================================================
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, start_date, end_date, notes } = req.body;
    const user_id = req.user.user_id;

    const [existing] = await pool.query(
      'SELECT * FROM budgets WHERE budget_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    const budget = existing[0];

    // Create revision record
    await pool.query(
      `INSERT INTO budget_revisions 
       (budget_id, previous_amount, new_amount, reason, revised_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, budget.amount, amount, notes || 'Budget update', user_id]
    );

    // Update budget and increment version
    await pool.query(
      `UPDATE budgets 
       SET amount = ?, start_date = ?, end_date = ?, notes = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP 
       WHERE budget_id = ?`,
      [amount, start_date, end_date, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Budget updated successfully'
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update budget'
    });
  }
};

// ============================================================================
// DELETE BUDGET
// DELETE /api/budgets/:id
// ============================================================================
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT budget_id FROM budgets WHERE budget_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    await pool.query('DELETE FROM budgets WHERE budget_id = ?', [id]);

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete budget'
    });
  }
};

// ============================================================================
// GET BUDGET REVISIONS
// GET /api/budgets/:id/revisions
// ============================================================================
const getBudgetRevisions = async (req, res) => {
  try {
    const { id } = req.params;

    const [revisions] = await pool.query(
      `SELECT br.*, u.name as revised_by_name
       FROM budget_revisions br
       LEFT JOIN users u ON br.revised_by = u.user_id
       WHERE br.budget_id = ?
       ORDER BY br.revision_date DESC`,
      [id]
    );

    res.json({
      success: true,
      data: revisions
    });
  } catch (error) {
    console.error('Get budget revisions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget revisions'
    });
  }
};

// ============================================================================
// GET BUDGET ALERTS
// GET /api/budgets/alerts
// ============================================================================
const getBudgetAlerts = async (req, res) => {
  try {
    const { threshold = 80 } = req.query;

    const query = `
      SELECT 
        b.budget_id,
        b.amount as budget_amount,
        ac.code,
        ac.description,
        COALESCE(SUM(ti.amount), 0) as spent_amount,
        ROUND((COALESCE(SUM(ti.amount), 0) / b.amount) * 100, 2) as utilization_percent,
        b.start_date,
        b.end_date
      FROM budgets b
      LEFT JOIN analytics_codes ac ON b.analytics_code_id = ac.analytics_id
      LEFT JOIN transaction_items ti ON b.analytics_code_id = ti.analytics_code_id
        AND ti.created_at BETWEEN b.start_date AND b.end_date
      WHERE b.end_date >= CURDATE()
      GROUP BY b.budget_id
      HAVING utilization_percent >= ?
      ORDER BY utilization_percent DESC
    `;

    const [alerts] = await pool.query(query, [threshold]);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget alerts'
    });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetRevisions,
  getBudgetAlerts
};

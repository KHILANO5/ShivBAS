// ============================================================================
// Revised Budgets Controller
// Located: backend/src/controllers/revisedBudgetsController.js
// Handles: Revised Budget CRUD operations
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// GET ALL REVISED BUDGETS
// GET /api/revised-budgets
// ============================================================================
const getRevisedBudgets = async (req, res) => {
  try {
    const query = `
      SELECT 
        rb.*,
        b.event_name as original_event_name,
        b.budgeted_amount as original_budgeted_amount
      FROM revised_budget rb
      LEFT JOIN budgets b ON rb.budget_id = b.id
      ORDER BY rb.created_at DESC
    `;

    const [revisedBudgets] = await pool.query(query);

    res.json({
      success: true,
      data: revisedBudgets
    });
  } catch (error) {
    console.error('Get revised budgets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revised budgets'
    });
  }
};

// ============================================================================
// GET REVISED BUDGET BY ID
// GET /api/revised-budgets/:id
// ============================================================================
const getRevisedBudgetById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        rb.*,
        b.event_name as original_event_name,
        b.budgeted_amount as original_budgeted_amount
      FROM revised_budget rb
      LEFT JOIN budgets b ON rb.budget_id = b.id
      WHERE rb.id = ?
    `;

    const [revisedBudgets] = await pool.query(query, [id]);

    if (revisedBudgets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Revised budget not found'
      });
    }

    res.json({
      success: true,
      data: revisedBudgets[0]
    });
  } catch (error) {
    console.error('Get revised budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revised budget'
    });
  }
};

// ============================================================================
// CREATE REVISED BUDGET
// POST /api/revised-budgets
// ============================================================================
const createRevisedBudget = async (req, res) => {
  try {
    const {
      budget_id,
      event_name,
      type,
      revised_budgeted_amount,
      revised_achieved_amount = 0,
      budget_exceed = 'no',
      start_date,
      end_date,
      revision_reason
    } = req.body;

    if (!budget_id || !event_name || !type || !revised_budgeted_amount || !start_date || !end_date || !revision_reason) {
      return res.status(400).json({
        success: false,
        error: 'Budget ID, event name, type, revised budgeted amount, start date, end date, and revision reason are required'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either income or expense'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO revised_budget 
       (budget_id, event_name, type, revised_budgeted_amount, revised_achieved_amount, budget_exceed, start_date, end_date, revision_reason) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [budget_id, event_name, type, revised_budgeted_amount, revised_achieved_amount, budget_exceed, start_date, end_date, revision_reason]
    );

    res.status(201).json({
      success: true,
      message: 'Revised budget created successfully',
      data: {
        id: result.insertId,
        budget_id,
        event_name,
        type,
        revised_budgeted_amount,
        revised_achieved_amount,
        budget_exceed,
        start_date,
        end_date,
        revision_reason
      }
    });
  } catch (error) {
    console.error('Create revised budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create revised budget'
    });
  }
};

// ============================================================================
// UPDATE REVISED BUDGET
// PUT /api/revised-budgets/:id
// ============================================================================
const updateRevisedBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      budget_id,
      event_name,
      type,
      revised_budgeted_amount,
      revised_achieved_amount,
      budget_exceed,
      start_date,
      end_date,
      revision_reason
    } = req.body;

    // Check if revised budget exists
    const [existing] = await pool.query(
      'SELECT id FROM revised_budget WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Revised budget not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (budget_id !== undefined) {
      updates.push('budget_id = ?');
      values.push(budget_id);
    }
    if (event_name !== undefined) {
      updates.push('event_name = ?');
      values.push(event_name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (revised_budgeted_amount !== undefined) {
      updates.push('revised_budgeted_amount = ?');
      values.push(revised_budgeted_amount);
    }
    if (revised_achieved_amount !== undefined) {
      updates.push('revised_achieved_amount = ?');
      values.push(revised_achieved_amount);
    }
    if (budget_exceed !== undefined) {
      updates.push('budget_exceed = ?');
      values.push(budget_exceed);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(end_date);
    }
    if (revision_reason !== undefined) {
      updates.push('revision_reason = ?');
      values.push(revision_reason);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await pool.query(
      `UPDATE revised_budget SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Revised budget updated successfully'
    });
  } catch (error) {
    console.error('Update revised budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update revised budget'
    });
  }
};

// ============================================================================
// DELETE REVISED BUDGET
// DELETE /api/revised-budgets/:id
// ============================================================================
const deleteRevisedBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM revised_budget WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Revised budget not found'
      });
    }

    await pool.query('DELETE FROM revised_budget WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Revised budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete revised budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete revised budget'
    });
  }
};

module.exports = {
  getRevisedBudgets,
  getRevisedBudgetById,
  createRevisedBudget,
  updateRevisedBudget,
  deleteRevisedBudget
};

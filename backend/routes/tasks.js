const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const VALID_PRIORITIES = ['high', 'medium', 'low'];
const VALID_CATEGORIES = ['general', 'work', 'personal'];

router.use(requireAuth);

// GET /api/tasks — list the current user's tasks
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks — create a task
router.post('/', async (req, res) => {
  const { text, priority = 'medium', category = 'general' } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of ${VALID_PRIORITIES.join(', ')}` });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of ${VALID_CATEGORIES.join(', ')}` });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (user_id, text, priority, category) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.userId, text.trim(), priority, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id — update a task (text, priority, category, completed)
router.put('/:id', async (req, res) => {
  const { text, priority, category, completed } = req.body;

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of ${VALID_PRIORITIES.join(', ')}` });
  }
  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of ${VALID_CATEGORIES.join(', ')}` });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET
        text = COALESCE($1, text),
        priority = COALESCE($2, priority),
        category = COALESCE($3, category),
        completed = COALESCE($4, completed),
        updated_at = now()
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [text, priority, category, completed, req.params.id, req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// DELETE /api/tasks — clear ALL of the current user's tasks
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE user_id = $1', [req.userId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear tasks' });
  }
});

module.exports = router;

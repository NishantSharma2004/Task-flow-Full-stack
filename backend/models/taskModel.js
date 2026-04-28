import { query } from '../database/db.js';

export const getAllTasks = async (userId) => {
  const res = await query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return res.rows;
};

export const getTaskById = async (id, userId) => {
  const res = await query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rows[0];
};

export const createTask = async (userId, task) => {
  const { title, description, category, priority, status, due_date, start_time, end_time, reminder_time, reminder_minutes, is_recurring, recur_pattern } = task;
  const res = await query(
    `INSERT INTO tasks (user_id, title, description, category, priority, status, due_date, start_time, end_time, reminder_time, reminder_minutes, is_recurring, recur_pattern)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [userId, title, description, category, priority || 'medium', status || 'pending', due_date, start_time, end_time, reminder_time, reminder_minutes || 0, is_recurring || false, recur_pattern]
  );
  return res.rows[0];
};

export const updateTask = async (id, userId, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const res = await query(
    `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
    [...values, id, userId]
  );
  return res.rows[0];
};

export const deleteTask = async (id, userId) => {
  await query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
};

export const completeTask = async (id, userId) => {
  const res = await query(
    `UPDATE tasks SET is_completed = TRUE, status = 'completed', updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return res.rows[0];
};

export const getUpcomingReminders = async () => {
  const res = await query(
    `SELECT t.*, u.email, u.name FROM tasks t
     JOIN users u ON t.user_id = u.id
     WHERE t.reminder_time BETWEEN NOW() AND NOW() + INTERVAL '2 minutes'
     AND t.is_completed = FALSE`
  );
  return res.rows;
};

export const getAnalytics = async (userId) => {
  const total = await query('SELECT COUNT(*) FROM tasks WHERE user_id = $1', [userId]);
  const completed = await query('SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND is_completed = TRUE', [userId]);
  const byCategory = await query('SELECT category, COUNT(*) as count FROM tasks WHERE user_id = $1 GROUP BY category', [userId]);
  const byPriority = await query('SELECT priority, COUNT(*) as count FROM tasks WHERE user_id = $1 GROUP BY priority', [userId]);
  const last7days = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as created,
     SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed
     FROM tasks WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
     GROUP BY DATE(created_at) ORDER BY date`,
    [userId]
  );
  return {
    total: parseInt(total.rows[0].count),
    completed: parseInt(completed.rows[0].count),
    byCategory: byCategory.rows,
    byPriority: byPriority.rows,
    last7days: last7days.rows
  };
};

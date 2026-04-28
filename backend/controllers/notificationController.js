import { getDb } from "../database/db.js";

export const getNotifications = (req, res, next) => {
  try {
    const db   = getDb();
    const rows = db.prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`).all(req.userId);
    const unreadCount = rows.filter(r => !r.is_read).length;
    res.json({ success: true, data: { notifications: rows, unreadCount } });
  } catch (err) { next(err); }
};

export const markRead = (req, res, next) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`).run(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const markAllRead = (req, res, next) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const clearRead = (req, res, next) => {
  try {
    const db = getDb();
    db.prepare(`DELETE FROM notifications WHERE user_id = ? AND is_read = 1`).run(req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

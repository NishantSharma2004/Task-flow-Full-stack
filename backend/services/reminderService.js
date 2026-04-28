import { getDb }                   from "../database/db.js";
import { findPendingForReminders } from "../models/taskModel.js";

const fired = new Set();
const pad   = (n) => String(n).padStart(2, "0");

const getCurrentHHMM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const subtractMinutes = (hhmm, mins) => {
  const [h, m] = hhmm.split(":").map(Number);
  const total  = h * 60 + m - mins;
  if (total < 0) return null;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

const checkReminders = () => {
  try {
    const now   = getCurrentHHMM();
    const tasks = findPendingForReminders();

    for (const task of tasks) {
      const mins   = task.reminder_minutes ?? 10;
      if (mins === 0) continue;
      const fireAt = subtractMinutes(task.start_time, mins);
      if (!fireAt || fireAt !== now) continue;

      const key = `${task.id}-${task.date}-${fireAt}`;
      if (fired.has(key)) continue;

      const db     = getDb();
      const recent = db.prepare(`
        SELECT id FROM notifications
        WHERE task_id = ? AND user_id = ? AND created_at >= datetime('now', '-2 minutes')
      `).get(task.id, task.user_id);
      if (recent) { fired.add(key); continue; }

      const label   = mins >= 60 ? `${mins / 60} hour` : `${mins} minute`;
      const plural  = mins === 1 || mins === 60 ? "" : "s";
      const message = `⏰ "${task.task_name}" starts in ${label}${plural} at ${task.start_time}`;

      db.prepare(`INSERT INTO notifications (user_id, task_id, task_name, message) VALUES (?, ?, ?, ?)`).run(task.user_id, task.id, task.task_name, message);
      fired.add(key);
      console.log(`🔔 Reminder → user ${task.user_id}: ${message}`);
    }
  } catch (err) {
    console.error("❌ Reminder error:", err.message);
  }
};

export const startReminderService = () => {
  console.log("⏰ Reminders : active (polling every 60s)");
  checkReminders();
  setInterval(checkReminders, 60_000);
};

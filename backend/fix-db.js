/**
 * Run ONCE to fix existing database:
 * node fix-db.js
 */
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, "database/tasks.db");

console.log("📂 Opening database at:", DB_PATH);
const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

const run = async (sql, label) => {
  try {
    await db.run(sql);
    console.log("✅", label);
  } catch (e) {
    if (e.message.includes("duplicate column")) {
      console.log("ℹ️  Already exists —", label);
    } else {
      throw e;
    }
  }
};

await run("ALTER TABLE tasks ADD COLUMN user_id          INTEGER",         "user_id added to tasks");
await run("ALTER TABLE tasks ADD COLUMN reminder_minutes INTEGER DEFAULT 10", "reminder_minutes added to tasks");

await db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    task_id    INTEGER NOT NULL,
    task_name  TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    is_read    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_notif_user   ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id, is_read);
`);
console.log("✅ notifications table ready");

await db.close();
console.log("\n🎉 Done! Now run: npm run dev\n");

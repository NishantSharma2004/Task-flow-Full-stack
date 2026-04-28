import { useEffect, useRef } from "react";
import { Task } from "@/lib/api";
import { toast } from "sonner";
import { addNotification } from "@/components/NotificationBell";

export function useReminders(tasks: Task[]) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!tasks.length) return;

    const checkReminders = () => {
      const now = new Date();

      tasks.forEach((task) => {
        if (task.is_completed || !task.due_date || !task.start_time || !task.reminder_minutes) return;

        const taskId = String(task.id);

        // Fix: Extract local date from due_date (ignore UTC shift)
        // due_date = "2026-04-27T18:30:00.000Z" → local date = "2026-04-27"
        let dateStr: string;
        if (task.due_date.includes("T")) {
          // Use local date parts, not UTC
          const d = new Date(task.due_date);
          dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        } else {
          dateStr = task.due_date.slice(0, 10);
        }

        // start_time = "05:00:00" → use HH:MM only
        const timeStr = task.start_time.slice(0, 5);

        // Build task datetime in LOCAL timezone
        const [h, m] = timeStr.split(":").map(Number);
        const [y, mo, day] = dateStr.split("-").map(Number);
        const taskDateTime = new Date(y, mo - 1, day, h, m, 0);

        // Reminder time = taskDateTime - reminder_minutes
        const reminderTime = new Date(taskDateTime.getTime() - task.reminder_minutes * 60 * 1000);
        const diffMs = reminderTime.getTime() - now.getTime();
        const notifyKey = `${taskId}-${task.reminder_minutes}-${dateStr}-${timeStr}`;

        // Trigger if within ±60 seconds of reminder time
        if (diffMs >= -60000 && diffMs <= 60000 && !notifiedRef.current.has(notifyKey)) {
          notifiedRef.current.add(notifyKey);

          const msg = `🔔 "${task.title}" starts in ${task.reminder_minutes} min!`;

          toast(msg, { duration: 8000, icon: "🔔" });
          addNotification(msg);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("TaskFlow Reminder 🔔", {
              body: `"${task.title}" starts in ${task.reminder_minutes} minute${task.reminder_minutes > 1 ? "s" : ""}`,
              icon: "/icons/icon-192.png",
            });
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [tasks]);
}

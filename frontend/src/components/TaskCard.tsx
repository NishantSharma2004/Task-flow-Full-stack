import { useState } from "react";
import { Task } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, Trash2, Bell, Pencil, Calendar } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { EditTaskDialog } from "@/components/EditTaskDialog";

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high:   "destructive",
  medium: "default",
  low:    "secondary",
};

const categoryColors: Record<string, string> = {
  Study:    "bg-blue-100 text-blue-700",
  Work:     "bg-yellow-100 text-yellow-700",
  Personal: "bg-green-100 text-green-700",
  Health:   "bg-red-100 text-red-700",
  General:  "bg-gray-100 text-gray-700",
};

const formatTime = (time?: string) => {
  if (!time) return "";
  // Handle HH:MM:SS or HH:MM
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const min = m || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min} ${ampm}`;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  // Parse as local date to avoid timezone shift
  let date: Date;
  if (dateStr.includes("T")) {
    date = new Date(dateStr);
  } else {
    const [y, m, d] = dateStr.split("-").map(Number);
    date = new Date(y, m - 1, d);
  }
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const reminderLabel = (mins?: number) => {
  if (!mins || mins === 0) return null;
  if (mins === 60) return "1h before";
  return `${mins}m before`;
};

export function TaskCard({ task }: { task: Task }) {
  const { markComplete, removeTask } = useTasks();
  const [editOpen, setEditOpen] = useState(false);

  const id          = String(task.id || "");
  const isCompleted = task.is_completed === true || task.status === "completed";
  const reminder    = reminderLabel(task.reminder_minutes);
  const title       = task.title || "";
  const category    = task.category || "General";
  const priority    = task.priority || "medium";

  return (
    <>
      <div className={`group rounded-lg border bg-card p-4 transition-all hover:shadow-md ${isCompleted ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
              {title}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[category] || "bg-gray-100 text-gray-700"}`}>
                {category}
              </span>
              <Badge variant={priorityVariant[priority] || "default"}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>

              {task.start_time && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(task.start_time)}{task.end_time ? ` – ${formatTime(task.end_time)}` : ""}
                </span>
              )}

              {task.due_date && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.due_date)}
                </span>
              )}

              {reminder && !isCompleted && (
                <span className="text-xs flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                  <Bell className="h-3 w-3" />
                  {reminder}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditOpen(true)} title="Edit task">
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            {!isCompleted && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => markComplete.mutate(id)} title="Mark complete">
                <Check className="h-4 w-4 text-green-500" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeTask.mutate(id)} title="Delete task">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      <EditTaskDialog task={task} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}

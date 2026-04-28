import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Fix timezone — convert any date string to local YYYY-MM-DD
const toLocalDate = (d?: string) => {
  if (!d) return "";
  if (d.includes("T")) {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return d.slice(0, 10);
};

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export default function CalendarView() {
  const { tasks } = useTasks();
  const today = getLocalToday();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<string>(today);

  const year  = current.getFullYear();
  const month = current.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getTasksForDate = (dateStr: string) =>
    tasks.filter((t) => toLocalDate(t.due_date) === dateStr);

  const selectedTasks = getTasksForDate(selected);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const makeDate = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Calendar</h1>
        <AddTaskDialog />
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrent(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrent(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr  = makeDate(day);
            const dayTasks = getTasksForDate(dateStr);
            const isToday    = dateStr === today;
            const isSelected = dateStr === selected;

            return (
              <div
                key={dateStr}
                onClick={() => setSelected(dateStr)}
                className={`
                  relative min-h-[60px] rounded-lg p-1 cursor-pointer border transition-all
                  ${isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-muted hover:bg-muted/30"}
                `}
              >
                <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full mx-auto font-${isToday ? "bold" : "normal"}
                  ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                  {day}
                </span>
                <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${
                      t.priority === "high" ? "bg-red-500" :
                      t.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] text-muted-foreground">+{dayTasks.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div>
          <h3 className="text-base font-semibold mb-3">
            {new Date(selected + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            <span className="text-muted-foreground font-normal ml-2 text-sm">
              {selectedTasks.length === 0 ? "No tasks" : `${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}`}
            </span>
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center border rounded-lg">No tasks for this day</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

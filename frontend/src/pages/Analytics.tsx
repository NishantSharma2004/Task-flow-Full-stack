import { useTasks } from "@/hooks/useTasks";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line,
  CartesianGrid,
} from "recharts";

const COLORS = {
  completed: "hsl(152, 60%, 42%)",
  pending:   "hsl(220, 60%, 45%)",
  Study:     "hsl(220, 60%, 45%)",
  Work:      "hsl(38, 92%, 55%)",
  Personal:  "hsl(152, 60%, 42%)",
  Health:    "hsl(0, 72%, 55%)",
  General:   "hsl(270, 60%, 55%)",
  high:      "hsl(0, 72%, 55%)",
  medium:    "hsl(38, 92%, 55%)",
  low:       "hsl(152, 60%, 42%)",
};

// Fix timezone — local date from any date string
const toLocalDate = (d?: string) => {
  if (!d) return "";
  if (d.includes("T")) {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  return d.slice(0, 10);
};

const getDayLabel = (dateStr: string) => {
  const [y, m, day] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  });
};

export default function Analytics() {
  const { tasks } = useTasks();

  // Use is_completed and correct field names
  const completed   = tasks.filter((t) => t.is_completed === true).length;
  const pending     = tasks.length - completed;
  const productivity = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  // Pie data
  const pieData = [
    { name: "Completed", value: completed },
    { name: "Pending",   value: pending },
  ];

  // Category bar
  const categoryData = ["Study", "Work", "Personal", "Health", "General"].map((cat) => ({
    name:      cat,
    total:     tasks.filter((t) => t.category === cat).length,
    completed: tasks.filter((t) => t.category === cat && t.is_completed === true).length,
  })).filter(c => c.total > 0);

  // Priority bar — backend returns lowercase: high, medium, low
  const priorityData = ["high", "medium", "low"].map((p) => ({
    name:  p.charAt(0).toUpperCase() + p.slice(1),
    key:   p,
    count: tasks.filter((t) => t.priority === p).length,
  }));

  // Weekly line chart — use due_date with timezone fix
  const last7 = getLast7Days();
  const weeklyData = last7.map((date) => {
    const dayTasks = tasks.filter((t) => toLocalDate(t.due_date) === date);
    return {
      day:       getDayLabel(date),
      total:     dayTasks.length,
      completed: dayTasks.filter((t) => t.is_completed === true).length,
    };
  });

  // Streak calculation
  let streak = 0;
  for (let i = last7.length - 1; i >= 0; i--) {
    const dayTasks = tasks.filter((t) => toLocalDate(t.due_date) === last7[i]);
    const allDone  = dayTasks.length > 0 && dayTasks.every((t) => t.is_completed === true);
    if (allDone) streak++;
    else break;
  }

  // Best category
  const bestCat = categoryData.reduce(
    (best, c) => (c.completed > (best?.completed ?? -1) ? c : best),
    categoryData[0]
  );

  const stats = [
    { label: "Total Tasks",      value: tasks.length,   color: "text-primary",    bg: "bg-primary/10" },
    { label: "Completed",        value: completed,       color: "text-green-600",  bg: "bg-green-50" },
    { label: "Pending",          value: pending,         color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Productivity",     value: `${productivity}%`, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "🔥 Day Streak",    value: streak,          color: "text-red-500",    bg: "bg-red-50" },
    { label: "🏆 Best Category", value: bestCat?.completed > 0 ? bestCat.name : "—", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Completion Pie */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-display font-semibold mb-4">Completion Status</h3>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  <Cell fill={COLORS.completed} />
                  <Cell fill={COLORS.pending} />
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly Line Chart */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-display font-semibold mb-4">Last 7 Days Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total"     stroke={COLORS.pending}   strokeWidth={2} dot={{ r: 4 }} name="Total" />
              <Line type="monotone" dataKey="completed" stroke={COLORS.completed} strokeWidth={2} dot={{ r: 4 }} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-display font-semibold mb-4">Tasks by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total"     fill={COLORS.pending}   radius={[4,4,0,0]} name="Total" />
                <Bar dataKey="completed" fill={COLORS.completed} radius={[4,4,0,0]} name="Completed" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority Bar */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-display font-semibold mb-4">Priority Distribution</h3>
          {priorityData.every(p => p.count === 0) ? (
            <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                <Tooltip />
                <Bar dataKey="count" radius={[0,4,4,0]} name="Tasks">
                  {priorityData.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}

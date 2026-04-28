import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const filters = ["All", "Pending", "Completed"] as const;

export default function Tasks() {
  const { tasks, isLoading } = useTasks();
  const [filter, setFilter] = useState<typeof filters[number]>("All");

  const filtered = tasks.filter((t) => {
    if (filter === "Pending") return t.status !== "completed";
    if (filter === "Completed") return t.status === "completed";
    return true;
  });

  if (isLoading) {
    return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Tasks</h1>
        <AddTaskDialog />
      </div>
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">No tasks found</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard key={task.id || task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

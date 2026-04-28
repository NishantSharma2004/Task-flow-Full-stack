import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, createTask, updateTask, deleteTask, completeTask, Task } from "@/lib/api";
import { toast } from "sonner";

export function useTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        const tasks = await fetchTasks();
        return tasks;
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        return [];
      }
    },
  });

  const addTask = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      return await createTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create task");
    },
  });

  const editTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      return await updateTask(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated!");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const removeTask = useMutation({
    mutationFn: async (id: string) => {
      await deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const markComplete = useMutation({
    mutationFn: async (id: string) => {
      return await completeTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task completed! 🎉");
    },
    onError: () => {
      toast.error("Failed to complete task");
    },
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    addTask,
    editTask,
    removeTask,
    markComplete,
  };
}

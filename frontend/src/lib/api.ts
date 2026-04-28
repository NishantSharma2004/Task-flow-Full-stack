import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:5000/api`;

export interface Task {
  id?: string;
  user_id?: number;
  title: string;
  description?: string;
  category?: string;
  priority?: "high" | "medium" | "low";
  status?: "pending" | "in_progress" | "completed";
  due_date?: string;
  start_time?: string;
  end_time?: string;
  reminder_time?: string;
  reminder_minutes?: number;
  is_completed?: boolean;
  is_recurring?: boolean;
  recur_pattern?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
}

const api = axios.create({ baseURL: API_URL });

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("tf_refresh");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem("tf_token", res.data.accessToken);
          localStorage.setItem("tf_refresh", res.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = async (name: string, email: string, password: string) => {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
};

export const verifyOTP = async (email: string, otp: string) => {
  const res = await api.post("/auth/verify-otp", { email, otp });
  if (res.data.accessToken) {
    localStorage.setItem("tf_token", res.data.accessToken);
    localStorage.setItem("tf_refresh", res.data.refreshToken);
    localStorage.setItem("tf_user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const resendOTP = async (email: string) => {
  const res = await api.post("/auth/resend-otp", { email });
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  if (res.data.accessToken) {
    localStorage.setItem("tf_token", res.data.accessToken);
    localStorage.setItem("tf_refresh", res.data.refreshToken);
    localStorage.setItem("tf_user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token: string, password: string) => {
  const res = await api.post("/auth/reset-password", { token, password });
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem("tf_token");
  localStorage.removeItem("tf_refresh");
  localStorage.removeItem("tf_user");
};

export const getProfile = async (): Promise<User> => {
  const res = await api.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (data: Partial<User>) => {
  const res = await api.put("/auth/profile", data);
  return res.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await api.put("/auth/change-password", { currentPassword, newPassword });
  return res.data;
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get("/tasks");
  return res.data;
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const res = await api.post("/tasks", task);
  return res.data;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const res = await api.put(`/tasks/${id}`, updates);
  return res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const completeTask = async (id: string): Promise<Task> => {
  const res = await api.patch(`/tasks/${id}/complete`);
  return res.data;
};

export const fetchAnalytics = async () => {
  const res = await api.get("/tasks/analytics");
  return res.data;
};

export default api;

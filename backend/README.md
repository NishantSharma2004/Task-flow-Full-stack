# Task Manager — Backend API

Node.js + Express + SQLite REST API, designed to integrate with the React/Vite/TypeScript frontend running on `http://localhost:8080`.

---

## Folder Structure

```
backend/
├── server.js                  # App entry point — wires everything together
├── package.json
├── .env.example
│
├── config/
│   └── config.js              # Centralised env-var config
│
├── database/
│   ├── db.js                  # SQLite connection + schema init
│   └── tasks.db               # Auto-created on first run (git-ignored)
│
├── models/
│   └── taskModel.js           # All SQL queries + DB ↔ frontend field mapping
│
├── controllers/
│   └── taskController.js      # Request/response logic per endpoint
│
├── routes/
│   └── taskRoutes.js          # Express router — maps URLs to controllers
│
├── services/
│   └── taskValidation.js      # Pure validation helpers (no Express deps)
│
└── middleware/
    ├── errorHandler.js        # Central error handler (registered last)
    └── notFoundHandler.js     # 404 catch-all
```

---

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy env file and adjust if needed
cp .env.example .env

# 3. Start the development server (auto-restarts on file changes)
npm run dev

# OR start in production mode
npm start
```

The server starts on **http://localhost:5000** by default.

---

## Environment Variables

| Variable      | Default                   | Description                          |
|---------------|---------------------------|--------------------------------------|
| `NODE_ENV`    | `development`             | `development` or `production`        |
| `PORT`        | `5000`                    | Port the API listens on              |
| `CORS_ORIGIN` | `http://localhost:8080`   | Allowed frontend origin              |
| `DB_PATH`     | `./database/tasks.db`     | Path to the SQLite database file     |

---

## Database Schema

```sql
CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name   TEXT    NOT NULL,
  category    TEXT    NOT NULL CHECK(category IN ('Study','Work','Personal','Health')),
  priority    TEXT    NOT NULL CHECK(priority  IN ('High','Medium','Low')),
  start_time  TEXT    NOT NULL,   -- HH:MM
  end_time    TEXT    NOT NULL,   -- HH:MM
  date        TEXT    NOT NULL,   -- YYYY-MM-DD
  status      TEXT    NOT NULL DEFAULT 'pending'
                      CHECK(status IN ('pending','completed')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### DB column → Frontend field mapping

| DB column    | Frontend field |
|--------------|---------------|
| `id`         | `id`          |
| `task_name`  | `name`        |
| `start_time` | `startTime`   |
| `end_time`   | `endTime`     |
| `category`   | `category`    |
| `priority`   | `priority`    |
| `date`       | `date`        |
| `status`     | `status`      |

---

## API Endpoints

All responses follow the same envelope:

```jsonc
// Success
{ "success": true, "data": <payload> }

// Error
{ "success": false, "message": "...", "errors": ["..."] }
```

---

### GET /tasks
Return all tasks ordered by date then priority.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Review chapter 4",
      "category": "Study",
      "priority": "High",
      "startTime": "09:00",
      "endTime": "10:30",
      "date": "2025-06-01",
      "status": "pending",
      "createdAt": "2025-06-01 08:00:00",
      "updatedAt": "2025-06-01 08:00:00"
    }
  ]
}
```

---

### POST /tasks
Create a new task.

**Request body**
```json
{
  "name": "Review chapter 4",
  "category": "Study",
  "priority": "High",
  "startTime": "09:00",
  "endTime": "10:30",
  "date": "2025-06-01",
  "status": "pending"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Review chapter 4",
    "category": "Study",
    "priority": "High",
    "startTime": "09:00",
    "endTime": "10:30",
    "date": "2025-06-01",
    "status": "pending",
    "createdAt": "2025-06-01 08:00:00",
    "updatedAt": "2025-06-01 08:00:00"
  }
}
```

**Response 422** (validation failure)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "'category' must be one of: Study, Work, Personal, Health",
    "'endTime' must be later than 'startTime'"
  ]
}
```

---

### PUT /tasks/:id
Update one or more fields of an existing task. All body fields are optional.

**Request body** (partial update example — toggle status)
```json
{ "status": "completed" }
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Review chapter 4",
    "category": "Study",
    "priority": "High",
    "startTime": "09:00",
    "endTime": "10:30",
    "date": "2025-06-01",
    "status": "completed",
    "createdAt": "2025-06-01 08:00:00",
    "updatedAt": "2025-06-01 09:05:00"
  }
}
```

**Response 404**
```json
{
  "success": false,
  "message": "Task with id '99' not found",
  "errors": []
}
```

---

### DELETE /tasks/:id

**Response 200**
```json
{
  "success": true,
  "data": { "id": "1", "deleted": true }
}
```

---

### GET /tasks/today
Returns tasks for today's date (YYYY-MM-DD from server clock), ordered by start time.

---

### GET /tasks/date/:date
Returns tasks for the supplied date.

**Example:** `GET /tasks/date/2025-06-15`

---

## Frontend API Layer (Axios)

Drop-in client functions that match the existing frontend interface:

```typescript
// src/api/tasks.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

export interface Task {
  id?: string;
  name: string;
  category: "Study" | "Work" | "Personal" | "Health";
  priority: "High" | "Medium" | "Low";
  startTime: string;
  endTime: string;
  date: string;
  status?: "pending" | "completed";
}

export const fetchTasks    = ()                        => api.get<{ data: Task[] }>("/tasks").then(r => r.data.data);
export const fetchToday    = ()                        => api.get<{ data: Task[] }>("/tasks/today").then(r => r.data.data);
export const fetchByDate   = (date: string)            => api.get<{ data: Task[] }>(`/tasks/date/${date}`).then(r => r.data.data);
export const createTask    = (task: Task)              => api.post<{ data: Task }>("/tasks", task).then(r => r.data.data);
export const updateTask    = (id: string, u: Partial<Task>) => api.put<{ data: Task }>(`/tasks/${id}`, u).then(r => r.data.data);
export const deleteTask    = (id: string)              => api.delete(`/tasks/${id}`).then(r => r.data.data);
```

---

## Error Reference

| Status | Meaning                                              |
|--------|------------------------------------------------------|
| 200    | Success                                              |
| 201    | Resource created                                     |
| 400    | Bad request (malformed input, e.g. bad date param)   |
| 404    | Task not found                                       |
| 422    | Validation failed (see `errors` array)               |
| 500    | Unexpected server error                              |

---

## Future Extension Points

The architecture is deliberately layered to make the following easy to add:

| Feature                  | Where to add                                          |
|--------------------------|-------------------------------------------------------|
| Task reminders           | `services/reminderService.js` + cron job in server.js |
| Productivity analytics   | `services/analyticsService.js` using `getStatsByDateRange` in taskModel |
| Weekly statistics        | New route `GET /stats/weekly` → new controller        |
| AI productivity insights | New route `POST /insights` → call OpenAI / Anthropic  |
| Authentication           | `middleware/auth.js` JWT guard on all `/tasks` routes |
| Rate limiting            | `express-rate-limit` middleware in server.js          |

---

## Health Check

```
GET /health
→ 200 { "status": "ok", "timestamp": "...", "environment": "development" }
```

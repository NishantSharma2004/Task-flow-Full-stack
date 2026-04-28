import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  NODE_ENV:       process.env.NODE_ENV       || "development",
  PORT:           parseInt(process.env.PORT, 10) || 5000,
  CORS_ORIGIN:    process.env.CORS_ORIGIN    || "http://localhost:8080",
  DB_PATH:        process.env.DB_PATH        || path.join(__dirname, "../database/tasks.db"),
  JWT_SECRET:     process.env.JWT_SECRET     || "taskflow_dev_secret_change_in_production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};

export default config;

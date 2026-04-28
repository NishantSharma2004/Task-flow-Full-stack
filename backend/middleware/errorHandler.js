/**
 * errorHandler.js
 *
 * Central Express error-handling middleware.
 * Must be registered LAST (after all routes).
 */

import config from "../config/config.js";

/**
 * Catches errors thrown / passed via next(err) from route handlers.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Log full stack in development, just the message in production
  if (config.NODE_ENV === "development") {
    console.error("❌ Unhandled error:", err);
  } else {
    console.error(`❌ ${err.message}`);
  }

  // SQLite constraint violation (e.g. invalid category/priority enum)
  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(422).json({
      success: false,
      message: "Database constraint violation. Check field values.",
      errors: [err.message],
    });
  }

  // Generic server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message:
      config.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
    ...(config.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * taskValidation.js
 *
 * Pure validation helpers — no framework dependency, easy to unit-test.
 */

const VALID_CATEGORIES = ["Study", "Work", "Personal", "Health"];
const VALID_PRIORITIES = ["High", "Medium", "Low"];
const VALID_STATUSES = ["pending", "completed"];

// Simple HH:MM time format check
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
// YYYY-MM-DD date format check
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a full task creation payload.
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateCreateTask = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("'name' is required and must be a non-empty string");
  } else if (data.name.trim().length > 200) {
    errors.push("'name' must be 200 characters or fewer");
  }

  if (!VALID_CATEGORIES.includes(data.category)) {
    errors.push(`'category' must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  if (!VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`'priority' must be one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  if (!data.startTime || !TIME_REGEX.test(data.startTime)) {
    errors.push("'startTime' must be a valid time in HH:MM format");
  }

  if (!data.endTime || !TIME_REGEX.test(data.endTime)) {
    errors.push("'endTime' must be a valid time in HH:MM format");
  }

  if (
    data.startTime &&
    data.endTime &&
    TIME_REGEX.test(data.startTime) &&
    TIME_REGEX.test(data.endTime) &&
    data.startTime >= data.endTime
  ) {
    errors.push("'endTime' must be later than 'startTime'");
  }

  if (!data.date || !DATE_REGEX.test(data.date)) {
    errors.push("'date' must be a valid date in YYYY-MM-DD format");
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validates a partial task update payload (all fields optional).
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateUpdateTask = (data) => {
  const errors = [];

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      errors.push("'name' must be a non-empty string");
    } else if (data.name.trim().length > 200) {
      errors.push("'name' must be 200 characters or fewer");
    }
  }

  if (data.category !== undefined && !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`'category' must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`'priority' must be one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  if (data.startTime !== undefined && !TIME_REGEX.test(data.startTime)) {
    errors.push("'startTime' must be a valid time in HH:MM format");
  }

  if (data.endTime !== undefined && !TIME_REGEX.test(data.endTime)) {
    errors.push("'endTime' must be a valid time in HH:MM format");
  }

  if (
    data.startTime &&
    data.endTime &&
    TIME_REGEX.test(data.startTime) &&
    TIME_REGEX.test(data.endTime) &&
    data.startTime >= data.endTime
  ) {
    errors.push("'endTime' must be later than 'startTime'");
  }

  if (data.date !== undefined && !DATE_REGEX.test(data.date)) {
    errors.push("'date' must be a valid date in YYYY-MM-DD format");
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
};

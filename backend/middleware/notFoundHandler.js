/**
 * notFoundHandler.js
 *
 * Catches any request that did not match a registered route.
 */

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found`,
  });
};

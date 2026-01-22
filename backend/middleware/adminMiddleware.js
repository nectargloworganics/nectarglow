/**
 * Admin Middleware
 * Allows access only if user role is ADMIN
 * Requires authMiddleware to run before this
 */

module.exports = function adminMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access only" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Admin check failed" });
  }
};

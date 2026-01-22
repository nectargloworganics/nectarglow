const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    // Step 1: Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // Step 2: Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    // Step 3: Extract token
    const token = authHeader.split(" ")[1];

    // Step 4: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    // Step 6: Continue
    next();

  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;

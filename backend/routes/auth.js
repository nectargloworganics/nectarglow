const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

/**
 * =========================
 * REGISTER
 * =========================
 * Body: { name, email, mobile, password }
 */
router.post("/register", async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        error: "Name, email, mobile and password are required"
      });
    }

    // 2️⃣ Normalize inputs
    email = email.trim().toLowerCase();
    mobile = mobile.replace(/\s+/g, "");

    // 3️⃣ Password policy
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters"
      });
    }

    // 4️⃣ Check if user already exists (email OR mobile)
    const existingUser = await pool.query(
      `
      SELECT id, email, mobile
      FROM users
      WHERE email = $1 OR mobile = $2
      `,
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.email === email) {
        return res.status(409).json({ error: "Email already registered" });
      }
      return res.status(409).json({ error: "Mobile number already registered" });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Insert user
    await pool.query(
      `
      INSERT INTO users (name, email, mobile, password, role)
      VALUES ($1, $2, $3, $4, 'USER')
      `,
      [name, email, mobile, hashedPassword]
    );

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * =========================
 * LOGIN (Email OR Mobile)
 * =========================
 * Body: { email OR mobile, password }
 */
router.post("/login", async (req, res) => {
  try {
    let { email, mobile, password } = req.body;

    // 1️⃣ Validate input
    if (!password || (!email && !mobile)) {
      return res.status(400).json({
        error: "Email or mobile and password required"
      });
    }

    if (email) email = email.trim().toLowerCase();
    if (mobile) mobile = mobile.replace(/\s+/g, "");

    // 2️⃣ Find user (IMPORTANT: no OR bug)
    let result;
    if (email) {
      result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM users WHERE mobile = $1`,
        [mobile]
      );
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid login" });
    }

    const user = result.rows[0];

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid login" });
    }

    // 4️⃣ Create JWT (with role)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
router.post("/login", async (req, res) => {
  try {
    let { email, mobile, password } = req.body;

    if (!password || (!email && !mobile)) {
      return res.status(400).json({ error: "Email or mobile and password required" });
    }

    if (email) email = email.trim().toLowerCase();
    if (mobile) mobile = mobile.trim();

    // Step 1: Find user by email OR mobile
    const result = await pool.query(
      `SELECT * FROM users
       WHERE email = $1 OR mobile = $2`,
      [email || null, mobile || null]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid login" });
    }

    const user = result.rows[0];

    // Step 2: Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid login" });
    }

    // Step 3: Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});




router.post("/register", async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;

    // Step 1: Validate input
    if (!email || !mobile || !password) {
      return res.status(400).json({ error: "Email, mobile and password required" });
    }

    // Step 2: Normalize
    email = email.trim().toLowerCase();
    mobile = mobile.trim();

    // Step 3: Check if email OR mobile already exists
    const existingUser = await pool.query(
      `SELECT id, email, mobile
       FROM users
       WHERE email = $1 OR mobile = $2`,
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User already exists with this email or mobile"
      });
    }

    // Step 4: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Insert user
    await pool.query(
      `INSERT INTO users (name, email, mobile, password, role)
       VALUES ($1, $2, $3, $4, 'USER')`,
      [name, email, mobile, hashedPassword]
    );

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});



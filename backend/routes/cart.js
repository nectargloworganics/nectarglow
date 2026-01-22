const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/cart/test-db
router.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1");
    res.json({
      success: true,
      message: "Connected to Supabase successfully",
      result: result.rows
    });
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * GET ALL PRODUCTS
 * GET /api/products
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, price, description
       FROM products
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch products error:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;

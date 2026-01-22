const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /api/cart/add
router.post("/add", async (req, res) => {
  try {
    const { user_id, product_id, quantity = 1 } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({ error: "user_id and product_id required" });
    }

    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [user_id, product_id, quantity]
    );

    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error("Cart insert error:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

module.exports = router;

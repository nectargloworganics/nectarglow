const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/cart/add
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    await pool.query(
      `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart.quantity + $3
      `,
      [userId, product_id, quantity]
    );

    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error("Cart error:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

module.exports = router;

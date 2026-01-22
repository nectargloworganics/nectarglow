const router = require("express").Router();
const db = require("../db");

// Add item to cart
router.post("/add", async (req, res) => {
  const { user_id, product_id } = req.body;

  // Input validation
  if (!user_id || !product_id) {
    return res.status(400).json({ error: "user_id and product_id are required" });
  }

  try {
    await db.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, 1)",
      [user_id, product_id]
    );

    res.status(200).json({ message: "Added to cart" });
  } catch (err) {
    console.error("Error adding to cart:", err.message);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

module.exports = router;

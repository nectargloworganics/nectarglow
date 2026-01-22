const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ADD PRODUCT
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price required" });
    }

    await pool.query(
      `INSERT INTO products (name, price, description)
       VALUES ($1, $2, $3)`,
      [name, price, description || ""]
    );

    res.json({ message: "Product added successfully" });
  } catch (err) {
    console.error("Add product error:", err.message);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// UPDATE PRODUCT
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, description } = req.body;

    await pool.query(
      `UPDATE products
       SET name = $1, price = $2, description = $3
       WHERE id = $4`,
      [name, price, description, req.params.id]
    );

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE PRODUCT
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM products WHERE id = $1`,
      [req.params.id]
    );

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;

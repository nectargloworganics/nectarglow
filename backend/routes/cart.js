const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");



/**
 * ADD TO CART
 * POST /api/cart/add
 * Body: { product_id, quantity }
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    await pool.query(
      `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
      `,
      [userId, product_id, quantity]
    );

    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error("Add to cart error:", err.message);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});



/**
 * GET CART ITEMS
 * GET /api/cart
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        p.id AS product_id,
        p.name,
        p.price,
        c.quantity,
        (p.price * c.quantity) AS total
      FROM cart c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = $1
      ORDER BY p.name
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch cart error:", err.message);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});



/**
 * UPDATE CART QUANTITY
 * PUT /api/cart/update
 * Body: { product_id, quantity }
 */
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || quantity < 1) {
      return res.status(400).json({ error: "Invalid product or quantity" });
    }

    await pool.query(
      `
      UPDATE cart
      SET quantity = $1
      WHERE user_id = $2 AND product_id = $3
      `,
      [quantity, userId, product_id]
    );

    res.json({ message: "Quantity updated" });
  } catch (err) {
    console.error("Update cart error:", err.message);
    res.status(500).json({ error: "Failed to update cart" });
  }
});



/**
 * REMOVE ITEM FROM CART
 * DELETE /api/cart/remove/:productId
 */
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await pool.query(
      `
      DELETE FROM cart
      WHERE user_id = $1 AND product_id = $2
      `,
      [userId, productId]
    );

    res.json({ message: "Item removed" });
  } catch (err) {
    console.error("Remove cart item error:", err.message);
    res.status(500).json({ error: "Failed to remove item" });
  }
});



/**
 * CHECKOUT
 * POST /api/cart/checkout
 */
router.post("/checkout", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;

    await client.query("BEGIN");

    const cartItems = await client.query(
      `
      SELECT c.product_id, c.quantity, p.price
      FROM cart c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    if (cartItems.rows.length === 0) {
      throw new Error("Cart is empty");
    }

    const total = cartItems.rows.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, total)
      VALUES ($1, $2)
      RETURNING id
      `,
      [userId, total]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of cartItems.rows) {
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, price, quantity)
        VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.product_id, item.price, item.quantity]
      );
    }

    await client.query(
      `DELETE FROM cart WHERE user_id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Order placed successfully",
      order_id: orderId
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Checkout error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});



module.exports = router;

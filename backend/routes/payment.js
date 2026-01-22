const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE RAZORPAY ORDER
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { order_id } = req.body;

    const result = await pool.query(
      "SELECT total FROM orders WHERE id = $1 AND user_id = $2",
      [order_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const amount = result.rows[0].total * 100;

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: order_id
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// VERIFY PAYMENT
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    await pool.query(
      "UPDATE orders SET status = 'PAID' WHERE id = $1",
      [order_id]
    );

    res.json({ message: "Payment verified & order confirmed" });

  } catch (err) {
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;

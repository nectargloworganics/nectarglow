const router = require("express").Router();
const db = require("../db");

router.post("/add", async (req, res) => {
  const { user_id, product_id } = req.body;

  await db.query(
    "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1,$2,1)",
    [user_id, product_id]
  );

  res.json({ message: "Added to cart" });
});

module.exports = router;

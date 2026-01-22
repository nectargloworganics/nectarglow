const router = require("express").Router();
const db = require("../db");

router.get("/", async (_, res) => {
  const result = await db.query("SELECT * FROM products ORDER BY created_at DESC");
  res.json(result.rows);
});

module.exports = router;

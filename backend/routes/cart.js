router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        c.id,
        p.name,
        p.price,
        c.quantity,
        (p.price * c.quantity) AS total
      FROM cart c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

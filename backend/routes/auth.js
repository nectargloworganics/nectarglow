router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: "Invalid login" });
  }

 const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role   // ✅ ADD THIS
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


  res.json({ token });
});



router.post("/register", async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;

    // Step 1: Validate input
    if (!email || !mobile || !password) {
      return res.status(400).json({ error: "Email, mobile and password required" });
    }

    // Step 2: Normalize
    email = email.trim().toLowerCase();
    mobile = mobile.trim();

    // Step 3: Check if email OR mobile already exists
    const existingUser = await pool.query(
      `SELECT id, email, mobile
       FROM users
       WHERE email = $1 OR mobile = $2`,
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User already exists with this email or mobile"
      });
    }

    // Step 4: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Insert user
    await pool.query(
      `INSERT INTO users (name, email, mobile, password, role)
       VALUES ($1, $2, $3, $4, 'USER')`,
      [name, email, mobile, hashedPassword]
    );

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

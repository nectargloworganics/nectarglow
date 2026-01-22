require("dotenv").config();
const express = require("express");
const os = require('os');
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");

const app = express();

// Optional: Detect CPU cores and set WEB_CONCURRENCY if not already set
process.env.WEB_CONCURRENCY = process.env.WEB_CONCURRENCY || os.cpus().length;
console.log(`WEB_CONCURRENCY set to: ${process.env.WEB_CONCURRENCY}`);

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/admin/products", require("./routes/adminProducts"));
app.use("/api/admin/orders", require("./routes/adminOrders"));
app.use("/api/payment", require("./routes/payment"));



app.get("/", (_, res) => {
  res.send("NectarGlow API running");
});

// Use Render's PORT environment variable, fallback to 10000 for local testing
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




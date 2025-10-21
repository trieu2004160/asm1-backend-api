const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { initDb } = require("./lib/db");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure JWT secret exists to avoid runtime errors during auth
if (!process.env.JWT_SECRET) {
  // Ephemeral secret for local/dev to prevent crashes; recommend real secret via .env
  const crypto = require("crypto");
  const generated = crypto.randomBytes(32).toString("hex");
  process.env.JWT_SECRET = generated;
  console.warn(
    "[WARN] JWT_SECRET is not set. Generated a temporary secret for this session. Set JWT_SECRET in server/.env for stable tokens."
  );
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

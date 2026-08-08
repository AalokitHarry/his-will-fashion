import "dotenv/config";
import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders.js";

const app = express();
const PORT = process.env.PORT || 4242;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  });
});

app.use("/api/orders", ordersRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

app.listen(PORT, () => {
  console.log(`His Will Fashion API running on http://localhost:${PORT}`);
});

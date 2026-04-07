import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyticsRoutes from "./routes/analytics.routes.js";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Analytics API running on http://localhost:${PORT}`);
});

export default app;

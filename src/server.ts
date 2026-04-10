import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import cors from "cors";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Analytics running on http://localhost:${PORT}`);
});

export default app;

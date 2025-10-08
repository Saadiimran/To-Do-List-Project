import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(morgan("dev"));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);

// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
export default app;

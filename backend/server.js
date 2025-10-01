import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tasksRouter from "./tasks.js";

dotenv.config({ path: "./credentials/env" });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api", tasksRouter);

app.listen(PORT, () => console.log("server is running on port", PORT));

import express from "express";
import pool from "./db.js";

const router = express.Router();

router.get("/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tasks");
    res.send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error", error: err.message });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const { taskText } = req.body;
    console.log("POST /api/tasks body:", req.body);
    if (!taskText || taskText.length === 0 || !taskText.trim()) {
      return res.status(400).send("task text is required");
    }
    const [result] = await pool.query(
      "INSERT INTO tasks (taskText) VALUES (?)",
      [taskText.trim()]
    );
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [
      [result.insertId],
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "task not found" });
    }
    res.status(201).json({ message: "task deleted" });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { taskText } = req.body;
  try {
    if (!taskText || taskText.trim() === "") {
      res.status(404).send({ message: "Task can't be empty" });
    }
    const [result] = await pool.query(
      "UPDATE tasks SET taskText = ?",
      [taskText],
      "WHERE id = ?",
      [id]
    );
    res.status(201).json({ message: "Task updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

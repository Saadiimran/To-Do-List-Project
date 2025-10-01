import { defineStore } from "pinia";
import api from "../api.js";

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),
  getters: {
    remainingTasks(state) {
      return state.tasks.filter((t) => !t.completed).length;
    },
  },
  actions: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get("/tasks");
        this.tasks = res.data;
      } catch (err) {
        console.error("fetching error:", err);
        this.error = err.message || "failed to fetch tasks";
      } finally {
        this.loading = false;
      }
    },
    async addTasks(task) {
      if (!task || !task.trim()) return;
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/tasks", { taskText: task.trim() });
        this.tasks.push(res.data);
      } catch (err) {
        console.error("addTask error: ", err);
        this.error = err.message || "failed to add task";
      } finally {
        this.loading = false;
      }
    },
    async updateTask(id, patch) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.patch(`/${id}`, patch);
        const idx = this.tasks.findIndex((t) => t.id === id);
        if (idx !== -1) this.tasks[idx] = { ...this.tasks[idx], ...patch };
      } catch (err) {
        console.error("updateTask error: ", err);
        this.error = err.message || "failed to update task";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteTask(id) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/${id}`);
        this.tasks = this.tasks.filter((t) => t.id !== id);
      } catch (err) {
        console.log("deleteTask error: ", err);
        this.error = err.message || "error in delete task";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

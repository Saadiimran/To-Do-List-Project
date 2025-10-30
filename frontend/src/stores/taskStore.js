// src/stores/taskStore.js
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
    // helper to normalize a raw server task row into a frontend-friendly object
    normalizeTask(raw) {
      // extract images: backend may return `images` array or a JSON string in `img_path` / `image_path`
      let images = [];
      if (Array.isArray(raw.images)) {
        images = raw.images;
      } else if (raw.img_path) {
        try {
          images = JSON.parse(raw.img_path);
        } catch (e) {
          images = [];
        }
      } else if (raw.image_path) {
        try {
          images = JSON.parse(raw.image_path);
        } catch (e) {
          images = [];
        }
      }

      return {
        id: raw.id,
        user_id: raw.user_id,
        title: raw.title,
        priority: raw.priority,
        description: raw.description,
        status: raw.status ?? "open",
        created_at: raw.created_at ?? raw.createdAt ?? null,
        images,
        raw, // keep raw for debugging if needed
      };
    },

    // GET /tasks
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.findAll();
        // Debug log to inspect shape
        console.log("DEBUG: GET /tasks response:", res.data);

        // Accept either top-level array or { tasks: [...] }
        const payload = res.data;
        const serverTasks = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.tasks)
          ? payload.tasks
          : [];

        this.tasks = serverTasks.map((t) => this.normalizeTask(t));
        return this.tasks;
      } catch (err) {
        console.error("taskStore.fetchTasks error:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // POST /tasks - payload should be { title, priority, description, images: [dataUrl,...] }
    async createTask(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/tasks", payload);
        // if backend returns created task object, normalize & prepend it
        if (res.data && (res.data.id || res.data.task)) {
          const serverTask = res.data.task ?? res.data;
          const normalized = this.normalizeTask(serverTask);
          // put newest on top
          this.tasks.unshift(normalized);
          return res.data;
        }
        // fallback: refresh list
        await this.fetchTasks();
        return res.data;
      } catch (err) {
        console.error("taskStore.createTask error:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // PATCH /tasks/:id
    async updateTask(id, patch) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.patch(`/tasks/${id}`, patch);
        const idx = this.tasks.findIndex((t) => t.id === id);
        if (idx !== -1) {
          // merge server response if provided, else merge patch locally
          const updated =
            res.data && (res.data.id || res.data.updated)
              ? this.normalizeTask(res.data)
              : { ...this.tasks[idx], ...patch };
          this.tasks[idx] = updated;
        }
        return res.data;
      } catch (err) {
        console.error("taskStore.updateTask error:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // DELETE /tasks/:id
    async deleteTask(id) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.delete(`/tasks/${id}`);
        this.tasks = this.tasks.filter((t) => t.id !== id);
        return res.data;
      } catch (err) {
        console.error("taskStore.deleteTask error:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

// src/stores/authStore.js
import { defineStore } from "pinia";
import api from "../api";

function parseAxiosError(err) {
  if (!err) return { kind: "form", message: "Unknown error" };
  if (!err.response)
    return { kind: "network", message: err.message || "Network error" };
  const { status, data } = err.response;
  if (status === 400 && data?.errors)
    return {
      kind: "field",
      fields: data.errors,
      message: data.message || "Validation error",
    };
  if (status === 409) {
    if (data?.field)
      return {
        kind: "field",
        fields: { [data.field]: data.error || data.message },
        message: data.error || data.message,
      };
    return {
      kind: "form",
      message: data?.error || data?.message || "Email already exists",
    };
  }
  if (status === 401)
    return {
      kind: "form",
      message: data?.error || data?.message || "Invalid credentials",
    };
  if (status === 429 || status === 423)
    return {
      kind: "form",
      message: data?.error || data?.message || "Too many attempts",
    };
  return {
    kind: "form",
    message: data?.error || data?.message || `Server error (${status})`,
  };
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  }),
  actions: {
    // simply set token in localStorage + axios header
    setToken(token) {
      this.token = token || null;
      if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem("token");
        delete api.defaults.headers.common.Authorization;
      }
    },

    setUser(user) {
      this.user = user || null;
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    },

    // call this once on app startup (in main.js)
    initialize() {
      if (this.token) {
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`;
      } else {
        delete api.defaults.headers.common.Authorization;
      }
    },

    async signup(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/signup", {
          firstName: payload.firstname,
          lastName: payload.lastname,
          email: payload.email,
          password: payload.password,
          confirmPassword: payload.confirmpassword, // map confirm field
        });
        const token = res.data?.token ?? res.data?.access_token ?? null;
        const user = res.data?.user ?? null;
        this.setToken(token);
        this.setUser(user || null);
        return { success: true, user };
      } catch (err) {
        const parsed = parseAxiosError(err);
        this.error = parsed.message;
        return { success: false, errors: parsed };
      } finally {
        this.loading = false;
      }
    },

    async signin(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/signin", {
          email: payload.email,
          password: payload.password,
        });
        const token = res.data?.token ?? res.data?.access_token ?? null;
        const user = res.data?.user ?? null;
        if (!token) {
          const parsed = parseAxiosError({
            response: {
              status: 401,
              data: { message: "Authentication failed" },
            },
          });
          this.error = parsed.message;
          return { success: false, errors: parsed };
        }
        this.setToken(token);
        this.setUser(user || null);
        return { success: true, user };
      } catch (err) {
        const parsed = parseAxiosError(err);
        this.error = parsed.message;
        return { success: false, errors: parsed };
      } finally {
        this.loading = false;
      }
    },

    // verifies token by calling backend; clears on failure
    async fetchMe() {
      if (!this.token) {
        const raw = localStorage.getItem("user");
        if (raw) {
          this.user = JSON.parse(raw);
          return this.user;
        }
        return null;
      }

      this.loading = true;
      this.error = null;
      try {
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`;
        const res = await api.get("/auth/me");
        const serverUser = res.data?.user ?? res.data;
        this.setUser(serverUser);
        return this.user;
      } catch (err) {
        // token invalid/expired -> clear everything
        this.logout();
        return null;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.setToken(null);
      this.setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
    },
  },
});

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
    setToken(token) {
      this.token = token || null;
      if (token) {
        localStorage.setItem("token", token);
        // set default header for immediate use
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

    async signup(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/signup", {
          firstname: payload.firstname,
          lastname: payload.lastname,
          email: payload.email,
          password: payload.password,
        });
        const { token, user } = res.data;
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
        const { token, user } = res.data;
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

    async fetchMe() {
      // if we have no token, try to restore user from localStorage then bail
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
        // ensure header is set (in case page refreshed and we didn't set header)
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`;
        const res = await api.get("/auth/me");
        this.setUser(res.data.user);
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
      this.localStorage(null);
    },
  },
});

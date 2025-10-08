import { defineStore } from "pinia";
import api from "../api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  }),
  actions: {
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
        this.token = token;
        this.user = user;
        localStorage.setItem("token", token);
         localStorage.setItem("user", JSON.stringify(user));
        return { success: true, user };
      } catch (err) {
        this.error =
          err?.response?.data?.error || err.message || "Signup failed";
        return { success: false };
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
        this.token = token;
        this.user = user;
        localStorage.setItem("token", token);
        return { success: true };
      } catch (err) {
        this.error =
          err?.response?.data?.error || err.message || "Signin failed";
        return { success: false };
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return null;
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get("/auth/me");
        this.user = res.data.user;
        return this.user;
      } catch (err) {
        // token invalid or expired
        this.logout();
        return null;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem('user');
    },
  },
});

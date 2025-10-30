<template>
  <div class="min-h-screen bg-blue-600 flex items-center justify-center">
    <div
      class="rounded bg-white flex flex-row items-center my-8 w-8/10 h-[600px] mx-auto p-10"
    >
      <SignInForm @submit="handleSubmit" />
      <div class="w-1/2 h-full flex items-end justify-center">
        <img src="../assets/ach3 1.png" alt="SignInImage" class="h-[400px]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import SignInForm from "../components/auth/SignInForm.vue";
import { useAuthStore } from "../stores/authStore";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const globalError = ref(null);

async function handleSubmit(payload) {
  globalError.value = null;
  try {
    const result = await auth.signin(payload);
    console.log(
      "signin result:",
      result,
      "auth.user:",
      auth.user,
      "auth.error:",
      auth.error
    );

    // handle different signin return shapes:
    const ok =
      (result && result.success === true) || // explicit success flag
      (result && (result.token || result.accessToken)) || // token returned
      !!auth.user; // store set user

    if (ok) {
      const redirectTo =
        (Array.isArray(route.query.redirect)
          ? route.query.redirect[0]
          : route.query.redirect) || "/dashboard";
      await router.push(String(redirectTo));
      return;
    }

    // fallback error message
    globalError.value =
      auth.error || (result && result.message) || "Sign in failed";
  } catch (err) {
    console.error("signin error:", err);
    globalError.value =
      err?.response?.data?.message || err?.message || "Sign in failed";
  }
}
</script>

<style scoped></style>

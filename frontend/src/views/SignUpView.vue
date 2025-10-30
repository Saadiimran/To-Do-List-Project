<template>
  <div class="max-h-full bg-blue-600 flex items-center justify-center">
    <div class="rounded bg-white flex flex-row my-13 w-8/10 mx-auto p-10">
      <div class="w-5/10 h-full flex items-center justify-start">
        <img src="../assets/R 2.png" alt="" class="w-6/10 ml-5" />
      </div>
      <SignUpForm
        @submit="handleSubmit"
        :disabled="loading"
        :serverError="serverError"
        @clear-server-error="serverError = null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import SignUpForm from "../components/auth/SignUpForm.vue";
import { useAuthStore } from "../stores/authStore";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const globalError = ref(null);
const serverError = ref(null);
const loading = ref(false);

async function handleSubmit(payload) {
  globalError.value = null;
  serverError.value = null;
  loading.value = true;

  const result = await auth.signup(payload);
  console.log(result);
  loading.value = false;

  if (result.success) {
    const redirectTo = String(route.query.redirect || "/dashboard");
    await router.push(redirectTo);
    return;
  }
  const e = result.errors || {};

  if (e.field === "email") {
    serverError.value = { field: "email", message: e.message || e.error };
    return;
  }
  if (e.kind === "field" && e.fields && e.fields.email) {
    serverError.value = { field: "email", message: e.fields.email };
    return;
  }
  if (
    e.kind === "form" &&
    typeof e.message === "string" &&
    e.message.toLowerCase().includes("email")
  ) {
    serverError.value = { field: "email", message: e.message };
    return;
  }
  serverError.value = e || { message: auth.error || "Signup failed" };
}
</script>

<style scoped></style>

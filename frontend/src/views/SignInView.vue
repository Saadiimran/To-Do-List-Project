<template>
  <div class="min-h-screen bg-blue-600 flex items-center justify-center">
    <div class="rounded bg-white flex flex-row items-center my-8 w-8/10 h-[600px]  mx-auto p-10">
      <SignInForm @submit="handleSubmit" />
      <div class="w-1/2 h-full flex items-end justify-center ">
        <img src="../assets/ach3 1.png" alt="SignInImage" class="h-[400px]"/>
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
  const result = await auth.signin(payload);
  if (result.success) {
    const redirectTo = String(route.query.redirect || "/tasks");
    await router.push(redirectTo);
  } else {
    globalError.value = auth.error;
  }
}
</script>

<style scoped></style>

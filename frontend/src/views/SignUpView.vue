<template>
  <div class="max-h-full bg-blue-600 flex items-center justify-center">
    <div class="rounded bg-white flex flex-row my-13 w-8/10 mx-auto p-10">
      <div class="w-5/10 h-full flex items-center justify-start">
        <img src="../assets/R 2.png" alt="" class="w-6/10 ml-5" />
      </div>
      <SignUpForm @submit="handleSubmit" />
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

async function handleSubmit(payload) {
  globalError.value = null;
  const result = await auth.signup(payload);
  if (result.success) {
    const redirectTo = String(route.query.redirect || "/tasks");
    await router.push(redirectTo);
  } else {
    globalError.value = auth.error;
  }
}
</script>

<style scoped></style>

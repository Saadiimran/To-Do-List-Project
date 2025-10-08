<template>
  <div class="w-5/10 h-full flex flex-col gap-4 items-start justify-center">
    <h1 class="font-semibold text-2xl">Sign In</h1>
    <form @submit.prevent="onSubmit" class="w-full flex flex-col gap-4">
      <div v-if="error" class="text-red bg-slate-200 p-1 border-1">
        {{ error }}
      </div>
      <button
        class="flex flex-row border border-slate-400 rounded p-4 items-center w-full"
      >
        <i class="fa-solid fa-envelope"></i>
        <input
          type="text"
          v-model="email"
          placeholder="Enter your Email"
          class="pl-2 text-xs outline-0 w-full"
        />
      </button>

      <button
        class="flex flex-row border border-slate-400 rounded p-4 items-center w-full"
      >
        <i class="fa-solid fa-lock"></i>
        <input
          type="password"
          v-model="password"
          placeholder="Enter your Password"
          class="pl-2 text-xs outline-0 w-full"
        />
      </button>

      <button
        type="submit"
        :disabled="loading"
        class="p-3 bg-blue-600 text-white cursor-pointer w-3/20 rounded text-sm"
      >
        <span v-if="loading">Logging In</span>
        <span v-else>Login</span>
      </button>
      <p class="flex flex-row gap-1">
        Or, login with
        <router-link to=""><i class="fab fa-facebook-f"></i></router-link>
        <router-link to=""><i class="fab fa-instagram"></i></router-link>
        <router-link to=""><i class="fab fa-x-twitter"></i></router-link>
      </p>
      <p>
        Don't have an account?
        <router-link to="/signin" class="text-blue-600 bg-red"
          >Create One</router-link
        >
      </p>
    </form>
  </div>
</template>

<style scoped></style>
<script setup>
async function testclick() {
  console.log("link clicked");
}

import { ref } from "vue";

const emit = defineEmits(["submit"]);

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref(null);

const validateInput = () => {
  error.value = null;
  if (!email.value.trim() || !password.value.trim()) {
    error.value = "Pleasse fill in all values.";
    return false;
  }
  return true;
};

async function onSubmit() {
  if (!validateInput()) return;
  loading.value = true;
  try {
    emit("submit", {
      email: email.value.trim(),
      password: password.value.trim(),
    });
  } finally {
    loading.value = false;
  }
}
</script>

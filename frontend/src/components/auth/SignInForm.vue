<template>
  <div class="w-5/10 h-full flex flex-col gap-4 items-start justify-center">
    <h1 class="font-semibold text-2xl">Sign In</h1>
    <form @submit.prevent="onSubmit" class="w-full flex flex-col gap-4">
      <div class="w-full">
        <div
          :class="[
            'flex flex-row border rounded p-4 items-center w-full',
            errors.email ? 'border-red-500' : 'border-slate-400',
          ]"
        >
          <i class="fa-solid fa-envelope"></i>
          <input
            type="text"
            v-model="email"
            @blur="validateEmail"
            @input="validateEmail"
            placeholder="Enter your Email"
            class="pl-2 text-xs outline-0 w-full"
          />
        </div>
        <p v-if="errors.email" class="text-red-500 text-xs mt-1 ml-1">
          {{ errors.email }}
        </p>
      </div>

      <div class="w-full">
        <div
          :class="[
            'flex flex-row border rounded p-4 items-center w-full',
            errors.password ? 'border-red-500' : 'border-slate-400',
          ]"
        >
          <i class="fa-solid fa-lock"></i>
          <input
            type="password"
            v-model="password"
            @blur="validatePassword"
            @input="validatePassword"
            placeholder="Enter your Password"
            class="pl-2 text-xs outline-0 w-full"
          />
        </div>
        <p v-if="errors.password" class="text-red-500 text-xs mt-1 ml-1">
          {{ errors.password }}
        </p>
      </div>

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
        <router-link to="/signup" class="text-blue-600">Create One</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
async function testclick() {
  console.log("link clicked");
}

import { ref } from "vue";

const emit = defineEmits(["submit"]);

const email = ref("");
const password = ref("");
const loading = ref(false);
const errors = ref({
  email: null,
  password: null,
});

const validateEmail = () => {
  if (!email.value.trim()) {
    errors.value.email = "Email required.";
    return false;
  }
  if (!isValidEmail(email.value)) {
    errors.value.email = "Enter a valid email.";
    return false;
  }
  errors.value.email = null;
  return true;
};

const validatePassword = () => {
  if (!password.value.trim()) {
    errors.value.password = "Password is required.";
    return false;
  }
  errors.value.password = null;
  return true;
};

const validateInput = () => {
  // reset errors to an object (don't set to null)
  errors.value = { email: null, password: null };

  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  return isEmailValid && isPasswordValid;
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

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
</script>
<style scoped></style>

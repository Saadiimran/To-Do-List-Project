<template>
  <div class="w-5/10 h-full flex flex-col gap-4 items-start justify-center">
    <h1 class="font-medium text-2xl">Sign Up</h1>
    <form @submit.prevent="onSubmit" class="w-full flex flex-col gap-4">
      <div v-if="error" class="text-red bg-slate-200 p-1 border-1">
        {{ error }}
      </div>

      <button
        class="flex flex-row border border-slate-400 rounded p-4 items-center w-full"
      >
        <i class="fa-solid fa-user"></i>
        <input
          type="text"
          v-model="firstname"
          placeholder="Enter your First Name"
          class="pl-2 text-xs outline-0 w-full"
        />
      </button>

      <button
        class="flex flex-row border border-slate-400 rounded p-4 items-center w-full"
      >
        <i class="fa-regular fa-user"></i>
        <input
          type="text"
          v-model="lastname"
          placeholder="Enter your Last Name"
          class="pl-2 text-xs outline-0 w-full"
        />
      </button>

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
        class="flex flex-row border border-slate-400 rounded p-4 items-center w-full"
      >
        <i class="fa-solid fa-user-lock"></i>
        <input
          type="password"
          v-model="confirmpassword"
          placeholder="Confirm Password"
          class="pl-2 text-xs outline-0 w-full"
        />
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="p-3 bg-blue-600 text-white cursor-pointer w-3/10 rounded text-sm"
      >
        <span v-if="loading">Registering</span>
        <span v-else>Register</span>
      </button>
      <p>
        Already have an account?
        <router-link to="/signin" class="text-blue-600">Sign In</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped></style>
<script setup>
import { ref } from "vue";

const emit = defineEmits(["submit"]);

const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const confirmpassword = ref("");
const loading = ref(false);
const error = ref(null);

const validateInput = () => {
  error.value = null;
  if (
    !firstname.value.trim() ||
    !lastname.value.trim() ||
    !email.value.trim() ||
    !password.value.trim()
  ) {
    error.value = "Pleasse fill in all values.";
    return false;
  }
  if (password.value.length < 8) {
    error.value = "Password must be at least 8 characters.";
    return false;
  }
  if (password.value !== confirmpassword.value) {
    error.value = "Passwords don't match.";
    return false;
  }

  return true;
};

async function onSubmit() {
  if (!validateInput()) return;
  loading.value = true;
  try {
    emit("submit", {
      firstname: firstname.value.trim(),
      lastname: lastname.value.trim(),
      email: email.value.trim(),
      password: password.value.trim(),
      confirmpassword: confirmpassword.value.trim(),
    });
  } finally {
    loading.value = false;
  }
}
</script>

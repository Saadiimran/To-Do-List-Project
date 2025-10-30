<template>
  <div class="w-5/10 h-full flex flex-col gap-4 items-start justify-center">
    <h1 class="font-medium text-2xl">Sign Up</h1>
    <form @submit.prevent="onSubmit" class="w-full flex flex-col gap-4">
      <div class="w-full">
        <div
          :class="[
            'flex flex-row border rounded p-4 items-center w-full',
            errors.firstname ? 'border-red-500' : 'border-slate-400',
          ]"
        >
          <i class="fa-solid fa-user"></i>
          <input
            type="text"
            v-model="firstname"
            @blur="validateFirstname"
            @input="validateFirstname"
            placeholder="Enter your First Name"
            class="pl-2 text-xs outline-0 w-full"
          />
        </div>
        <p v-if="errors.firstname" class="text-red-500 text-xs mt-1 ml-1">
          {{ errors.firstname }}
        </p>
      </div>

      <div class="w-full">
        <div
          :class="[
            'flex flex-row border rounded p-4 items-center w-full',
            errors.lastname ? 'border-red-500' : 'border-slate-400',
          ]"
        >
          <i class="fa-regular fa-user"></i>
          <input
            type="text"
            v-model="lastname"
            @blur="validateLastname"
            @input="validateLastname"
            placeholder="Enter your Last Name"
            class="pl-2 text-xs outline-0 w-full"
          />
        </div>
        <p v-if="errors.lastname" class="text-red-500 text-xs mt-1 ml-1">
          {{ errors.lastname }}
        </p>
      </div>

      <div class="w-full">
        <div
          :class="[
            'flex flex-row border rounded p-4 items-center w-full',
            errors.email || serverEmailError
              ? 'border-red-500'
              : 'border-slate-400',
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
            :disabled="disabled"
            aria-describedby="email-error"
          />
        </div>
        <p
          v-if="errors.email || serverEmailError"
          id="email-error"
          class="text-red-500 text-xs mt-1 ml-1"
        >
          {{ errors.email || serverEmailError }}
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

      <div class="w-full">
        <div
          :class="[
            'flex flex-row border rounded p-4 items-center w-full',
            errors.confirmpassword ? 'border-red-500' : 'border-slate-400',
          ]"
        >
          <i class="fa-solid fa-user-lock"></i>
          <input
            type="password"
            v-model="confirmpassword"
            @blur="validateConfirmPassword"
            @input="validateConfirmPassword"
            placeholder="Confirm Password"
            class="pl-2 text-xs outline-0 w-full"
          />
        </div>
        <p v-if="errors.confirmpassword" class="text-red-500 text-xs mt-1 ml-1">
          {{ errors.confirmpassword }}
        </p>
      </div>
      <!-- Password Strength Indicator -->
      <div
        v-if="
          password &&
          confirmpassword &&
          !errors.password &&
          !errors.confirmpassword &&
          password === confirmpassword
        "
        class="mt-2 ml-1"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs text-gray-600">Strength:</span>
          <span
            :class="[
              'text-xs font-semibold',
              passwordStrength === 'weak' ? 'text-red-500' : '',
              passwordStrength === 'moderate' ? 'text-yellow-500' : '',
              passwordStrength === 'strong' ? 'text-green-500' : '',
            ]"
          >
            {{
              passwordStrength === "weak"
                ? "Weak"
                : passwordStrength === "moderate"
                ? "Moderate"
                : "Strong"
            }}
          </span>
        </div>
        <div class="flex gap-1">
          <div
            :class="[
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              passwordStrength === 'weak' ? 'bg-red-500' : 'bg-gray-200',
              passwordStrength === 'moderate' ? 'bg-yellow-500' : '',
              passwordStrength === 'strong' ? 'bg-green-500' : '',
            ]"
          ></div>
          <div
            :class="[
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              passwordStrength === 'moderate' ? 'bg-yellow-500' : 'bg-gray-200',
              passwordStrength === 'strong' ? 'bg-green-500' : '',
            ]"
          ></div>
          <div
            :class="[
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200',
            ]"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Use 8+ characters with uppercase, lowercase, numbers & symbols
        </p>
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="p-3 bg-blue-600 text-white cursor-pointer w-3/10 rounded text-sm disabled:opacity-50"
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
import { ref, computed } from "vue";

const emit = defineEmits(["submit", "clear-server-error"]);
const props = defineProps({
  serverError: {
    type: Object,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const confirmpassword = ref("");
const loading = ref(false);
const passwordStrength = ref(null); 


const errors = ref({
  firstname: null,
  lastname: null,
  email: null,
  password: null,
  confirmpassword: null,
});


const serverEmailError = computed(() => {
  const se = props.serverError;
  if (!se) return null;
  if (se.field === "email") return se.message || se.error || null;
  if (se.kind === "field" && se.fields && se.fields.email)
    return se.fields.email;
  
  if (
    se.kind === "form" &&
    typeof se.message === "string" &&
    se.message.toLowerCase().includes("email")
  ) {
    return se.message;
  }
  return null;
});


const checkPasswordStrength = (pwd) => {
  if (!pwd || pwd.length === 0) {
    passwordStrength.value = null;
    return;
  }

  const hasUpperCase = /[A-Z]/.test(pwd);
  const hasLowerCase = /[a-z]/.test(pwd);
  const hasNumbers = /[0-9]/.test(pwd);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(pwd);
  const length = pwd.length;

  const charTypeCount = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSymbols,
  ].filter(Boolean).length;

  if (length < 8 || charTypeCount === 1) {
    passwordStrength.value = "weak";
    return;
  }

  if (length >= 12 && charTypeCount >= 3 && hasSymbols) {
    passwordStrength.value = "strong";
    return;
  }

  if (length >= 8 && charTypeCount === 4) {
    passwordStrength.value = "strong";
    return;
  }
  passwordStrength.value = "moderate";
};

const validateFirstname = () => {
  if (!firstname.value.trim()) {
    errors.value.firstname = "What is your first name?";
    return false;
  }
  errors.value.firstname = null;
  return true;
};

const validateLastname = () => {
  if (!lastname.value.trim()) {
    errors.value.lastname = "What is your last name?";
    return false;
  }
  errors.value.lastname = null;
  return true;
};

const validateEmail = () => {
  if (
    props.serverError &&
    (props.serverError.field === "email" ||
      (props.serverError.kind === "form" &&
        typeof props.serverError.message === "string" &&
        props.serverError.message.toLowerCase().includes("email")))
  ) {
    emit("clear-server-error");
  }

  if (!email.value.trim()) {
    errors.value.email = "Email is required.";
    return false;
  }
  if (!isValidEmail(email.value)) {
    errors.value.email = "Enter a valid email.";
    return false;
  }
  errors.value.email = null;
  return true;
};

const handleEmailInput = () => {
  validateEmail();
};

const validatePassword = () => {
  checkPasswordStrength(password.value);

  if (!password.value.trim()) {
    errors.value.password = "Password is required.";
    return false;
  }
  errors.value.password = null;
  return true;
};

const validateConfirmPassword = () => {
  if (!confirmpassword.value.trim()) {
    errors.value.confirmpassword = "Please confirm your password.";
    return false;
  }
  if (password.value !== confirmpassword.value) {
    errors.value.confirmpassword = "Passwords don't match.";
    return false;
  }
  errors.value.confirmpassword = null;
  return true;
};

const validateInput = () => {
  const isFirstnameValid = validateFirstname();
  const isLastnameValid = validateLastname();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  return (
    isFirstnameValid &&
    isLastnameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid
  );
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

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
</script>

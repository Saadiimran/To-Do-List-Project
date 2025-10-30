<template>
  <header
    class="flex sticky top-0 left-0 items-center justify-between md:justify-evenly h-20 shadow px-5 z-10 bg-white"
  >
    <div>
      <a href="#">
        <h1 class="text-xl md:text-3xl font-medium">
          <span class="text-blue-600">To</span>-Do
        </h1>
      </a>
    </div>

    <div class="flex items-center gap-2 w-3/6">
      <input
        v-model="searchText"
        @keyup.enter="emitSearch"
        type="text"
        class="rounded shadow px-2 h-8 w-5/6 md:h-10 md:w-6/7 text-xs md:text-sm"
        :placeholder="searchPlaceholder"
      />
      <button
        @click="emitSearch"
        class="bg-blue-600 rounded-lg md:rounded-xl p-1 md:px-3 md:py-2 text-white shadow-md cursor-pointer"
        aria-label="Search tasks"
      >
        <i class="fa-solid fa-magnifying-glass"></i>
      </button>
    </div>

    <div class="hidden md:flex md:items-center gap-3">
      <button
        class="text-white bg-blue-600 rounded-xl h-8 w-8 cursor-pointer"
        aria-label="Notifications"
      >
        <i class="fa-solid fa-bell"></i>
      </button>
      <button
        class="text-white bg-blue-600 rounded-xl h-8 w-8 cursor-pointer"
        aria-label="Calendar"
      >
        <i class="fa-solid fa-calendar-days"></i>
      </button>
      <div class="md:flex md:flex-col">
        <p class="font-medium">{{ day }}</p>
        <p class="text-blue-400">{{ date }}</p>
      </div>
    </div>

    <button
      class="z-50 md:hidden"
      @click="toggleOpen"
      :aria-expanded="isOpen.toString()"
      aria-label="Toggle menu"
    >
      <i v-if="!isOpen" class="fa-solid fa-bars"></i>
      <i v-else class="fa-solid fa-xmark text-white"></i>
    </button>

    <div
      :class="[
        'fixed top-0 right-0 h-full w-52 z-40 transform transition-transform duration-300 bg-blue-600 shadow-lg flex flex-col items-center text-white',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        'md:hidden',
      ]"
    >
      <img
        :src="avatarSrc"
        alt="avatar"
        class="inline-block size-15 rounded-full ring-2 ring-gray-300 outline -outline-offset-1 outline-white/10 mt-20 sm:mt-5"
      />
      <div class="text-center pt-5 text-white">
        <h1>{{ username }}</h1>
        <p>{{ email }}</p>
      </div>

      <slot name="mobile-menu">
        <nav class="mt-4 w-full px-4">
          <button class="w-full text-left py-2 rounded hover:bg-white/10">
            Dashboard
          </button>
          <button class="w-full text-left py-2 rounded hover:bg-white/10">
            My Tasks
          </button>
          <button class="w-full text-left py-2 rounded hover:bg-white/10">
            Settings
          </button>
        </nav>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: undefined }, // supports v-model:open
  username: { type: String, default: "your username" },
  email: { type: String, default: "abc@example.com" },
  day: { type: String, default: "" },
  date: { type: String, default: "" },
  avatarSrc: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=256&h=256&q=80",
  },
  searchPlaceholder: { type: String, default: "Search your tasks here" },
});

const emit = defineEmits(["update:modelValue", "search", "toggle"]);

const internalOpen = ref(false);
const isControlled = computed(() => props.modelValue !== undefined);

const isOpen = computed({
  get() {
    return isControlled.value ? props.modelValue : internalOpen.value;
  },
  set(v) {
    if (isControlled.value) emit("update:modelValue", v);
    else internalOpen.value = v;
  },
});

const searchText = ref("");

function emitSearch() {
  emit("search", searchText.value);
}

function toggleOpen() {
  isOpen.value = !isOpen.value;
  emit("toggle", isOpen.value);
}
</script>

<style scoped></style>

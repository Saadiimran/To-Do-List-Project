<template>
  <div class="min-h-screen">
    <Navbar
      v-model="open"
      :username="username"
      :email="email"
      :day="day"
      :date="date"
    >
      <template #mobile-menu>
        <SideBar />
      </template>
    </Navbar>

    <div class="max-w-full flex">
      <div
        class="w-2/10 hidden md:flex md:flex-col items-center rounded bg-blue-600 text-white sticky  top-20 h-screen"
      >
        <img
          src="../assets/avatar.png"
          alt=""
          class="inline-block size-15 rounded-full ring-2 ring-gray-300 outline -outline-offset-1 outline-white/10 mt-5 cursor-pointer"
        />
        <div class="text-center pt-5">
          <h1>{{ username }}</h1>
          <p>{{ email }}</p>
        </div>
        <SideBar />
      </div>
      <div class="w-full flex flex-col">
        <div class="flex flex-col md:w-5/10 w-full mt-5">
          <h1 class="text-xl md:text-3xl font-medium ml-8">
            Welcome back, {{ firstName }}
            <i class="fa-regular fa-hand-wave"></i>
          </h1>
        </div>
        <div
          class="w-full flex flex-row border-2 rounded border-gray-200 mt-5 p-5 mx-5"
        >
          <!-- Add Task button -->
          <div class="w-5/10 rounded-2xl shadow-xl">
            <div class="flex justify-between px-5 pt-5 items-center">
              <div>
                <i class="fa-solid fa-list-check text-gray-500"></i>
                <span class="text-blue-600"> To-do</span>
              </div>
              <div class="flex items-center" @click="openAddModal">
                <i class="fa-solid fa-plus text-xs text-blue-600"></i>
                <button class="text-gray-500 text-sm">Add Task</button>
              </div>
            </div>
            <div
              class="px-5 pt-1 flex gap-5 justify-between items-center text-xs"
            >
              <span>{{ date }} </span>
              <span class="text-gray-500">{{ day }}</span>
            </div>
            <div class="mt-2 space-y-1">
              <template v-if="loadingTasks">
                <div class="text-sm text-gray-500">Loading Tasks...</div>
              </template>
              <template v-else>
                <div class="grid gap-3 p-5">
                  <TaskCard
                    v-for="task in taskStore.tasks"
                    :key="task.id"
                    :title="task.title"
                    :priority="task.priority"
                    :description="task.description"
                    :status="task.status || ''"
                    :images="task.images || []"
                    :created-at="task.created_at || task.createdAt || ''"
                  />
                </div>
              </template>
            </div>
          </div>
          <!-- Toast / popup -->
          <div
            v-if="toast.show"
            :class="[
              'fixed top-5 right-5 z-50 shadow-lg rounded-md px-4 py-3 flex items-start gap-3',
              toast.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : '',
              toast.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : '',
              toast.type === 'warn'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : '',
            ]"
          >
            <div class="flex-1">
              <div class="font-semibold">{{ toast.title }}</div>
              <div class="text-sm mt-1">{{ toast.message }}</div>
            </div>

            <button
              @click="hideToast"
              class="ml-4 text-sm font-medium px-2 py-1 rounded hover:bg-white/30"
              aria-label="Close toast"
            >
              ✕
            </button>
          </div>

          <!-- the modal component -->
          <AddTaskModal
            ref="addTaskModalRef"
            v-model="showAddModal"
            @submitted="handleAddTaskSubmitted"
          />

          <div class="w-5/10 flex flex-col gap-5 mt-5">
            <div
              class="rounded shadow w-full h-auto flex flex-col px-4 py-2"
              id="task-status"
            >
              <div class="flex flex-row items-center font-medium">
                <i class="fa-solid fa-clipboard-list text-gray-400"></i>
                <a href=""><p class="text-blue-600">Task Status</p></a>
              </div>
              <div class="flex-row ml-3 mt-5">
                <button
                  class="inline-flex items-center justify-center rounded-full"
                  :style="ringStyle"
                  aria-label="Percent ring"
                >
                  <span class="bg-white px-6 py-7 rounded-full font-semibold">
                    {{ pct }}%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import SideBar from "../components/sidebar/SideBar.vue";
import Navbar from "../components/Navbar.vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useTaskStore } from "../stores/taskStore";
import AddTaskModal from "./task/AddTaskModal.vue";
import TaskCard from "./task/TaskCard.vue";

const route = useRoute();
const auth = useAuthStore();
const taskStore = useTaskStore();

const day = ref("");
const date = ref("");
const open = ref(false);
const showAddModal = ref(false);
const addTaskModalRef = ref(null);
const toast = ref({
  show: false,
  title: "",
  message: "",
  type: "success",
  timeoutId: null,
});
const placeholder = "/images/avatar-placeholder.png";

const username = computed(() => {
  const u = auth.user;
  if (!u) return "your username";

  return u.first_name + " " + u.last_name;
});

const firstName = computed(() => {
  const u = auth.user;
  if (!u) return "your username";

  return u.first_name;
});

const email = computed(() => {
  const u = auth.user;
  return (u && u.email) || "abc@example.com";
});

function showToast({
  title = "",
  message = "",
  type = "success",
  duration = 3500,
}) {
  // clear any previous timeout
  if (toast.value.timeoutId) {
    clearTimeout(toast.value.timeoutId);
    toast.value.timeoutId = null;
  }

  toast.value.title = title;
  toast.value.message = message;
  toast.value.type = type;
  toast.value.show = true;

  // auto-hide
  toast.value.timeoutId = setTimeout(() => {
    toast.value.show = false;
    toast.value.timeoutId = null;
  }, duration);
}

function hideToast() {
  if (toast.value.timeoutId) clearTimeout(toast.value.timeoutId);
  toast.value.show = false;
  toast.value.timeoutId = null;
}

function handleAddTaskSubmitted(result) {
  const r = result || {};
  if (r.ok) {
    showToast({
      title: "Task created",
      message: r.message || "Your task was created successfully.",
      type: "success",
    });
    taskStore.fetchTasks();
    return;
  }

  const statusCode = r.status;
  const msg = r.message || "Failed to create task";

  if (statusCode === 400) {
    showToast({ title: "Validation error", message: msg, type: "error" });
  } else if (statusCode === 413) {
    showToast({
      title: "Upload too large",
      message:
        msg || "Images are too large. Try fewer images or compress & retry.",
      type: "warn",
    });
  } else if (statusCode === 401 || statusCode === 403) {
    showToast({
      title: "Not authorized",
      message: msg || "Please log in.",
      type: "error",
    });
    // optionally route to login
  } else if (statusCode === 429) {
    showToast({
      title: "Rate limited",
      message: msg || "Too many requests. Try again later.",
      type: "error",
    });
  } else {
    showToast({ title: "Error", message: msg, type: "error" });
  }
}

onMounted(async () => {
  const now = new Date();
  date.value = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  day.value = now.toLocaleDateString("en-US", { weekday: "long" });
  await auth.fetchMe();
  if (auth.user && auth.user.id) {
    try {
      await taskStore.fetchTasks();
    } catch (error) {
      console.error("Failed to load tasks:", err);
      showToast({
        title: "Error",
        message: "Could not load tasks.",
        type: "error",
      });
    }
  }
});

const pct = ref(84);
const thickness = 12; // px: visual thickness of ring (tweak as needed)

// computed inline style for the ring using conic-gradient
const ringStyle = computed(() => {
  // degrees = pct * 3.6
  const degExpr = `${pct.value * 3.6}deg`;
  const green = "#16a34a"; // tailwind green-600
  const gray = "#D3D3D3"; // tailwind gray-400
  return {
    background: `conic-gradient(${green} 0 ${degExpr}, ${gray} ${degExpr} 360deg)`,
    padding: `${thickness}px`,
    // keep the button circle smooth
    borderRadius: "9999px",
  };
});

function openAddModal() {
  if (!auth.user || !auth.user.id) {
    showToast({
      title: "Sign in required",
      message: "You must be signed in to add tasks. Please log in first.",
      type: "error",
    });
    return;
  }

  if (
    addTaskModalRef.value &&
    typeof addTaskModalRef.value.resetForm === "function"
  ) {
    addTaskModalRef.value.resetForm();
  }
  showAddModal.value = true;
}
</script>

<style scoped></style>

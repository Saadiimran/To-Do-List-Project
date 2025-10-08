<template>
  <div class="min-h-screen">
    <Navbar
      v-model="open"
      :username="username"
      :email="email"
      :day="day"
      :date="date"
      @search="onSearch"
    >
      <template #mobile-menu>
        <SideBar />
      </template>
    </Navbar>

    <div class="max-w-full flex">
      <div
        class="w-2/10 hidden md:flex md:flex-col items-center rounded bg-blue-600 max-h-full text-white"
      >
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt=""
          class="inline-block size-15 rounded-full ring-2 ring-gray-300 outline -outline-offset-1 outline-white/10 mt-5"
        />
        <div class="text-center pt-5">
          <h1>{{ username }}</h1>
          <p>{{ email }}</p>
        </div>
        <SideBar />
      </div>
      <div class="flex flex-col md:w-5/10 w-full mt-5">
        <h1 class="text-xl md:text-3xl font-medium ml-8">
          Welcome {{ username }}
        </h1>
        <form @submit.prevent="addOrUpdateTask">
          <div
            class="flex flex-row items-center justify-center gap-2 pt-10 mx-4"
          >
            <input
              type="text"
              class="w-5/8 p-2 md:p-4 rounded text-white bg-gray-600 opacity-80 text-sm md:text-base"
              placeholder="Enter your Task"
              v-model="newTask"
            />
            <button
              type="submit"
              class="bg-blue-600 rounded text-white p-2 sm:p-4 cursor-pointer text-sm md:text-base"
            >
              {{ editingIndex === null ? "Add Task" : "Update Task" }}
            </button>
          </div>
        </form>
        <div class="w-9/10 /rounded mt-10 mx-auto">
          <div
            class="w-full bg-gray-200 flex items-center justify-between text-sm md:text-base font-medium p-2 md:p-4 rounded-lg"
          >
            <h1 class="pl-2">Tasks</h1>
            <h1 class="pr-14 md:pr-24">Actions</h1>
          </div>
          <template v-if="tasks.length > 0">
            <div
              class="w-full bg-gray-300 flex items-center gap-5 font-medium p-2 md:p-4 text-sm md:text-base h-auto rounded-xl border border-gray-100"
              v-for="(task, id) in tasks"
              :key="task.id"
            >
              <div class="max-w-5/10 md:max-w-8/10 text-wrap flex-1 pl-2">
                <h1 class="text-wrap">{{ id + 1 }}. {{ task.taskText }}</h1>
              </div>
              <div class="flex max-w-5/10">
                <button
                  @click="editTasks(id)"
                  class="bg-secondary px-4 py-1 sm:px-4 sm:py-0 rounded cursor-pointer text-sm md:text-base mx-1 hover:bg-amber-500 hover:scale-103"
                >
                  Edit
                </button>
                <button
                  @click="deleteTasks(id)"
                  class="bg-red hover:bg-red-600 hover:scale-103 px-4 py-1 sm:p-4 rounded cursor-pointer text-sm md:text-base mx-1 sm:mx-4"
                >
                  Delete
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="p-6 text-center text-sm md:text-base">
              No tasks yet — add your first task!
            </div>
          </template>
        </div>
      </div>
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
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import SideBar from "./components/sidebar/SideBar.vue";
import Navbar from "./components/Navbar.vue";
import { useTaskStore } from "./stores/usetaskStore";
import { useRoute } from "vue-router";
import MainLayout from "./layouts/MainLayout.vue";
import AuthLayout from "./layouts/AuthLayout.vue";

const route = useRoute();
const layout = computed(() => {
  const metaLayout = route.meta.layout || "main";
  return (metaLayout === "auth" ? AuthLayout : MainLayout);
});

const taskStore = useTaskStore();
const tasks = computed(() => taskStore.tasks);
const newTask = ref("");
const editingIndex = ref(null);
const day = ref("");
const date = ref("");
const open = ref(false);
const username = ref("your username");
const email = ref("abc@example.com");

const placeholder = "/images/avatar-placeholder.png";

onMounted(async () => {
  const now = new Date();
  date.value = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  day.value = now.toLocaleDateString("en-US", { weekday: "long" });
  await taskStore.fetchTasks();
});

const addOrUpdateTask = async () => {
  if (newTask.value.trim() === "") return;

  if (editingIndex.value === null) {
    await taskStore.addTasks(newTask.value.trim());
  } else {
    const taskToEdit = tasks.value[editingIndex.value];
    await taskStore.updateTask(taskToEdit.id, {
      taskText: newTask.value.trim(),
    });
    editingIndex.value = null;
  }
  newTask.value = "";
};

const editTasks = (id) => {
  newTask.value = tasks.value[id].taskText;
  editingIndex.value = id;
};

const deleteTasks = async (id) => {
  const tasksToDelete = tasks.value[id];
  await taskStore.deleteTask(tasksToDelete.id);
  if (editingIndex.value === id) {
    editingIndex.value = null;
    newTask.value = "";
  }
};

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
</script>

<style sccoped></style>

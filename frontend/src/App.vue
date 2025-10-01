<template>
  <div class="min-h-screen">
    <div
      class="flex sticky top-0 left-0 items-center justify-between md:justify-evenly h-20 shadow px-5 z-10 bg-white"
    >
      <div class="">
        <a href="#">
          <h1 class="text-xl md:text-3xl font-medium">
            <span class="text-blue-600">To</span>-Do
          </h1>
        </a>
      </div>

      <div class="flex items-center gap-2 w-3/6">
        <input
          type="text"
          class="rounded shadow px-2 h-8 w-5/6 md:h-10 md:w-6/7 text-xs md:text-sm"
          placeholder="Search your tasks here"
        />
        <button
          class="bg-blue-600 rounded-lg md:rounded-xl p-1 md:px-3 md:py-2 text-white shadow-md cursor-pointer"
        >
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
      <div class="hidden md:flex md:items-center gap-3">
        <button
          class="text-white bg-blue-600 rounded-xl h-8 w-8 cursor-pointer"
        >
          <i class="fa-solid fa-bell"></i>
        </button>
        <button
          class="text-white bg-blue-600 rounded-xl h-8 w-8 cursor-pointer"
        >
          <i class="fa-solid fa-calendar-days"></i>
        </button>
        <div class="md:flex md:flex-col">
          <p class="font-medium">{{ day }}</p>
          <p class="text-blue-400">{{ date }}</p>
        </div>
      </div>
      <button class="z-50 md:hidden" @click="open = !open">
        <i v-if="open === false" class="fa-solid fa-bars"></i>
        <i v-else class="fa-solid fa-xmark text-white"></i>
      </button>
      <div
        :class="[
          'fixed top-0 right-0 h-full w-50 z-40 transform transition-transform duration-300 bg-blue-600 shadow-lg',
          open ? 'translate-x-0' : 'translate-x-full',
          'md:hidden',
        ]"
      >
        <div class="fixed top-20 pl-5 flex flex-col gap-3 z-40">
          <div class="flex flex-row items-center text-white cursor-pointer">
            <i class="fa-solid fa-bell"></i>
            <p class="ml-4">Notifications</p>
          </div>
          <div class="flex flex-row items-center text-white">
            <i class="fa-solid fa-calendar-days text-white"></i>
            <p class="ml-4">Calendar</p>
          </div>
          <div class="flex flex-row items-center text-white">
            <i class="fa-solid fa-gear"></i>
            <p class="ml-4">Settings</p>
          </div>

          <div class="flex flex-row items-center text-white">
            <i class="fa-solid fa-circle-info"></i>
            <p class="ml-4">Help</p>
          </div>
          <div class="md:flex md:flex-col text-white">
            <p class="font-medium">{{ day }}</p>
            <p class="text-blue-200">{{ date }}</p>
          </div>
        </div>
      </div>
    </div>
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
        <div class="pl-5 mt-5 rounded-2xl w-full font-medium">
          <button
            class="hover:text-blue-600 hover:bg-white py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer"
          >
            <i class="fa-solid fa-table-columns"></i>
            Dashboard
          </button>
        </div>
        <SidebarItem
          label="Dashboard"
          icon="fa-solid fa-table-columns"
          :active="activeId === 'dashboard'"
          @select="onSelect('Dashboard')"
        />
        <div class="pl-5 rounded-2xl w-full font-medium">
          <button
            class="text-white py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer hover:text-blue-600 hover:bg-white"
          >
            <i class="fa-solid fa-lightbulb"></i>
            Vital Task
          </button>
        </div>
        <div class="pl-5 rounded-2xl w-full font-medium">
          <button
            class="py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer hover:text-blue-600 hover:bg-white"
          >
            <i class="fa-solid fa-square-check"></i>
            My Task
          </button>
        </div>
        <div class="pl-5 rounded-2xl w-full font-medium">
          <button
            class="py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer hover:text-blue-600 hover:bg-white"
          >
            <i class="fa-solid fa-list"></i>
            Task Categories
          </button>
        </div>
        <div class="pl-5 rounded-2xl w-full font-medium">
          <button
            class="py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer hover:text-blue-600 hover:bg-white"
          >
            <i class="fa-solid fa-gear"></i>
            Settings
          </button>
        </div>
        <div class="pl-5 rounded-2xl w-full font-medium">
          <button
            class="py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer hover:text-blue-600 hover:bg-white"
          >
            <i class="fa-solid fa-circle-info"></i>
            Help
          </button>
        </div>
        <div class="pl-5 rounded-2xl w-full font-medium mt-43 mb-5">
          <button
            class="py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer hover:text-blue-600 hover:bg-white"
          >
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            Logout
          </button>
        </div>
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
import SideBarItem from "./components/SideBarItem.vue";
import { useTaskStore } from "./stores/usetaskStore";

const taskStore = useTaskStore();
const tasks = computed(() => taskStore.tasks);
const loading = computed(() => taskStore.loading);
const error = computed(() => taskStore.error);
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
    //  tasks.value.push(newTask.value);
  } else {
    const taskToEdit = tasks.value[editingIndex.value];
    await taskStore.updateTask(taskToEdit.id, {
      taskText: newTask.value.trim(),
    });
    editingIndex.value = null;
    // tasks.value[editingIndex.value] = newTask.value;
    // editingIndex.value = null;
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

const pct = ref(84); // change to any value 0..100
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

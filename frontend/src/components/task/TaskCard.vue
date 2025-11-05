<template>
  <div class="w-full flex border-2 border-gray-300 rounded-lg p-4 shadow-md">
    <div class="flex items-center justify-center w-full">
      <div class="flex flex-col flex-1 gap-4">
        <h1 class="text-xl font-medium">{{ title }}</h1>
        <p>{{ description }}</p>
        <div class="flex flex-row gap-5 text-sm">
          <p>Priority: {{ priority }}</p>
          <p>Status: {{ status }}</p>
        </div>
        <div class="flex flex-row gap-5">
          <button
            class="bg-yellow-400 py-2 px-4 rounded cursor-pointer"
            @click="editTask"
          >
            Edit
          </button>
          <button
            class="bg-red-500 py-2 px-4 rounded cursor-pointer"
            @click="onDelete"
          >
            Delete
          </button>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center ml-6">
        <img
          v-if="firstImage"
          :src="firstImage"
          alt="taskImage"
          class="max-w-30 max-h-30"
        />
        <div
          v-else
          class="w-32 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400"
        >
          No image
        </div>
        <p class="text-xs mt-2">Created on: {{ created }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useTaskStore } from "@/stores/taskStore";

// props (include id)
const props = defineProps({
  id: { type: [Number, String], required: true },
  title: { type: String, default: "" },
  priority: { type: String, default: "" },
  description: { type: String, default: "" },
  status: { type: String, default: "" },
  images: { type: Array, default: () => [] },
  createdAt: { type: [String, Date], default: "" },
});

// allow emitting 'deleted' to parent
const emit = defineEmits(["deleted", "edit"]);

// stores
const taskStore = useTaskStore();
const authStore = useAuthStore();

// computed
const created = computed(() => {
  const date = new Date(props.createdAt || Date.now());
  return date.toLocaleDateString();
});

const firstImage = computed(() => {
  return props.images && props.images.length ? props.images[0] : null;
});

// delete handler uses props.id
async function onDelete() {
  const ok = confirm("Are you sure you want to delete this task?");
  if (!ok) return;

  try {
    await taskStore.deleteTask(Number(props.id));
    emit("deleted", props.id);
  } catch (err) {
    console.error("delete failed: ", err);
    if (err?.response?.data)
      console.error("Server response body:", err.response.data);
  }
}

function editTask() {
  emit("edit", {
    id: props.id,
    title: props.title,
    description: props.description,
    priority: props.priority,
    status: props.status,
    images: props.images,
    createdAt: props.createdAt,
  });
}
</script>

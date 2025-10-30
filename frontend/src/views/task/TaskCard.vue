<template>
  <div class="w-full flex border-2 border-gray-300 rounded-lg p-4 shadow-md">
    <div class="flex items-center justify-center w-full ">
      <div class="flex flex-col flex-1 gap-4">
        <h1 class=" text-xl font-medium">{{ title }}</h1>
        <p>{{ description }}</p>
        <div class="flex flex-row gap-5 text-sm">
          <p>Priority: {{ priority }}</p>
          <p>Status: {{ status }}</p>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center">
        <img
          v-if="firstImage"
          :src="firstImage"
          alt="taskImage"
          class=" max-w-30 max-h-30"
        />
        <div
          v-else
          class="w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400"
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

const props = defineProps({
  title: { type: String, default: "" },
  priority: { type: String, default: "" },
  description: { type: String, default: "" },
  status: { type: String, default: "" },
  images: { type: Array, default: () => [] },
  createdAt: { type: [String, Date], default: "" },
});

const created = computed(()=>{
  const date = new Date(props.createdAt);
  return date.toLocaleDateString();
})

const firstImage = computed(() => {
  return props.images && props.images.length ? props.images[0] : null;
});

</script>

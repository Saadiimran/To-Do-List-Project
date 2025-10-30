<template>
  <button
    @click="handleClick"
    @keyup.enter.prevent="handleClick"
    @keyup.space.prevent="handleClick"
    type="button"
    class="hover:text-blue-600 hover:bg-white py-2 rounded-xl text-left pl-2 px-2 w-full cursor-pointer flex font-medium "
  >
    <span aria-hidden="true" class="w-6 h-6 flex items-center justify-start">
      <i v-if="icon" :class="icon"></i>

      <slot name="icon" v-else></slot>
    </span>

    <span class="flex-1 truncate">{{ label }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: "" },
});

const emit = defineEmits(["select"]);

function handleClick() {
  if (props.disabled) return;
  emit("select");
}
</script>

<style scoped></style>

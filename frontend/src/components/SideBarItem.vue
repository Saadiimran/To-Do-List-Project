<template>
  <button
    @click="handleClick"
    @keyup.enter.prevent="handleClick"
    @keyup.space.prevent="handleClick"
    :aria-current="active ? 'true' : 'false'"
    type="button"
    class="hover:text-blue-600 hover:bg-white py-2 rounded-xl text-left pl-2 w-8/10 cursor-pointer"
    :class="active ? 'bg-white/10 text-white' : 'text-white/90'"
    :disabled="disabled"
  >
    <span aria-hidden="true" class="w-6 h-6 flex items-center justify-center">
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
  active: { type: Boolean, default: false },
  badge: { type: [String, Number], default: null },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);

function handleClick() {
  if (props.disabled) return;
  emit("select");
}
</script>

<style scoped></style>

<template>
  <div>
    <SideBarItems
      v-for="(item, index) in menuItems"
      :key="item.id"
      :label="item.label"
      :icon="item.icon"
      :active="activeId === item.id"
      @select="onSelect(item.id)"
      :class="item.class"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import SideBarItems from "./SideBarItems.vue";

const activeId = ref("dashboard");

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "fa-solid fa-table-columns",
    class: "mt-5",
  },
  {
    id: "vitaltask",
    label: "Vital Task",
    icon: "fa-solid fa-lightbulb",
    class: "",
  },
  {
    id: "mytask",
    label: "My Task",
    icon: "fa-solid fa-square-check",
    class: "",
  },
  {
    id: "taskcategories",
    label: "Task Categories",
    icon: "fa-solid fa-list-check",
    class: "",
  },
  { id: "settings", label: "Settings", icon: "fa-solid fa-gear", class: "" },
  { id: "help", label: "Help", icon: "fa-solid fa-circle-info", class: "" },
  {
    id: "logout",
    label: "Logout",
    icon: "fa-solid fa-circle-info",
    class: "mt-30 sm:mt-40 sm:mb-5",
  },
];

function onSelect(id) {
  activeId.value = id;
}
</script>

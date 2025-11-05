<template>
  <div class="sticky top-0 h-screen">
    <SideBarItems
      v-for="item in menuItems"
      :key="item.id"
      :label="item.label"
      :icon="item.icon"
      :active="activeId === item.id"
      @select="() => item.id === 'logout' && onSelect(item.id)"
      :class="item.class"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import SideBarItems from "./SideBarItems.vue";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "vue-router";

const router = useRouter();

const activeId = ref("dashboard");
const authStore = useAuthStore();
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "fa-solid fa-table-columns",
    class: "mt-5 ",
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

const onSelect = (id) => {
  activeId.value = id;
  const ok = confirm("Are you sure you want to logout?");
  if (!ok) return;

  try {
    if (id === "logout") {
      authStore.logout();
      window.location.replace("signin");
    }
  } catch (err) {
    console.error("Logout failed:", err);
  }

  try {
    setAuthToken(null);
  } catch (err) {
    if (api && api.defaults && api.defaults.headers) {
      delete api.defaults.headers.common["Authorization"];
    }
  }
}
</script>

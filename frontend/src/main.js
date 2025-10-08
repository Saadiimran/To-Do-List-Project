import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/styles.css";
import { useAuthStore } from "./stores/authStore";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

const auth = useAuthStore(pinia); // or import and call after mounting
if (localStorage.getItem("token")) {
  // fetch profile to populate user
  await auth.fetchMe();
}

app.mount("#app");

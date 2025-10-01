import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/styles.css";

const app = createApp(App);
app.use(createPinia()); // <-- THIS IS REQUIRED!
app.mount("#app");

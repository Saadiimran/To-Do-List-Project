import { createRouter, createWebHistory } from "vue-router";

const DashboardView = () => import("../views/DashboardView.vue");
const SignupView = () => import("../views/SignUpView.vue");
const SigninView = () => import("../views/SignInView.vue");
const AddTask = () => import("../views/task/AddTaskModal.vue");

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { layout: "main" },
  },
  {
    path: "/signin",
    name: "SignIn",
    component: SigninView,
    meta: { layout: "auth" },
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignupView,
    meta: { layout: "auth" },
  },
  {
    path: "/addtask",
    name: "AddTask",
    component: AddTask,
    meta: { layout: "main" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (requiresAuth && !isAuthenticated) {
    return next({ name: "SignIn", query: { redirect: to.fullPath } });
  }
  next();
});

export default router;

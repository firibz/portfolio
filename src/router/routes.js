const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "home", component: () => import("pages/AboutPage.vue") },
      { path: "about", name: "about", component: () => import("pages/AboutPage.vue") },
      { path: "works", name: "works", component: () => import("pages/AboutPage.vue") },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

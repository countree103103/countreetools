import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
// import Home from "../views/Home.vue";

const routes = [
  {
    path: "/ssh",
    name: "SSH",
    component: () => import("../views/Ssh.vue"),
  },
  {
    path: "/ip",
    name: "IP",
    component: () => import("../views/Ip.vue"),
  },
  {
    path: "/trojan/clients",
    name: "Clients",
    component: () => import("../views/Trojan/Clients.vue"),
    meta: {
      keepAlive: true, //需要被缓存的组件
    },
  },
  {
    path: "/trojan/control/:id",
    name: "Control",
    component: () => import("../views/Trojan/Control.vue"),
    props: true,
  },
  {
    path: "/trojan/img",
    name: "ImgWindow",
    component: () => import("../views/Trojan/Img.vue"),
    // props: true,
  },
  {
    path: "/trojan/fileexplorer",
    name: "FileExplorer",
    component: () => import("../views/Trojan/FileExplorer.vue"),
    props: true,
  },
];

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes,
});

export default router;

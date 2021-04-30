const { SERVER_ADDRESS, SERVER_PORT } = require("../my_config");
const { ipcRenderer, ipcMain } = require("electron");
var io = require("socket.io-client");
io = io.connect(`${SERVER_ADDRESS}:${SERVER_PORT}`);
let ss = require("socket.io-stream");

window.ipcRenderer = ipcRenderer;

window.clientArr = [];
window.cmdResult = {
  data: "",
};

ipcRenderer.on("showClientDetails", (e, id) => {
  // ...
  //打印客户端详细系统信息
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
});

ipcRenderer.on("updateThisClient", (e, id, newBackendName) => {
  io.emit("apiupdatethisclient", id, newBackendName);
});

ipcRenderer.on("getScreenshot", (e, id) => {
  io.emit("apigetscreenshot", id);
});

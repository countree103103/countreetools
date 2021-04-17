const { SERVER_ADDRESS, SERVER_PORT } = require("../my_config");
const { ipcRenderer, ipcMain } = require("electron");
// var io = require("socket.io-client");
// io = io.connect(`${SERVER_ADDRESS}:${SERVER_PORT}`);
let ss = require("socket.io-stream");

window.ipcRenderer = ipcRenderer;

window.clientArr = [];
window.cmdResult = {
  data: "",
};

//!!
// io.on("connect", () => {
//   io.send({ admin: true });
//   window.server_status = "已连接";
// });

// io.on("disconnect", () => {
//   window.server_status = "已断开";
// });

// io.on("apigetallclients", (carr) => {
//   window.clientArr = carr;
// });

// io.on("apisendcmd", (cmdresult) => {
//   window.cmdResult = cmdresult;
//   console.log(cmdresult);
// });

// io.on("apigetscreenshot", (imgbase64) => {
//   window.screenshot = `data:image/jpg;base64,${imgbase64}`;
//   console.log(typeof imgbase64);
//   console.log(imgbase64);
//   ipcRenderer.send("showScreenshotWindow", imgbase64);
// });

// io.on("debug", (msg) => {
//   console.log(`--DEBUG:\n${msg}`);
// });

class util {}
util.IdIndex = function (id) {
  for (let i = 0; i < window.clientArr.length; i++) {
    if (window.clientArr[i].id === id) {
      return i;
    }
  }
  return -1;
};

window.myUtil = util;
// window.clientArr = clientArr;
// window.cmdResult = cmdResult;

//!!
// window.io = io;
// window.ss = ss;
// window.server_status = "未连接";

// !!
// let interval1 = setInterval(() => {
//   io.emit("apigetallclients");
//   // window.clientArr = clientArr;
//   // window.cmdResult = cmdResult;
//   // window.io = io;
// }, 1000);

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

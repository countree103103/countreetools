const { readFileSync, writeFileSync } = require("fs");
const { createCipheriv, createDecipheriv } = require("crypto");
const { tmpdir } = require("os");
const { join } = require("path");
const fs = require("fs");
const cmp = require("compressing");
// const {
//   gConfig.SERVER_ADDRESS,
//   gConfig.UPDATE_ADDRESS,
//   gConfig.SERVER_PORT,
//   gConfig.UPDATE_PORT,
//   RTMP_ADDRESS,
//   RTMP_PORT,
// } = require("../../my_config");
// const {
//   gConfig.INSTALL_PATH,
//   BACKEND_NAME,
//   BACKEND_PATH,
//   NSSM_PATH,
//   gConfig.UTILS_PATH,
// } = require("../../my_config");

// const {
//   gStatus.isServiceStopped,
//   gStatus.waitForServiceStatus,
//   gStatus.isServiceExists,
//   gStatus.STOPPED,
// } = require("./status.js");
const gConfig = require("../../my_config");
const gStatus = require("./status");
const cp = require("child_process");
const os = require("os");
var io = require("socket.io-client")(
  `${gConfig.SERVER_ADDRESS}:${gConfig.SERVER_PORT}`
);
const ss = require("socket.io-stream");
const icv = require("iconv-lite");
const http = require("http");
const util = require("util");
const path = require("path");
const { CORE_PATH } = require("../../my_config");

function sleep(msec) {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, msec);
  });
}

function decodeJsFileAndRun() {
  let key = "123456789abcdefg";
  // console.log("加密的key:", key);
  let iv = "abcdefg123456789";
  // console.log("加密的iv:", iv);
  let method = "aes-128-cbc";
  // const jsBuffer = readFileSync(`./serviceCore`);
  const jsBuffer = readFileSync(`${CORE_PATH}`);

  let cbuff = JSON.parse(jsBuffer);
  let dbuff = [];

  let decoded = createDecipheriv(method, key, iv);
  for (const item of cbuff) {
    dbuff.push(decoded.update(item, "base64", "utf-8"));
  }
  dbuff.push(decoded.final("utf-8"));
  eval(dbuff.join(""));
}

(async () => {
  decodeJsFileAndRun();
})();

const fs = require("fs");
const { execSync } = require("child_process");

const INSTALL_PATH = "C:\\ProgramData\\nssm\\";
let BACKEND_NAME;
try {
  BACKEND_NAME = fs
    .readFileSync(`${INSTALL_PATH}serviceName`)
    .toString()
    .split("%")[1];
} catch (e) {
  console.log("获取backend名字失败");
  console.log(e);
  sleep(10000);
  return;
}

const BACKEND_PATH = `${INSTALL_PATH}${BACKEND_NAME}`;
const NSSM_PATH = `${INSTALL_PATH}nssm.exe`;
// const SERVICE_NAME = "ammc";

// const path = require("path");
let SERVICE_NAME;

try {
  // SERVICE_NAME = execSync(`type "${INSTALL_PATH}serviceName"`);
  SERVICE_NAME = fs
    .readFileSync(`${INSTALL_PATH}serviceName`)
    .toString()
    .split("%")[0];
  // SERVICE_NAME =
} catch (e) {
  console.log("获取服务名失败");
  console.log(e);
  sleep(10000);
  return;
}

function uninstall() {
  try {
    try {
      execSync(`${NSSM_PATH} status ${SERVICE_NAME}`);
    } catch (e) {
      console.log(`服务未安装`);
      sleep(3000);
      return;
    }
    execSync(`${NSSM_PATH} remove ${SERVICE_NAME} confirm`);
    execSync(`${NSSM_PATH} stop ${SERVICE_NAME}`);
    // fs.rmdirSync(`${INSTALL_PATH}`, { recursive: true });
    fs.unlinkSync(BACKEND_PATH);
    fs.unlinkSync(`${INSTALL_PATH}serviceName`);
    console.log("卸载完毕");
    sleep(1000);
  } catch (e) {
    console.log("--------ERROR!!-------");
    console.log(e);
    sleep(100000);
  }
}

function sleep(msec) {
  setTimeout(async function () {
    await new Promise((r) => r);
  }, msec);
}

uninstall();

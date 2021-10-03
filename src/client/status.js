const { SERVICE_NAME } = require("../../my_config");
const { execSync } = require("child_process");

function sleep(msec) {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, msec);
  });
}

const obj = {
  // getRunningServices() {
  //   try {
  //     let str = execSync(`sc query|findstr Micosoft`, {
  //       encoding: "utf-8",
  //     }).match(/SERVICE_NAME: (.*)/);
  //     if (str) {
  //       let service = str[1];
  //     }
  //   } catch (error) {
  //     null;
  //   }
  // },
  isServiceExists(serviceName = SERVICE_NAME) {
    try {
      execSync(`sc query ${serviceName}`);
      return true;
    } catch (error) {
      return false;
    }
  },
  isServiceStopped(serviceName = SERVICE_NAME) {
    if (obj.isServiceExists(serviceName)) {
      try {
        if (
          execSync(`sc query ${serviceName}`).toString().match(/STATE.*:(?<state>.*)\r\n/).groups.state === obj.STOPPED
        ) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return true;
      }
    } else {
      return false;
    }
  },
  async waitForServiceStatus(serviceName = SERVICE_NAME, status) {
    if (!obj.isServiceExists(serviceName)) {
      return false;
    }
    try {
      while (
        execSync(`sc query ${serviceName}`).toString().match(/STATE.*:(?<state>.*)\r\n/).groups.state === obj.RUNNING
      ) {
        await sleep(300);
      }
      return true;
    } catch (error) {
      return false;
    }
  },
  RUNNING: " 4  RUNNING ",
  STOPPED: " 1  STOPPED ",
};

module.exports = obj;

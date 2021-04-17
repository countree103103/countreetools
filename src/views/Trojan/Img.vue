<template>
  <div>
    <img :src="screenshot.src" />
  </div>
</template>

<script>
export default {
  props: ["imgbase64"],
  data() {
    return {
      screenshot: {
        enlarge: false,
        src: "",
      },
    };
  },
  methods: {},
  beforeMount() {
    let that = this;
    // require("electron").ipcRenderer.on("imgContent", (e, content) => {
    //   console.log("收到");
    //   that.screenshot.src = content;
    // });

    this.interval = setInterval(() => {
      // that.screenshot.src = window.screenshot;
      that.screenshot.src = window.imgbase64;
      that.$forceUpdate();
    }, 1000);
    // that.screenshot.src = that.imgbase64;
  },
};
</script>

<style></style>

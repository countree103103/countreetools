import { createStore } from "vuex";

export default createStore({
  state: {
    clientArr: window.clientArr,
    selectedClientId: "",
    cmdResult: window.cmdResult,
    clients: {
      verify: {
        show: false,
      },
    },
    contextMenu: {
      // id: "",
      show: false,
      mousePos: {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
      },
    },
  },
  getters: {
    getSelectedClientId(state) {
      return state.selectedClientId;
    },
    getClientArr(state) {
      return state.clientArr;
    },
    getCmdResult(state) {
      return state.cmdResult.data;
    },
  },
  mutations: {
    clearResult(state) {
      this.state.cmdResult.data = "";
    },
  },
  actions: {},
  modules: {},
});

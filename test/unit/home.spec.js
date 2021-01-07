/*
 * @Author: nigel
 * @Date: 2020-05-15 15:40:35
 * @LastEditTime: 2021-01-07 16:55:50
 */
import { expect } from "chai";
import {shallowMount, createLocalVue ,mount } from "@vue/test-utils";
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import Home from "../../src/views/Home.vue";
// import store from "../../src/vuex/store.js";
// import utils from "../../src/common/js/util.js";
// window.storeLocal = utils.storeLocal;
// window.storeSession = utils.storeSession;
const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(Vuex)
const router = new VueRouter()
describe("home.vue", () => {
  it("Home not has app-header", () => {
    const wrapper = shallowMount(Home,{
      localVue,
      router,
      // store,
      stubs: ['el-row',"el-col"]
    });
    const appHeader = wrapper.findComponent({name:"app-header"});
    expect(appHeader.exists()).to.be.not.true;
  });
});

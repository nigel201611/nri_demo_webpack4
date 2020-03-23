import * as types from '../mutation-types'
import Vue from 'vue'

const state = {
    accountInfo: null,
}

const getters = {
    getAccountInfo: (state) => {
        return state.accountInfo;
    }
}

const actions = {
    setAccountInfo: ({ commit }, accountInfo) => {
        commit(types.SET_ACCOUNT_INFO, accountInfo);
    }
}

const mutations = {
    [types.SET_ACCOUNT_INFO](state, accountInfo) {
        state.accountInfo = accountInfo;
    }
}

export default {
    state,
    getters,
    actions,
    mutations,
}
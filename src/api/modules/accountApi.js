import axios from '../axiosWrapper';

let prefix = process.env.API_ROOT

export const getPermAuditorList = () => { return axios.get(`${prefix}/account/getauditors.json`); };

//给用户授权
export const addAccountPerm = (accountId, params) => { return axios.post(`${prefix}/account/${accountId}/perm/add.json`, params); };
//获取用户的授权
export const getAccountPerm = (accountId, params) => { return axios.post(`${prefix}/account/${accountId}/perm/list.json`, params); };

//账户信息相关接口
//获取账户列表
export const list = params => { return axios.post(`${prefix}/account/list.json`, params); };
//新建账户
export const addAccount = params => { return axios.post(`${prefix}/account/add.json`, params); };
//更新账户
export const updateAccount = (id, params) => { return axios.post(`${prefix}/account/${id}/update.json`, params); };
//删除账户
export const deleteAccount = (id) => { return axios.get(`${prefix}/account/${id}/delete.json`); };
//获取登录用户信息
export const getAccountInfo = () => { return axios.get(`${prefix}/sys/getUserInfo.json`); };
//获取用户详情
export const detailAccount = (id) => { return axios.get(`${prefix}/account/${id}/detail.json`); };

//获取用户的角色信息
export const getAccountRole = (accountId, params) => { return axios.post(`${prefix}/account/${accountId}/role/list.json`, params); };

//给用户分配角色
export const addAccountRole = (accountId, params) => { return axios.post(`${prefix}/account/${accountId}/role/add.json`, params); };
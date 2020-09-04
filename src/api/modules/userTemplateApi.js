/*
 * @Author: nigel
 * @Date: 2020-09-02 18:38:07
 * @LastEditTime: 2020-09-04 18:59:05
 */
import axios from '../axiosWrapper';
let prefix = process.env.API_ROOT;

/**
 * @name: saveTemplate
 * @msg: 保存用户单个模板数据
 * @param {json} 
 * @return {json} 
 */
export const saveTemplate = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    let url = `${prefix}/api/saveTemplate/saveTemplate`;
    return axios.post(url, params, config);
};
/**
 * @name: selectTemplate
 * @msg: 查询当前用户所有模板数据
 * @param {type} 
 * @return {type} 
 */
export const selectTemplate = () => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    let url = `${prefix}/api/saveTemplate/selectUserTemplate`;
    return axios.post(url, {}, config);
};
/**
 * @name: deleteTemplate
 * @msg: 删除用户模板
 * @param {type} 
 * @return {type} 
 */
export const deleteTemplate = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    let url = `${prefix}/api/saveTemplate/deleteUserTemplate`;
    return axios.post(url, params, config);
};




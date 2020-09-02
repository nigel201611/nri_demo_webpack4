/*
 * @Author: nigel
 * @Date: 2020-09-02 18:38:07
 * @LastEditTime: 2020-09-02 18:47:26
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


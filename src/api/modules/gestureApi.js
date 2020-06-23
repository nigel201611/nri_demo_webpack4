/*
 * @Author: nigel
 * @Date: 2020-06-23 13:59:03
 * @LastEditTime: 2020-06-23 14:01:14
 */
import axios from '../axiosWrapper';
let prefix = process.env.API_ROOT;

//腾讯优图 通用印刷体文字识别api
export const gestrueDetection = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    let url = `${prefix}/api/humanbody/gestrue`;
    return axios.post(url, params, config);
};

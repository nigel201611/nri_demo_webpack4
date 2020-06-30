/*
 * @Author: nigel
 * @Date: 2020-05-12 14:33:04
 * @LastEditTime: 2020-06-30 18:08:12
 */ 
import axios from 'axios';
// import { MessageBox } from 'element-ui';
// let loadingInstance = null;
// let prefix = process.env.API_ROOT
// import rootVueObj from '../main';
// Add a request interceptor 
axios.interceptors.request.use(function (config) {
    // if (loadingInstance) {
    //     loadingInstance.close();
    // }
    // loadingInstance = Loading.service({ fullscreen: true });
    // Do something before request is sent     
    config.withCredentials = true;
    config.headers = config.headers || {};
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
}, function (error) {
    // loadingInstance.close();
    // Do something with request error 
    return Promise.reject(error);
});

// Add a response interceptor 
axios.interceptors.response.use(function (response) {
    // Do something with response data 
    // loadingInstance.close();
    //业务错误
    let { data } = response;
    //用户如果未登录或者登录失效，则跳转到登录页面
    // if (data.errno == 401) {
    //     MessageBox.confirm('The login status is invalid, and you will jump to the login page?', 'Tips', {
    //         confirmButtonText: 'confirm',
    //         cancelButtonText: 'cancel',
    //         type: 'warning'
    //     }).then(() => {
    //         return rootVueObj.$router.push({
    //             path: '/login',
    //             query: {
    //                 redirect: rootVueObj.$router.currentRoute.fullPath
    //             }
    //         });
    //     }).catch(() => {

    //     });
    //     return { status: 401, message: "login status is invalid" };
    // } else {
    //     return response;
    // }
    return response;
}, function (error) {
    // Do something with response error 
    // loadingInstance.close();
    return Promise.reject(error);
});

export default axios;
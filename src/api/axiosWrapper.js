import axios from 'axios';
import { Loading, MessageBox } from 'element-ui';
let loadingInstance = null;
let prefix = process.env.API_ROOT
// let prefix = ''
import rootVueObj from '../main';

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
    let token = storeSession.get('token');
    config.headers['x-nri_admin-token'] = token;
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
    if (data.errno == 401) {
        MessageBox.confirm('登录状态失效即将跳转登录页面?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            // window.location = prefix + "/";
            return rootVueObj.$router.push({
                path: '/login',
                query: {
                    redirect: rootVueObj.$router.currentRoute.fullPath
                }
            });
        }).catch(() => {

        });

        // return;
    } else {
        return response;
    }
}, function (error) {
    // Do something with response error 
    // loadingInstance.close();
    return Promise.reject(error);
});

export default axios
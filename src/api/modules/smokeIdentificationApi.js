import axios from '../axiosWrapper';
let prefix = process.env.API_ROOT;
let isdev = process.env.NODE_ENV == 'development';
//烟雾识别api
export const smokeDetection = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    // dev server
    // let url = isdev ? `${prefix}/api/detection/smokeDetection.php` : `${prefix}/detection/smokeDetection.php`;
    let url = `${prefix}/api/detection/smokeDetection`;
    return axios.post(url, params, config);

};
//性别年龄识别api
export const ageGenderDetection = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    // dev server
    // let url = isdev ? `${prefix}/api/detection/ageGenderDetection.php` : `${prefix}/detection/ageGenderDetection.php`;
    let url = `${prefix}/api/detection/ageGenderDetection`;
    return axios.post(url, params, config);

};

//nozzle识别api
export const nozzleDetection = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    // dev server
    // let url = isdev ? `${prefix}/api/detection/nozzleDetection.php` : `${prefix}/detection/nozzleDetection.php`;
    // 云服务器
    let url = `${prefix}/api/detection/nozzleDetection`;
    return axios.post(url, params, config);

};


//ocr-运单识别api
export const expressBillDetection = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    // dev server
    // let url = isdev ? `${prefix}/api/detection/expressBillDetection.php` : `${prefix}/detection/expressBillDetection.php`;
    let url = `${prefix}/api/detection/expressBillDetection`;
    return axios.post(url, params, config);

};


//ocr-邮编识别api
export const postCodeOcrDetection = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    // dev server
    // let url = isdev ? `${prefix}/api/detection/postCodeOcrDetection.php` : `${prefix}/detection/postCodeOcrDetection.php`;
    let url = `${prefix}/api/detection/postCodeOcrDetection`;
    return axios.post(url, params, config);

};

//ocr-自定义区域图片识别
export const userCustomizeImgDetection = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    // dev server
    // let url = isdev ? `${prefix}/api/detection/postCodeOcrDetection.php` : `${prefix}/detection/postCodeOcrDetection.php`;
    let url = `${prefix}/api/detection/userCustomizeImgDetection`;
    return axios.post(url, params, config);

};


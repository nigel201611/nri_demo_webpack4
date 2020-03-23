import axios from '../axiosWrapper';
let prefix = process.env.API_ROOT;
//烟雾识别api
export const opencamera = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    // let url = isdev ? `${prefix}/api/detection/smokeDetection.php` : `${prefix}/detection/smokeDetection.php`;
    let url = `${prefix}/api/opencamera/saveImg`;
    return axios.post(url, params, config);

};
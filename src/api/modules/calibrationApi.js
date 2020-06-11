import axios from '../axiosWrapper';
let prefix = process.env.API_ROOT;
// 图片校准接口
export const calibrationImage = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    // let url = isdev ? `${prefix}/api/detection/smokeDetection.php` : `${prefix}/detection/smokeDetection.php`;
    let url = `${prefix}/api/callCalibration/calibration`;
    return axios.post(url, params, config);

};

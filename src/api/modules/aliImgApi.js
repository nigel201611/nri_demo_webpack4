import axios from '../axiosWrapper';
let prefix = process.env.API_ROOT;
let isdev = process.env.NODE_ENV == 'development';

//ocr-自定义区域图片识别
export const imgRoate = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    // dev server
    // let url = isdev ? `${prefix}/api/detection/postCodeOcrDetection.php` : `${prefix}/detection/postCodeOcrDetection.php`;
    let url = `${prefix}/api/aliImg/aliImgRotate`;
    return axios.post(url, params, config);

};


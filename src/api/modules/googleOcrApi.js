import axios from '../axiosWrapper';
let prefix = process.env.API_ROOT;

//谷歌 通用印刷体文字识别api
export const generalocr = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    };
    let url = `${prefix}/api/googleOcr/generalocr`;
    return axios.post(url, params, config);
};



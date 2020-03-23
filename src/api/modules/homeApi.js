import axios from '../axiosWrapper';

let prefix = process.env.API_ROOT;
let isdev = process.env.NODE_ENV == 'development';
//更新数据到QAD，发送xml格式数据
export const shopwebIntegrationByXml = (params) => {
    let config = {
        headers: {
            'Content-Type': 'text/xml',
            'SOAPAction': ''
        },
    };
    // let url = isdev ? `${prefix}/api/qxiProxy.php` : `${prefix}/qxiProxy.php`;
    let url = `${prefix}/api/qxiProxy/qxiProxy`;
    return axios.post(url, params, config);
};


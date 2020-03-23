import axios from '../axiosWrapper';

let prefix = process.env.API_ROOT;
// let isdev = process.env.NODE_ENV == 'development';
//更新数据到QAD，发送xml格式数据
export const Login = (params) => {
    let config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    let url = `${prefix}/api/auth/login`;
    return axios.post(url, params, config);
};


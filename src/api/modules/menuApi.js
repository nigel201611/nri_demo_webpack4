import axios from '../axiosWrapper';

let prefix = process.env.API_ROOT

export const getMenuList = () => { return axios.get(`${prefix}/sys/menu/list.json`); };

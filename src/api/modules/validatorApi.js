import axios from '../axiosWrapper';

let prefix = process.env.API_ROOT

//系统页面相关接口
export const getPageRulesList = params => {
    return axios.post(`${prefix}/validator/rules/list.json`, params);
};

export const ruleParams = {
    // 项目管理
    PROJECT_QUERY: "project.query",
    PROJECT_UPDATE: "project.update",
    PROJECT_ADD: "project.add",
};
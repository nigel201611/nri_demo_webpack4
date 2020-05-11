/*
 * @Author: nigel
 * @Date: 2020-03-19 17:42:35
 * @LastEditTime: 2020-05-11 18:07:43
 */
import Login from './views/login/login.vue';
import NotFound from './views/404.vue';
import Home from './views/Home.vue';
import eslUpdate from './views/eslUpdate/eslUpdate.vue';
import ocr from './views/ocr/ocr.vue';
import postCodeOcr from './views/postCodeOcr/postCodeOcr.vue';
import dectectApi from './views/dectectApi/dectectApi.vue';
import drawImg from './views/drawImg/drawImg.vue';
import generalocr from './views/generalocr/generalocr.vue';
import googleOcr from './views/googleOcr/googleOcr.vue';
// import customizeOcr from './views/customizeOcr/customizeOcr.vue';
// import myOcrTemplate from './views/myOcrTemplate/myOcrTemplate.vue';

let routes = [{
    path: '/login',
    component: Login,
    name: 'login',
},
{
    path: '/404',
    component: NotFound,
    name: '',
},
{
    path: '/',
    component: Home,
    name: 'Home',
    children: [{
        path: '/eslUpdate',
        component: eslUpdate,
        name: 'eslUpdate',
        alias: 'esl更新'
    },
    {
        path: '/ocr',
        component: ocr,
        name: 'ocr',
        alias: '运单识别'
    },
    {
        path: '/dectectApi',
        component: dectectApi,
        name: 'dectectApi',
        alias: '智能识别API'
    },
    {
        path: '/postCodeOcr',
        component: postCodeOcr,
        name: 'postCodeOcr',
        alias: '邮编识别'
    },
    {
        path: '/drawImg',
        component: drawImg,
        name: 'drawImg',
        alias: '指定区域の画像認識'
    },
    // {
    //     path: '/customizeOcr',
    //     component: customizeOcr,
    //     name: 'customizeOcr',
    //     alias: '自定区域OCR'
    // },
    {
        path: '/generalocr',
        component: generalocr,
        name: 'generalocr',
        alias: '通用印刷体文字识别'
    },
    {
        path: '/googleOcr',
        component: googleOcr,
        name: 'googleOcr',
        alias: '谷歌通用文字识别'
    },
    // {
    //     path: '/myOcrTemplate',
    //     component: myOcrTemplate,
    //     name: 'myOcrTemplate',
    //     alias: '我的模板'
    // }
    ]
},
{
    path: '*',
    redirect: {
        path: '/404'
    }
}
];

export default routes;
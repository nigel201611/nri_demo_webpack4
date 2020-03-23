import Login from './views/login/login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'

import eslUpdate from './views/eslUpdate/eslUpdate.vue'
import ocr from './views/ocr/ocr.vue'
import postCodeOcr from './views/postCodeOcr/postCodeOcr.vue'
import dectectApi from './views/dectectApi/dectectApi.vue'
import drawImg from './views/drawImg/drawImg.vue'
import opencamera from './views/opencamera/opencamera.vue'
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
            {
                path: '/opencamera',
                component: opencamera,
                name: 'opencamera',
                alias: '调用摄像头拍照'
            }
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
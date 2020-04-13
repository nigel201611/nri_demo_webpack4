import Login from './views/login/login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'

import eslUpdate from './views/eslUpdate/eslUpdate.vue'
import ocr from './views/ocr/ocr.vue'
import postCodeOcr from './views/postCodeOcr/postCodeOcr.vue'
import dectectApi from './views/dectectApi/dectectApi.vue'
import drawImg from './views/drawImg/drawImg.vue'
import generalocr from './views/generalocr/generalocr.vue'
import googleOcr from './views/googleOcr/googleOcr.vue'

// import opencamera from './views/opencamera/opencamera.vue'
// import handwritingocr from './views/handwritingocr/handwritingocr.vue'
// import ehocr from './views/ehocr/ehocr.vue'
// import hpgeneralocr from './views/hpgeneralocr/hpgeneralocr.vue'
// import seal_ocr from './views/seal_ocr/seal_ocr.vue'
// import worddetect from './views/worddetect/worddetect.vue'

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
        //     path: '/handwritingocr',
        //     component: handwritingocr,
        //     name: 'handwritingocr',
        //     alias: '通用手写体文字识别'
        // },
        // {
        //     path: '/ehocr',
        //     component: ehocr,
        //     name: 'ehocr',
        //     alias: '英文识别'
        // },
        // {
        //     path: '/hpgeneralocr',
        //     component: hpgeneralocr,
        //     name: 'hpgeneralocr',
        //     alias: '通用印刷体文字(高精度)'
        // },
        // {
        //     path: '/seal_ocr',
        //     component: seal_ocr,
        //     name: 'seal_ocr',
        //     alias: '印章识别'
        // },
        // {
        //     path: '/worddetect',
        //     component: worddetect,
        //     name: 'worddetect',
        //     alias: '快速文本检测'
        // },
        // {
        //     path: '/opencamera',
        //     component: opencamera,
        //     name: 'opencamera',
        //     alias: '调用摄像头拍照'
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
/*
 * @Author: nigel
 * @Date: 2020-03-19 17:42:35
 * @LastEditTime: 2020-07-03 11:06:48
 */
import NotFound from './views/404.vue';
import Home from './views/Home.vue';
import gesture from './views/gesture/gesture.vue';
import eyeDistrict from './views/eyeDistrict/eyeDistrict.vue';
let routes = [
    {
        path: '/404',
        component: NotFound,
        name: '',
    },
    {
        path: '/',
        component: Home,
        name: 'Home',
        children: [
            {
                path: '/gesture',
                component: gesture,
                name: 'gesture',
                alias: '手势识别'
            },
            {
                path: '/eyeDistrict',
                component: eyeDistrict,
                name: 'eyeDistrict',
                alias: '眼球分区'
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
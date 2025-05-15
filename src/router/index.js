import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue'
import Basic from '@/views/scenes/Basic.vue'
import Deferred from '@/views/scenes/DeferredRendering.vue'
import NotFound from '@/views/NotFound.vue'
import PBR from '@/views/scenes/PBR.vue'
const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            title: 'Home'
        }
    },
    {
        path: '/basic',
        name: 'basic',
        component: Basic
    },  
    {
        path: '/deferred',
        name: 'deferred',
        component: Deferred,
    },
    {
        path: '/pbr',
        name: 'pbr',
        component: PBR,
    },
    {
        path: '/:pathMatch(.*)*', // 404
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
  history: createWebHistory('/Learn-Threejs/'),
  routes
});

export default router;
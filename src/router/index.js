import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue'
import Basic from '@/views/scenes/Basic.vue'
import NotFound from '@/views/NotFound.vue'
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
        component: Basic,
        meta: {
            title: '基础场景'
        }
    },  
    {
        path: '/:pathMatch(.*)*', // 404
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import Chat from '../pages/Chat.vue';
import { useAuthStore } from '../store';

const routes = [
    { path: '/login', component: Login },
    { path: '/chat', component: Chat, meta: { requiresAuth: true } },
    { path: '/', redirect: '/login' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 🔒 Navigation Guard
router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    if (to.meta.requiresAuth && !auth.token) {
        next('/login');
    } else {
        next();
    }
});

export default router;

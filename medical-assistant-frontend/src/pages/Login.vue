<template>
    <div class="login-page">
        <h2>Login</h2>
        <form @submit.prevent="login">
            <input v-model="username" placeholder="Username" required />
            <input v-model="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
        <p>No account? <router-link to="/register">Register</router-link></p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';

const username = ref('');
const password = ref('');
const router = useRouter();
const auth = useAuthStore();

const login = async () => {
    try {
        const res = await axios.post('http://localhost:8000/api/login/', {
            username: username.value,
            password: password.value,
        });

        const token = res.data.token;
        auth.setToken(token);
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        router.push('/chat');
    } catch (error: any) {
        alert(error?.response?.data?.error || 'Login failed');
    }
};
</script>

<style scoped>
.login-page {
    max-width: 400px;
    margin: auto;
    padding: 2rem;
}
</style>

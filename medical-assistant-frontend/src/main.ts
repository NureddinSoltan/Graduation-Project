import { createApp, nextTick } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './store';
import './style.css'  // Add this line

createApp(App).mount('#app')
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// ✅ Mount the app first
app.mount('#app');

// ✅ Then set axios token after Pinia is ready
nextTick(() => {
  const auth = useAuthStore();
  if (auth.token) {
    axios.defaults.headers.common['Authorization'] = `Token ${auth.token}`;
  }
});

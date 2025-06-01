<!-- side bar chatgpt -->
<!-- <template>
  <div class="bg-white dark:bg-[#1e1e1e] w-64 p-4 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
    <button @click="startNewConversation" class="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      + New Conversation
    </button>
    <ul>
      <li
        v-for="c in conversations"
        :key="c.id"
        @click="selectConversation(c)"
        class="cursor-pointer py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {{ c.title || 'Untitled Conversation' }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import axios from 'axios';

const conversations = ref<any[]>([]);
const router = useRouter();
const auth = useAuthStore();

const fetchConversations = async () => {
  try {
    axios.defaults.headers.common['Authorization'] = `Token ${auth.token}`;
    const res = await axios.get('http://localhost:8000/api/conversations/');
    conversations.value = res.data;
  } catch (err) {
    console.error('❌ Failed to fetch conversations', err);
  }
};

const startNewConversation = async () => {
  const res = await axios.post('http://localhost:8000/api/conversations/create/');
  const id = res.data.conversation_id;
  router.push({ path: '/chat', query: { id } });
};

const selectConversation = (conv: any) => {
  router.push({ path: '/chat', query: { id: conv.id } });
};

onMounted(fetchConversations);
</script> -->



<!-- side-bar claude --><template>
    <div class="bg-white dark:bg-gray-800 w-64 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <button @click="startNewConversation" class="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg 
             transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
             flex items-center justify-center space-x-2" :disabled="creating">
                <svg v-if="creating" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>{{ creating ? 'Creating...' : 'New Conversation' }}</span>
            </button>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto p-4">
            <div v-if="loading" class="flex items-center justify-center py-8">
                <div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>

            <div v-else-if="conversations.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                <div class="text-2xl mb-2">💬</div>
                <p class="text-sm">No conversations yet</p>
            </div>

            <ul v-else class="space-y-2">
                <li v-for="c in conversations" :key="c.id" @click="selectConversation(c)" :class="isActiveConversation(c.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'"
                    class="cursor-pointer p-3 rounded-lg border transition-colors duration-200 group">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {{ c.title || `Conversation #${c.id}` }}
                            </h3>
                            <p v-if="c.preview" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {{ c.preview }}
                            </p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {{ formatDate(c.created_at) }}
                            </p>
                        </div>

                        <!-- Delete button -->
                        <button @click.stop="deleteConversation(c.id)" class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 
                       transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete conversation">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                            </svg>
                        </button>
                    </div>
                </li>
            </ul>
        </div>

        <!-- User Info Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-medium">{{ userInitial }}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ auth.user?.username || 'User' }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Medical Assistant</p>
                </div>
                <button @click="logout" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     transition-colors duration-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    title="Logout">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                        </path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store';
import axios from 'axios';

interface Conversation {
    id: number;
    title: string;
    preview?: string;
    created_at: string;
}

const emit = defineEmits<{ conversationCreated: [id: number] }>();

const conversations = ref<Conversation[]>([]);
const loading = ref(false);
const creating = ref(false);
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const userInitial = computed(() => {
    const username = auth.user?.username || 'U';
    return username.charAt(0).toUpperCase();
});

const isActiveConversation = (id: number) => parseInt(route.query.id as string) === id;

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
};

const fetchConversations = async () => {
    if (!auth.token) return;
    loading.value = true;
    try {
        const res = await axios.get('http://localhost:8000/api/conversations/', {
            headers: { Authorization: `Token ${auth.token}` }
        });
        conversations.value = res.data.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } catch (err) {
        console.error('❌ Failed to fetch conversations', err);
    } finally {
        loading.value = false;
    }
};

const startNewConversation = async () => {
    if (!auth.token || creating.value) return;
    creating.value = true;
    try {
        const res = await axios.post('http://localhost:8000/api/conversations/', {}, {
            headers: { Authorization: `Token ${auth.token}` }
        });
        const newId = res.data.id;
        emit('conversationCreated', newId);
        await fetchConversations();
        router.push({ path: '/chat', query: { id: newId } });
    } catch (err) {
        console.error('❌ Failed to create conversation', err);
    } finally {
        creating.value = false;
    }
};

const selectConversation = (conv: Conversation) => {
    router.push({ path: '/chat', query: { id: conv.id } });
};

const deleteConversation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
        await axios.delete(`http://localhost:8000/api/conversations/${id}/`, {
            headers: { Authorization: `Token ${auth.token}` }
        });
        conversations.value = conversations.value.filter(c => c.id !== id);
        if (isActiveConversation(id)) router.push('/chat');
    } catch (err) {
        console.error('❌ Failed to delete conversation', err);
    }
};

const logout = () => {
    auth.logout();
    router.push('/login');
};

onMounted(fetchConversations);
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>

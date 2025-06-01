
<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar @conversation-created="handleConversationCreated" />

    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white">
          {{ currentConversationTitle }}
        </h1>
      </div>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4" ref="messagesContainer">
        <div v-if="messages.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-20">
          <div class="text-4xl mb-4">🩺</div>
          <h2 class="text-lg font-medium mb-2">Welcome to Medical AI Assistant</h2>
          <p>Describe your symptoms to get started</p>
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="msg.isUser ? 'flex justify-end' : 'flex justify-start'"
          class="animate-fade-in"
        >
          <div
            :class="msg.isUser 
              ? 'bg-blue-500 text-white ml-12' 
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-12 border border-gray-200 dark:border-gray-700'"
            class="max-w-3xl px-4 py-3 rounded-lg shadow-sm"
          >
            <div v-if="msg.isUser" class="whitespace-pre-line">{{ msg.text }}</div>
            <div v-else class="space-y-4">
              <div v-for="prediction in parsePredictions(msg.text)" :key="prediction.name" 
                class="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r">
                <h3 class="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-2">
                  🦠 {{ prediction.name }}
                </h3>
                <div class="text-sm text-green-600 dark:text-green-400 font-medium mb-3">
                  Confidence: {{ prediction.confidence }}%
                </div>
                <div class="space-y-3 text-sm">
                  <div>
                    <strong class="text-gray-700 dark:text-gray-300">📝 Description:</strong>
                    <p class="mt-1 text-gray-600 dark:text-gray-400">{{ prediction.description }}</p>
                  </div>
                  <div>
                    <strong class="text-gray-700 dark:text-gray-300">💊 Medications:</strong>
                    <p class="mt-1 text-gray-600 dark:text-gray-400">{{ prediction.medications }}</p>
                  </div>
                  <div>
                    <strong class="text-gray-700 dark:text-gray-300">🏡 Home Care:</strong>
                    <p class="mt-1 text-gray-600 dark:text-gray-400">{{ prediction.homeCare }}</p>
                  </div>
                  <div>
                    <strong class="text-gray-700 dark:text-gray-300">👨‍⚕️ When to See Doctor:</strong>
                    <p class="mt-1 text-gray-600 dark:text-gray-400">{{ prediction.whenToSeeDoctor }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="flex justify-start">
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg shadow-sm">
            <div class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Analyzing symptoms...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Form -->
      <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
        <form @submit.prevent="sendMessage" class="flex space-x-4">
          <input
            v-model="input"
            class="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Describe your symptoms in detail..."
            required
            :disabled="loading"
          />
          <button
            type="submit"
            class="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                   text-white font-medium rounded-lg transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="loading || !input.trim()"
          >
            {{ loading ? 'Analyzing...' : 'Send' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../store';
import Sidebar from '../components/Sidebar.vue';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface Prediction {
  name: string;
  confidence: string;
  description: string;
  medications: string;
  homeCare: string;
  whenToSeeDoctor: string;
}

const input = ref('');
const loading = ref(false);
const messages = ref<Message[]>([]);
const messagesContainer = ref<HTMLElement>();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const conversationId = ref<number | null>(null);
const currentConversationTitle = computed(() => {
  return conversationId.value ? `Conversation #${conversationId.value}` : 'New Conversation';
});

// Scroll to bottom of messages
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Parse predictions from response text
const parsePredictions = (text: string): Prediction[] => {
  if (!text) return [];
  
  // Try to parse as JSON first (in case server returns JSON)
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map(p => ({
        name: p.name || 'Unknown',
        confidence: p.confidence || '0',
        description: p.description || 'No description available',
        medications: p.medications || 'N/A',
        homeCare: p.homeCare || 'N/A',
        whenToSeeDoctor: p.whenToSeeDoctor || 'N/A'
      }));
    }
  } catch (e) {
    // Not JSON, continue with text parsing
  }
  
  // Parse formatted text response
  const sections = text.split('\n\n').filter(section => section.trim());
  return sections.map(section => {
    const lines = section.split('\n');
    const prediction: Prediction = {
      name: 'Unknown',
      confidence: '0',
      description: 'No description available',
      medications: 'N/A',
      homeCare: 'N/A',
      whenToSeeDoctor: 'N/A'
    };
    
    lines.forEach(line => {
      if (line.includes('🦠')) {
        const match = line.match(/🦠\s*(.*?)\s*\((\d+)%\)/);
        if (match) {
          prediction.name = match[1];
          prediction.confidence = match[2];
        }
      } else if (line.includes('📝')) {
        prediction.description = line.replace(/📝\s*/, '').trim();
      } else if (line.includes('💊')) {
        prediction.medications = line.replace(/💊\s*Medications:\s*/, '').trim();
      } else if (line.includes('🏡')) {
        prediction.homeCare = line.replace(/🏡\s*Home care:\s*/, '').trim();
      } else if (line.includes('👨‍⚕️')) {
        prediction.whenToSeeDoctor = line.replace(/👨‍⚕️\s*When to see doctor:\s*/, '').trim();
      }
    });
    
    return prediction;
  });
};

// Load conversation
const loadConversation = async () => {
  messages.value = [];

  if (!auth.token) {
    router.push('/login');
    return;
  }

  const id = route.query.id ? parseInt(route.query.id as string) : null;
  if (!id) {
    conversationId.value = null;
    return;
  }

  conversationId.value = id;

  try {
    const res = await axios.get('http://localhost:8000/api/conversations/', {
      headers: { Authorization: `Token ${auth.token}` },
    });

    const match = res.data.find((c: any) => c.id === id);
    if (match && match.messages) {
      messages.value = match.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        isUser: msg.is_user,
      }));
      scrollToBottom();
    }
  } catch (err) {
    console.error('Error loading conversation:', err);
  }
};

// Send message
const sendMessage = async () => {
  if (!input.value.trim()) return;

  // Create new conversation if none exists
  if (!conversationId.value) {
    try {
      const res = await axios.post('http://localhost:8000/api/conversations/create/', {}, {
        headers: { Authorization: `Token ${auth.token}` }
      });
      conversationId.value = res.data.conversation_id;
      
      // Update URL without triggering route change
      router.replace({ path: '/chat', query: { id: conversationId.value } });
    } catch (err) {
      console.error('Error creating conversation:', err);
      return;
    }
  }

  const userText = input.value.trim();
  input.value = '';

  // Add user message
  const userMessage: Message = { 
    id: Date.now(), 
    text: userText, 
    isUser: true 
  };
  messages.value.push(userMessage);
  scrollToBottom();

  loading.value = true;

  try {
    const res = await axios.post(
      'http://localhost:8000/api/predict/',
      { message: userText, conversation_id: conversationId.value },
      { headers: { Authorization: `Token ${auth.token}` } }
    );

    let responseText = '';
    
    if (res.data && Array.isArray(res.data.result)) {
      // Format the response properly
      responseText = JSON.stringify(res.data.result);
    } else if (res.data && typeof res.data === 'string') {
      responseText = res.data;
    } else {
      responseText = JSON.stringify(res.data);
    }

    const aiMessage: Message = { 
      id: Date.now() + 1, 
      text: responseText, 
      isUser: false 
    };
    messages.value.push(aiMessage);
    scrollToBottom();

  } catch (err) {
    console.error('Error predicting:', err);
    const errorMessage: Message = {
      id: Date.now() + 1,
      text: 'Sorry, I encountered an error while analyzing your symptoms. Please try again.',
      isUser: false,
    };
    messages.value.push(errorMessage);
    scrollToBottom();
  } finally {
    loading.value = false;
  }
};

// Handle new conversation creation from sidebar
const handleConversationCreated = (newConversationId: number) => {
  conversationId.value = newConversationId;
  messages.value = [];
};

// Watch for route changes
watch(() => route.query.id, loadConversation);
onMounted(loadConversation);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
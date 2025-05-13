// Chat functionality for the Medical Diagnosis AI Chatbot

// Get AI response from FastAPI backend
async function getModelPrediction(userMessage) {
    try {
        console.log('Sending request to AI model at port 8001');
        const response = await fetch('http://localhost:8001/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });
        if (!response.ok) {
            throw new Error('API error');
        }
        const data = await response.json();
        console.log('Received response from AI model:', data);
        // You can customize this based on your backend's response format
        if (data.result && data.result.length > 0) {
            // Format: [{label: ..., score: ...}]
            const top = data.result[0];
            return `Prediction: ${top.label} (confidence: ${(top.score * 100).toFixed(1)}%)`;  
        } else {
            return 'AI could not process your request.';
        }
    } catch (error) {
        console.error('Error contacting AI backend:', error);
        return 'Error contacting AI backend. Please make sure the backend server is running.';
    }
} 

// Process the transition from welcome to chat mode
function processWelcomeToChatTransition() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    // If this is the first message, make some UI adjustments
    if (chatContainer.children.length <= 1) {
        console.log('First message detected - adjusting UI');
        
        // Hide welcome container if it exists
        const welcomeContainer = document.getElementById('welcome-container');
        if (welcomeContainer) {
            welcomeContainer.style.display = 'none';
            welcomeContainer.style.height = '0';
            welcomeContainer.style.overflow = 'hidden';
            welcomeContainer.style.margin = '0';
            welcomeContainer.style.padding = '0';
            console.log('Welcome container hidden');
        }
        
        // Hide suggested topics if they exist
        const suggestedTopics = document.getElementById('suggested-topics');
        if (suggestedTopics) {
            suggestedTopics.style.display = 'none';
            console.log('Suggested topics hidden');
        }
        
        // Reset the main content container's margin
        const mainContentContainer = document.querySelector('.px-4.sm\\:px-6.lg\\:px-8');
        if (mainContentContainer) {
            mainContentContainer.style.marginTop = '0';
            mainContentContainer.style.paddingTop = '16px';
            console.log('Reset main content container margin');
        }
        
        // Make the chat input sticky at the bottom
        const messageForm = document.getElementById('message-form');
        const messageInput = document.getElementById('message-input');
        if (messageForm && messageForm.parentElement) {
            const chatInputContainer = messageForm.parentElement;
            chatInputContainer.setAttribute('style', 'position: sticky; bottom: 0; margin-bottom: 1rem; margin-top: 1rem; background-color: transparent; padding-top: 0.5rem; z-index: 10;');
            console.log('Chat input made sticky');
        }
        
        // Apply welcome page text box styling
        if (messageInput) {
            messageInput.className = 'block w-full px-4 py-3 pr-16 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none rounded-xl';
            messageInput.placeholder = 'Message Clinexa...';
            console.log('Applied welcome page text box styling');
        }
        
        // Configure chat messages container for proper display
        chatContainer.style.height = 'calc(100vh - 180px)';
        chatContainer.style.overflowY = 'auto';
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
        chatContainer.style.paddingRight = '8px';
        chatContainer.style.marginTop = '120px'; // Increased margin to move messages lower
        chatContainer.style.position = 'relative';
        chatContainer.style.zIndex = '5';
        console.log('Chat container styles applied');
    }
}

// Handle user message submission
function handleMessageSubmit(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    if (!messageInput || !messageInput.value.trim()) return;
    
    const userMessage = messageInput.value.trim();
    
    // Redirect to chat.html after first message
    if (window.location.pathname.includes('welcome.html')) {
        window.location.href = 'chat.html';
        // Store the first message in localStorage to be processed in chat.html
        localStorage.setItem('firstMessage', userMessage);
        return;
    }
    
    // Process the welcome to chat transition
    processWelcomeToChatTransition();

    // Use the original addMessageToChat from clinexa.js to add the user message
    if (typeof window.addMessageToChat === 'function') {
        window.addMessageToChat(userMessage, true);
    } else {
        console.error('clinexa.js addMessageToChat function not found');
    }

    // Clear input
    messageInput.value = '';

    // Create a unique ID for the loading message
    const loadingId = 'loading-' + Date.now();
    
    // Show loading message with the unique ID
    const chatContainer = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'w-full new-message';
    
    // Create content div for AI typing message
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message';
    contentDiv.textContent = 'AI is typing...';
    
    // Only add the content div
    loadingDiv.appendChild(contentDiv);
    
    // Add a subtle pulse animation
    contentDiv.animate(
        [
            { opacity: 0.5 },
            { opacity: 1 },
            { opacity: 0.5 }
        ],
        {
            duration: 1500,
            iterations: Infinity
        }
    );
    
    chatContainer.appendChild(loadingDiv);
    
    // Process the AI response
    getModelPrediction(userMessage)
        .then(aiResponse => {
            console.log("AI response:", aiResponse);
            // Find and remove the loading message by its unique ID
            const loadingMessage = document.getElementById(loadingId);
            if (loadingMessage) {
                loadingMessage.remove();
            }
            // Add the actual AI response using the original function from clinexa.js
            if (typeof window.addMessageToChat === 'function') {
                window.addMessageToChat(aiResponse, false);
            } else {
                console.error('clinexa.js addMessageToChat function not found');
            }
        })
        .catch(error => {
            console.error("Error in AI response:", error);
            // If there's an error, still remove the loading message
            const loadingMessage = document.getElementById(loadingId);
            if (loadingMessage) {
                loadingMessage.remove();
            }
            // Add a fallback message
            if (typeof window.addMessageToChat === 'function') {
                window.addMessageToChat("I'm sorry, I couldn't process your request. Please try again.", false);
            } else {
                console.error('clinexa.js addMessageToChat function not found');
            }
        });
}

// Initialize chat functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('chat.js: initializing with AI model integration');
    
    // Make the addMessageToChat function from clinexa.js available globally
    if (typeof addMessageToChat === 'function') {
        window.addMessageToChat = addMessageToChat;
        console.log('chat.js: stored clinexa.js addMessageToChat function globally');
    }
    
    // Check if there's a first message from welcome.html
    const firstMessage = localStorage.getItem('firstMessage');
    if (firstMessage) {
        console.log('Processing first message from welcome page:', firstMessage);
        // Add the user message to the chat
        if (typeof addMessageToChat === 'function') {
            addMessageToChat(firstMessage, true);
            
            // Process the welcome to chat transition
            processWelcomeToChatTransition();
            
            // Create a loading message while waiting for AI response
            const loadingId = 'loading-' + Date.now();
            const chatContainer = document.getElementById('chat-messages');
            const loadingDiv = document.createElement('div');
            loadingDiv.id = loadingId;
            loadingDiv.className = 'w-full new-message';
            
            // Create content div for AI typing message
            const contentDiv = document.createElement('div');
            contentDiv.className = 'ai-message';
            contentDiv.textContent = 'AI is typing...';
            
            // Only add the content div
            loadingDiv.appendChild(contentDiv);
            
            // Add a subtle pulse animation
            contentDiv.animate(
                [
                    { opacity: 0.5 },
                    { opacity: 1 },
                    { opacity: 0.5 }
                ],
                {
                    duration: 1500,
                    iterations: Infinity
                }
            );
            
            chatContainer.appendChild(loadingDiv);
            
            // Process the AI response
            getModelPrediction(firstMessage)
                .then(aiResponse => {
                    console.log("AI response for first message:", aiResponse);
                    // Find and remove the loading message
                    const loadingMessage = document.getElementById(loadingId);
                    if (loadingMessage) {
                        loadingMessage.remove();
                    }
                    // Add the actual AI response
                    if (typeof addMessageToChat === 'function') {
                        addMessageToChat(aiResponse, false);
                    } else {
                        console.error('addMessageToChat function not found');
                    }
                })
                .catch(error => {
                    console.error('Error getting AI response:', error);
                    const loadingMessage = document.getElementById(loadingId);
                    if (loadingMessage) {
                        loadingMessage.remove();
                    }
                    // Add a fallback message
                    if (typeof addMessageToChat === 'function') {
                        addMessageToChat("I'm sorry, I couldn't process your request. Please try again.", false);
                    } else {
                        console.error('addMessageToChat function not found');
                    }
                });
                
            // Clear the first message from localStorage
            localStorage.removeItem('firstMessage');
        } else {
            console.error('addMessageToChat function not available');
        }
    }
    
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        console.log("chat.js: attaching handler to message-form");
        messageForm.addEventListener('submit', handleMessageSubmit);
    } else {
        console.log("chat.js: message-form not found");
    }

    // Enable send button when there is input and update its appearance
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('button[type="submit"]');
    if (messageInput && sendButton) {
        const updateSendButtonState = () => {
            const hasText = messageInput.value.trim().length > 0;
            sendButton.disabled = !hasText;
            
            // For dark mode, the styling is handled by CSS classes
            // The disabled state is already managed by the disabled attribute
            // and the CSS selectors :disabled and :not(:disabled)
        };
        updateSendButtonState();
        messageInput.addEventListener('input', updateSendButtonState);
    }

    // Check if the backend server is running
    fetch('http://localhost:8001/docs')
        .then(response => {
            if (response.ok) {
                console.log('chat.js: Backend server is running on port 8001');
            }
        })
        .catch(error => {
            console.warn('chat.js: Backend server may not be running:', error.message);
        });

    //     addMessageToChat("I'm your medical assistant. Please describe your symptoms.", false);
    // }
});

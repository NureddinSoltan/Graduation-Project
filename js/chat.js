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
        const warningContainer = document.getElementById('warning-message');
        if (warningContainer) {
            warningContainer.style.position = 'absolute';
            warningContainer.style.bottom = '15px';
            warningContainer.style.left = '50%';
            warningContainer.style.transform = 'translate(-50%)';
            console.log('Warning message hidden');
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
        chatContainer.style.height = 'calc(100vh - 240px)'; // Adjusted height to leave room for input
        chatContainer.style.overflowY = 'auto'; // Only the messages area scrolls
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
        chatContainer.style.paddingRight = '8px';
        chatContainer.style.marginTop = '0'; // No top margin needed
        chatContainer.style.position = 'relative';
        chatContainer.style.zIndex = '5';
        
        // Make sure the parent container doesn't scroll
        const mainContent = document.querySelector('main.flex-1');
        if (mainContent) {
            mainContent.style.overflowY = 'hidden';
        }
        
        console.log('Chat container styles applied - only messages area scrollable');
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
    
    // Check if this is a follow-up option selection (like "yes")
    if (typeof window.processYesResponse === 'function') {
        const followUpResponse = window.processYesResponse(userMessage);
        if (followUpResponse) {
            // Add user message to chat
            if (typeof addMessageToChat === 'function') {
                addMessageToChat(userMessage, true);
                
                // Add the follow-up response
                addMessageToChat(followUpResponse, false, true); // true for HTML content
                
                // Clear input
                messageInput.value = '';
                messageInput.style.height = 'auto';
                return;
            }
        }
    }
    
    // Check if this is the first message in chat.html (welcome container is still visible)
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer && welcomeContainer.style.display !== 'none') {
        // Process the transition to chat mode
        processWelcomeToChatTransition();
    }
    
    // Add user message to chat
    if (typeof addMessageToChat === 'function') {
        addMessageToChat(userMessage, true);
    } else {
        console.error('addMessageToChat function not available');
    }
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
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
    getModelPrediction(userMessage)
        .then(aiResponse => {
            console.log("AI response:", aiResponse);
            // Find and remove the loading message
            const loadingMessage = document.getElementById(loadingId);
            if (loadingMessage) {
                loadingMessage.remove();
            }
            
            // Process the response for disease diagnosis if applicable
            let processedResponse = aiResponse;
            let isDiseaseResponse = false;
            
            if (typeof window.processDiseaseResponse === 'function') {
                // Check if this is a disease prediction response
                if (aiResponse.includes('Prediction:')) {
                    processedResponse = window.processDiseaseResponse(aiResponse);
                    isDiseaseResponse = true;
                } else if (aiResponse.includes('🩺') || aiResponse.includes('Description:')) {
                    // This is already a processed disease response (coming from welcome page)
                    processedResponse = aiResponse;
                    isDiseaseResponse = true;
                }
            }
            
            // Add the AI response with typing effect
            if (typeof addMessageToChat === 'function') {
                // Check if the response is HTML (from disease module)
                const isHtml = isDiseaseResponse || processedResponse.includes('<div') || processedResponse.includes('<button');
                
                // Create a new message div for AI response with typing effect
                const messageDiv = document.createElement('div');
                messageDiv.className = 'w-full new-message';
                
                // Create content div for AI message
                const contentDiv = document.createElement('div');
                contentDiv.className = 'ai-message';
                
                // Add empty content div to message div
                messageDiv.appendChild(contentDiv);
                
                // Add message div to chat container
                chatContainer.appendChild(messageDiv);
                
                // We'll handle the typing animation ourselves, so we'll set a flag to prevent
                // the original addMessageToChat function from being called again
                window.skipNextAddMessageToChat = true;
                
                // Implement typing effect based on content type
                if (isHtml) {
                    // For HTML content, we'll parse and display it properly
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(processedResponse, 'text/html');
                    
                    if (isDiseaseResponse) {
                        // For disease responses, we want to maintain the original structure
                        contentDiv.innerHTML = processedResponse;
                    } else {
                        // For other HTML content, process sections one by one
                        const sections = doc.querySelectorAll('*:not(script):not(style)');
                        let sectionIndex = 0;
                        
                        function typeNextSection() {
                            if (sectionIndex < sections.length) {
                                const section = sections[sectionIndex];
                                // Skip empty text nodes
                                if (section.textContent && section.textContent.trim() !== '') {
                                    contentDiv.appendChild(section);
                                    chatContainer.scrollTop = chatContainer.scrollHeight;
                                }
                                sectionIndex++;
                                setTimeout(typeNextSection, 100);
                            }
                        }
                        
                        // Start typing sections
                        typeNextSection();
                    }
                    
                    // Start typing sections
                    typeNextSection();
                } else {
                    // For plain text, use the original typing effect
                    let i = 0;
                    const typingSpeed = 10; // milliseconds per character
                    
                    function typeWriter() {
                        if (i < processedResponse.length) {
                            contentDiv.textContent += processedResponse.charAt(i);
                            i++;
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                            setTimeout(typeWriter, typingSpeed);
                        }
                    }
                    
                    // Start typing effect
                    typeWriter();
                }
                
                // Save conversation to history
                if (typeof saveConversation === 'function') {
                    saveConversation(userMessage, aiResponse);
                }
            } else {
                console.error('addMessageToChat function not available');
            }
        })
        .catch(error => {
            console.error('Error getting AI response:', error);
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
        // Extend addMessageToChat to handle HTML content
        const originalAddMessageToChat = addMessageToChat;
        window.addMessageToChat = function(message, isUser = false, isHtml = false) {
            // Check if we should skip this call (for AI messages with typing animation)
            if (!isUser && window.skipNextAddMessageToChat) {
                window.skipNextAddMessageToChat = false;
                return;
            }
            
            const chatContainer = document.getElementById('chat-messages');
            if (!chatContainer) return;
            
            // Create the message container with appropriate styling
            const messageDiv = document.createElement('div');
            
            if (isUser) {
                // User message - right-aligned with avatar
                messageDiv.className = 'flex w-full justify-end new-message';
                
                // Create user avatar with the same profile icon as in the top bar
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'ml-2 flex-shrink-0 flex items-end';
                avatarDiv.innerHTML = `
                    <div class="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-white text-sm font-semibold">
                        U
                    </div>
                `;
                
                // Create content div for user message
                const contentDiv = document.createElement('div');
                contentDiv.className = 'user-message';
                contentDiv.textContent = message;
                
                // Add content and avatar to the message div
                messageDiv.appendChild(contentDiv);
                messageDiv.appendChild(avatarDiv);
            } else {
                // AI message - left-aligned without avatar for ChatGPT style
                messageDiv.className = 'w-full new-message';
                
                // Create content div for AI message
                const contentDiv = document.createElement('div');
                contentDiv.className = 'ai-message';
                
                if (isHtml) {
                    // Set HTML content directly
                    contentDiv.innerHTML = message;
                } else {
                    contentDiv.textContent = message;
                }
                
                // Add content to the message div
                messageDiv.appendChild(contentDiv);
            }
            
            chatContainer.appendChild(messageDiv);
            
            // Scroll to bottom of chat
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Add a subtle fade-in animation
            messageDiv.animate(
                [
                    { opacity: 0, transform: 'translateY(10px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                {
                    duration: 300,
                    easing: 'ease-out'
                }
            );
        };
        console.log('chat.js: extended addMessageToChat function to handle HTML content');
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
                    
                    // Process the response for disease diagnosis if applicable
                    let processedResponse = aiResponse;
                    if (typeof window.processDiseaseResponse === 'function' && aiResponse.includes('Prediction:')) {
                        processedResponse = window.processDiseaseResponse(aiResponse);
                    }
                    
                    // Add the actual AI response
                    if (typeof addMessageToChat === 'function') {
                        // Check if the response is HTML (from disease module)
                        const isHtml = processedResponse.includes('<div') || processedResponse.includes('<button');
                        addMessageToChat(processedResponse, false, isHtml);
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
        
    // Add event listener for option button clicks
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('option-button')) {
            const option = event.target.getAttribute('onclick');
            if (option) {
                // Extract the option from onclick="handleFollowUpOption('option')"  
                const optionMatch = option.match(/handleFollowUpOption\(['"](.*?)['"]\)/);  
                if (optionMatch && optionMatch[1]) {  
                    const selectedOption = optionMatch[1];  
                    if (typeof window.handleFollowUpOption === 'function') {  
                        const response = window.handleFollowUpOption(selectedOption);  
                        if (response) {  
                            // Set flag to prevent duplicate message
                            window.skipNextAddMessageToChat = true;
                            
                            // Create a loading message while waiting
                            const loadingId = 'loading-' + Date.now();
                            const chatContainer = document.getElementById('chat-messages');
                            const loadingDiv = document.createElement('div');
                            loadingDiv.id = loadingId;
                            loadingDiv.className = 'w-full new-message';
                            
                            // Create content div for AI typing message
                            const loadingContent = document.createElement('div');
                            loadingContent.className = 'ai-message';
                            loadingContent.textContent = 'AI is typing...';
                            
                            // Only add the content div
                            loadingDiv.appendChild(loadingContent);
                            
                            // Add a subtle pulse animation
                            loadingContent.animate(
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
                            
                            // Use setTimeout to simulate a short processing time
                            setTimeout(() => {
                                // Remove loading message
                                const loadingMessage = document.getElementById(loadingId);
                                if (loadingMessage) {
                                    loadingMessage.remove();
                                }
                                
                                // Create a new message div for AI response with typing effect
                                const messageDiv = document.createElement('div');
                                messageDiv.className = 'w-full new-message';
                                
                                // Create content div for AI message
                                const contentDiv = document.createElement('div');
                                contentDiv.className = 'ai-message';
                                
                                // Add empty content div to message div
                                messageDiv.appendChild(contentDiv);
                                
                                // Add message div to chat container
                                chatContainer.appendChild(messageDiv);
                                
                                // For follow-up options, we want to maintain the original response structure
                                if (response.includes('disease-section') || response.includes('follow-up-options')) {
                                    // This is a disease follow-up response, preserve the HTML structure
                                    contentDiv.innerHTML = response;
                                    
                                    // Scroll to show the new content
                                    chatContainer.scrollTop = chatContainer.scrollHeight;
                                } else {
                                    // For non-disease responses, use the typing effect
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(response, 'text/html');
                                    const sections = doc.querySelectorAll('*:not(script):not(style)');
                                    let sectionIndex = 0;
                                    
                                    function typeNextSection() {
                                        if (sectionIndex < sections.length) {
                                            const section = sections[sectionIndex];
                                            // Skip empty text nodes
                                            if (section.textContent && section.textContent.trim() !== '') {
                                                contentDiv.appendChild(section);
                                                chatContainer.scrollTop = chatContainer.scrollHeight;
                                            }
                                            sectionIndex++;
                                            setTimeout(typeNextSection, 100); // Shorter delay for better typing effect
                                        }
                                    }
                                    
                                    // Start typing sections
                                    typeNextSection();
                                }
                            }, 500); // Short delay to make the typing indicator visible
                        }  
                    }  
                }  
            }  
        }  
    });
});

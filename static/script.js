// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const emojiPicker = document.getElementById('emojiPicker');

// State
let isDarkTheme = false;
let messageHistory = [];

// Load suggestions on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSuggestions();
    userInput.focus();
});

// Load suggested questions
async function loadSuggestions() {
    try {
        const response = await fetch('/api/suggestions');
        const data = await response.json();
        displaySuggestions(data.suggestions);
    } catch (error) {
        console.error('Error loading suggestions:', error);
    }
}

// Display suggestion chips
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        chip.onclick = () => {
            userInput.value = suggestion;
            sendMessage();
        };
        suggestionsContainer.appendChild(chip);
    });
}

// Add message to chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="fas ${isUser ? 'fa-user' : 'fa-robot'} message-icon"></i>
            <div class="message-text">${formatMessage(message)}</div>
        </div>
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to history
    messageHistory.push({
        text: message,
        isUser: isUser,
        time: time
    });
}

// Format message with basic markdown
function formatMessage(message) {
    // Convert URLs to links
    message = message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Convert line breaks to <br>
    message = message.replace(/\n/g, '<br>');
    
    // Convert bullet points
    message = message.replace(/•/g, '•');
    
    return message;
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Send message to backend
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove typing indicator and add bot response
        removeTypingIndicator();
        addMessage(data.response);
        
        // Update suggestions based on context (optional)
        if (messageHistory.length % 3 === 0) {
            loadSuggestions();
        }
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('Sorry, I\'m having trouble connecting. Please try again.');
    }
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
}

// Toggle emoji picker
function toggleEmojiPicker() {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none';
}

// Add emoji to input
function addEmoji(emoji) {
    userInput.value += emoji;
    userInput.focus();
    emojiPicker.style.display = 'none';
}

// Clear chat
function clearChat() {
    if (confirm('Clear all messages?')) {
        chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-content">
                    <i class="fas fa-robot message-icon"></i>
                    <div class="message-text">
                        Chat cleared! How can I help you?
                    </div>
                </div>
                <div class="message-time">Just now</div>
            </div>
        `;
        messageHistory = [];
    }
}

// Add clear chat button (optional)
function addClearButton() {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-btn';
    clearBtn.innerHTML = '<i class="fas fa-trash"></i>';
    clearBtn.onclick = clearChat;
    clearBtn.title = 'Clear chat';
    clearBtn.style.cssText = `
        position: absolute;
        top: 80px;
        right: 20px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 100;
    `;
    document.querySelector('.chat-header').appendChild(clearBtn);
}

// Initialize additional features
addClearButton();

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.emoji-btn') && !e.target.closest('.emoji-picker')) {
        emojiPicker.style.display = 'none';
    }
});

// Add input event for typing animation
userInput.addEventListener('input', () => {
    // Optional: Add typing animation logic here
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        userInput.focus();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        userInput.value = '';
        userInput.blur();
    }
});

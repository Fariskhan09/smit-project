from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# FAQ knowledge base with rules and patterns
faq_rules = [
    {
        'patterns': [r'hello', r'hi', r'hey', r'greetings', r'^hi$', r'^hello$'],
        'response': "Hello! 👋 How can I help you today?",
        'category': 'greeting'
    },
    {
        'patterns': [r'how are you', r'how do you do', r"how's it going"],
        'response': "I'm doing great, thanks for asking! 😊 How can I assist you?",
        'category': 'greeting'
    },
    {
        'patterns': [r'bye', r'goodbye', r'see you', r'take care', r'cya'],
        'response': "Goodbye! 👋 Feel free to come back if you have more questions.",
        'category': 'farewell'
    },
    {
        'patterns': [r'hours?', r'open', r'timing', r'when.*open', r'what time'],
        'response': "🕒 Our business hours are:\n• Monday-Friday: 9 AM to 6 PM\n• Saturday: 10 AM to 4 PM\n• Sunday: Closed",
        'category': 'hours'
    },
    {
        'patterns': [r'contact', r'email', r'phone', r'reach', r'support', r'call'],
        'response': "📞 You can reach us through:\n• Email: support@example.com\n• Phone: (555) 123-4567\n• Live Chat: Available 24/7 on our website",
        'category': 'contact'
    },
    {
        'patterns': [r'price', r'cost', r'pricing', r'fee', r'plan', r'subscription', r'how much'],
        'response': "💰 Our pricing plans:\n• Basic: $9.99/month\n• Pro: $19.99/month\n• Enterprise: Custom pricing\n\nAll plans include a 14-day free trial!",
        'category': 'pricing'
    },
    {
        'patterns': [r'refund', r'return', r'money back', r'cancellation', r'cancel'],
        'response': "🔄 We offer a 30-day money-back guarantee. To request a refund, please contact our support team with your order details.",
        'category': 'refund'
    },
    {
        'patterns': [r'payment', r'pay', r'credit card', r'debit card', r'paypal'],
        'response': "💳 We accept:\n• Visa, Mastercard, American Express\n• PayPal\n• Bank transfers\n• Apple Pay & Google Pay",
        'category': 'payment'
    },
    {
        'patterns': [r'shipping', r'delivery', r'ship', r'how long.*deliver'],
        'response': "🚚 Shipping Information:\n• Standard (3-5 business days): Free\n• Express (1-2 business days): $9.99\n• International: $14.99 (7-14 business days)",
        'category': 'shipping'
    },
    {
        'patterns': [r'help', r'support', r'assistance', r'can you help'],
        'response': "🆘 I'm here to help! You can ask me about:\n• Business hours\n• Contact information\n• Pricing plans\n• Refund policy\n• Payment methods\n• Shipping details",
        'category': 'help'
    },
    {
        'patterns': [r'thanks', r'thank you', r'appreciate'],
        'response': "You're welcome! 😊 Is there anything else I can help you with?",
        'category': 'gratitude'
    },
    {
        'patterns': [r'feature', r'capabilities', r'what can you do', r'function'],
        'response': "🤖 I'm your FAQ assistant! I can answer questions about:\n• Business operations\n• Products & services\n• Policies\n• Contact information\n\nJust ask me anything!",
        'category': 'capabilities'
    }
]

# Additional context-specific responses
context_responses = {
    'default': "I'm not sure about that. 🤔 Could you please rephrase your question or contact our support team for more specific help?",
    'no_match': "I don't have information about that yet. 📝 Our support team would be happy to help! Email: support@example.com"
}

def find_best_match(user_message):
    """Find the best matching response based on patterns"""
    user_message = user_message.lower().strip()
    
    # Check each rule for pattern matches
    for rule in faq_rules:
        for pattern in rule['patterns']:
            if re.search(pattern, user_message, re.IGNORECASE):
                return rule['response']
    
    # Handle common variations or multi-intent questions
    if any(word in user_message for word in ['and', '&', ',']):
        # Split into multiple questions if needed
        parts = re.split(r' and | & |, ', user_message)
        if len(parts) > 1:
            responses = []
            for part in parts[:3]:  # Limit to first 3 parts
                for rule in faq_rules:
                    for pattern in rule['patterns']:
                        if re.search(pattern, part, re.IGNORECASE):
                            responses.append(rule['response'])
                            break
            if responses:
                return "\n\n".join(responses[:2])  # Limit to 2 responses
    
    return context_responses['no_match']

@app.route('/')
def index():
    """Render the main chat interface"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'response': 'Please send a message.'})
        
        # Find the best matching response
        bot_response = find_best_match(user_message)
        
        return jsonify({
            'response': bot_response,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'response': 'Sorry, something went wrong. Please try again.',
            'status': 'error'
        }), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested questions"""
    suggestions = [
        "What are your hours?",
        "How can I contact support?",
        "What are your prices?",
        "Do you offer refunds?",
        "What payment methods do you accept?",
        "How does shipping work?"
    ]
    return jsonify({'suggestions': suggestions})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
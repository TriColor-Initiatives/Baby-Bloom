import React, { useState, useRef, useEffect } from 'react';
import './BabyMealChat.css';

const BabyMealChat = ({ onSendMessage, isLoading, error, onSuggestionClick }) => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content: "👋 Hi! I'm your baby meal assistant! I can help you with:\n\n• Recipe ideas and puree suggestions\n• Meal prep tips and pantry hacks\n• Allergen-safe alternatives\n• Age-appropriate meal planning\n\nWhat would you like to know?",
            timestamp: new Date()
        }
    ]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Expose method to set input value and send from parent
    useEffect(() => {
        if (onSuggestionClick) {
            onSuggestionClick.current = async (text) => {
                setInputValue(text);
                inputRef.current?.focus();
                // Auto-send after a brief delay
                setTimeout(async () => {
                    if (!isLoading) {
                        const userMessage = {
                            id: Date.now().toString(),
                            role: 'user',
                            content: text,
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, userMessage]);
                        setInputValue('');

                        const loadingMessageId = `loading-${Date.now()}`;
                        setMessages(prev => [...prev, {
                            id: loadingMessageId,
                            role: 'assistant',
                            content: '...',
                            isLoading: true,
                            timestamp: new Date()
                        }]);

                        try {
                            const response = await onSendMessage(text);
                            setMessages(prev => {
                                const filtered = prev.filter(msg => msg.id !== loadingMessageId);
                                return [...filtered, {
                                    id: `response-${Date.now()}`,
                                    role: 'assistant',
                                    content: response || "I'm here to help with baby meal planning! Ask me about recipes, purees, or meal ideas.",
                                    timestamp: new Date()
                                }];
                            });
                        } catch (err) {
                            setMessages(prev => {
                                const filtered = prev.filter(msg => msg.id !== loadingMessageId);
                                return [...filtered, {
                                    id: `error-${Date.now()}`,
                                    role: 'assistant',
                                    content: "Sorry, I encountered an error. Please try again!",
                                    timestamp: new Date(),
                                    isError: true
                                }];
                            });
                        }
                    }
                }, 300);
            };
        }
    }, [onSuggestionClick, isLoading, onSendMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Add loading message
        const loadingMessageId = `loading-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: loadingMessageId,
            role: 'assistant',
            content: '...',
            isLoading: true,
            timestamp: new Date()
        }]);

        try {
            // Call the parent's send handler
            const response = await onSendMessage(userMessage.content);

            // Remove loading message and add actual response
            setMessages(prev => {
                const filtered = prev.filter(msg => msg.id !== loadingMessageId);
                return [...filtered, {
                    id: `response-${Date.now()}`,
                    role: 'assistant',
                    content: response || "I'm here to help with baby meal planning! Ask me about recipes, purees, or meal ideas.",
                    timestamp: new Date()
                }];
            });
        } catch (err) {
            // Remove loading message and add error message
            setMessages(prev => {
                const filtered = prev.filter(msg => msg.id !== loadingMessageId);
                return [...filtered, {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: "Sorry, I encountered an error. Please try again!",
                    timestamp: new Date(),
                    isError: true
                }];
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="baby-meal-chat">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-header-icon">🍼</div>
                    <div className="chat-header-content">
                        <h3 className="chat-header-title">Baby Meal Chat</h3>
                        <p className="chat-header-subtitle">Get recipe ideas, meal tips & puree suggestions</p>
                    </div>
                </div>
                <div className="chat-status">
                    <span className="status-dot"></span>
                    <span className="status-text">AI Ready</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="chat-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'} ${message.isError ? 'error-message' : ''}`}
                    >
                        {message.role === 'assistant' && (
                            <div className="message-avatar">
                                <span className="avatar-icon">👶</span>
                            </div>
                        )}
                        <div className="message-bubble">
                            {message.isLoading ? (
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            ) : (
                                <>
                                    <div className="message-content">
                                        {message.content.split('\n').map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                {line}
                                                {idx < message.content.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="message-time">{formatTime(message.timestamp)}</div>
                                </>
                            )}
                        </div>
                        {message.role === 'user' && (
                            <div className="message-avatar user-avatar">
                                <span className="avatar-icon">👤</span>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="chat-input-container" onSubmit={handleSend}>
                <div className="chat-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="chat-input"
                        placeholder="Ask about recipes, purees, meal ideas..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="chat-send-button"
                        disabled={!inputValue.trim() || isLoading}
                        aria-label="Send message"
                    >
                        {isLoading ? (
                            <span className="send-icon">⏳</span>
                        ) : (
                            <span className="send-icon">➤</span>
                        )}
                    </button>
                </div>
                {error && (
                    <div className="chat-error">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default BabyMealChat;
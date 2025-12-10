import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './BabyMealChat.css';

const VaccinationsChat = ({ onSendMessage, isLoading, error, onSuggestionClick }) => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content: "👋 Hi! I'm your vaccination assistant. I provide short, practical answers about:\n\n• Vaccination schedules by age\n• Vaccine safety and side effects\n• When to delay or skip vaccines\n• Catch-up schedules\n• Vaccine-preventable diseases\n\n⚠️ **Important:** This is not a substitute for professional medical advice. Always follow your pediatrician's recommended vaccination schedule.\n\nWhat can I help with?",
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
                                    content: response || "I'm here to help with vaccination questions! Ask me about schedules, safety, or timing.",
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
                    content: response || "I'm here to help with vaccination questions! Ask me about schedules, safety, or timing.",
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
                    <div className="chat-header-icon">💉</div>
                    <div className="chat-header-content">
                        <h3 className="chat-header-title">Vaccination Assistant</h3>
                        <p className="chat-header-subtitle">Get vaccination guidance & schedule information</p>
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
                        <div className="message-bubble">
                            {message.role === 'user' && (
                                <div className="message-indicator user-indicator">
                                    <span>You</span>
                                </div>
                            )}
                            {message.role === 'assistant' && (
                                <div className="message-indicator assistant-indicator">
                                    <span>💉 Assistant</span>
                                </div>
                            )}
                            {message.isLoading ? (
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            ) : (
                                <>
                                    <div className="message-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                // Custom styling for markdown elements
                                                p: ({ node, children, ...props }) => {
                                                    // Skip rendering empty paragraphs
                                                    if (!children || (Array.isArray(children) && children.every(c => !c || c === '\n' || (typeof c === 'string' && c.trim() === '')))) {
                                                        return null;
                                                    }
                                                    return <p className="markdown-paragraph" {...props}>{children}</p>;
                                                },
                                                strong: ({ node, ...props }) => <strong className="markdown-strong" {...props} />,
                                                em: ({ node, ...props }) => <em className="markdown-em" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="markdown-list markdown-ul" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="markdown-list markdown-ol" {...props} />,
                                                li: ({ node, ...props }) => <li className="markdown-list-item" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="markdown-h1" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="markdown-h2" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="markdown-h3" {...props} />,
                                                code: ({ node, inline, ...props }) =>
                                                    inline ? (
                                                        <code className="markdown-code-inline" {...props} />
                                                    ) : (
                                                        <code className="markdown-code-block" {...props} />
                                                    ),
                                                blockquote: ({ node, ...props }) => <blockquote className="markdown-blockquote" {...props} />,
                                                hr: ({ node, ...props }) => <hr className="markdown-hr" {...props} />,
                                                br: () => <br style={{ lineHeight: '1.4' }} />,
                                                table: ({ node, ...props }) => <div className="markdown-table-wrapper"><table className="markdown-table" {...props} /></div>,
                                                thead: ({ node, ...props }) => <thead className="markdown-thead" {...props} />,
                                                tbody: ({ node, ...props }) => <tbody className="markdown-tbody" {...props} />,
                                                tr: ({ node, ...props }) => <tr className="markdown-tr" {...props} />,
                                                th: ({ node, ...props }) => <th className="markdown-th" {...props} />,
                                                td: ({ node, children, ...props }) => {
                                                    // Process children to convert <br> tags to actual line breaks
                                                    const processChildren = (children) => {
                                                        if (typeof children === 'string') {
                                                            return children.split('<br>').map((part, i, arr) =>
                                                                i < arr.length - 1 ? [part, <br key={i} />] : part
                                                            );
                                                        }
                                                        if (Array.isArray(children)) {
                                                            return children.flatMap((child, i) => {
                                                                if (typeof child === 'string' && child.includes('<br>')) {
                                                                    return child.split('<br>').flatMap((part, j, arr) =>
                                                                        j < arr.length - 1 ? [part, <br key={`${i}-${j}`} />] : part
                                                                    );
                                                                }
                                                                return child;
                                                            });
                                                        }
                                                        return children;
                                                    };
                                                    return <td className="markdown-td" {...props}>{processChildren(children)}</td>;
                                                },
                                            }}
                                        >
                                            {message.content.replace(/\n{3,}/g, '\n\n')}
                                        </ReactMarkdown>
                                    </div>
                                </>
                            )}
                        </div>
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
                        placeholder="Ask about vaccination schedules, safety, timing, or side effects..."
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

export default VaccinationsChat;


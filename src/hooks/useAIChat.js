import { useState, useRef } from 'react';
import { extractResponseText } from '../utils/aiUtils';
import { getBabyAge } from '../utils/babyUtils';

/**
 * Custom hook for AI chat functionality
 * @param {Function} systemPromptFn - Function that takes (babyAge) and returns system prompt string
 * @param {Object} options - Configuration options
 * @param {Object} options.activeBaby - Active baby object
 * @param {number|null} options.babyAgeInMonths - Pre-calculated baby age in months
 * @param {number} options.maxTokens - Maximum tokens for API response (default: 500)
 * @param {number} options.timeout - Request timeout in ms (default: 30000)
 * @param {Function} options.getFallbackResponse - Function that takes (babyAge) and returns fallback response
 * @param {Function} options.onResponse - Optional callback after successful response
 * @returns {Object} AI chat state and handlers
 */
export const useAIChat = (systemPromptFn, options = {}) => {
    const {
        activeBaby = null,
        babyAgeInMonths = null,
        maxTokens = 500,
        timeout = 30000,
        getFallbackResponse = null,
        onResponse = null
    } = options;

    const [aiStatus, setAiStatus] = useState('idle');
    const [aiError, setAiError] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);
    const suggestionClickRef = useRef(null);

    const handleChatMessage = async (userMessage) => {
        setAiStatus('loading');
        setAiError('');

        const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
        const babyAge = getBabyAge(activeBaby, babyAgeInMonths);

        // Generate system message from function
        const systemMessage = {
            role: 'system',
            content: systemPromptFn(babyAge)
        };

        const userMsg = {
            role: 'user',
            content: userMessage
        };

        // Build messages array with conversation history
        const messagesForApi = [
            systemMessage,
            ...conversationHistory.slice(-10), // Last 10 messages for context
            userMsg
        ];

        const sendRequest = async (messages, signal) => {
            if (!openAiKey) {
                // Demo fallback response
                if (getFallbackResponse) {
                    return {
                        choices: [{
                            message: {
                                content: getFallbackResponse(babyAge)
                            }
                        }]
                    };
                }
                return {
                    choices: [{
                        message: {
                            content: 'To get personalized AI responses, set up your VITE_OPENAI_API_KEY.'
                        }
                    }]
                };
            }

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openAiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages,
                    temperature: 0.7,
                    max_tokens: maxTokens
                }),
                signal
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('OpenAI response body:', errText);
                const error = new Error(`OpenAI error: ${res.status} ${res.statusText}`);
                error.status = res.status;
                throw error;
            }
            return res.json();
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await sendRequest(messagesForApi, controller.signal);
            const responseText = extractResponseText(response);

            // Update conversation history
            setConversationHistory(prev => {
                const updated = [...prev, userMsg, {
                    role: 'assistant',
                    content: responseText
                }];
                return updated.slice(-20); // Keep only last 20 messages
            });

            setAiStatus('idle');
            setAiError('');

            // Call optional callback
            if (onResponse) {
                onResponse(responseText);
            }

            return responseText;
        } catch (err) {
            console.error('AI chat error', err);
            setAiStatus('idle');

            let errorMsg;
            if (err.name === 'AbortError') {
                errorMsg = 'Request timed out. Please try again.';
            } else if (err.status === 429) {
                errorMsg = 'Rate limit reached. Please wait a moment before trying again.';
            } else if (err.status === 400) {
                errorMsg = 'Invalid request. Please check your message and try again.';
            } else if (err.status === 401) {
                errorMsg = 'API key is invalid or missing. Please check your configuration.';
            } else if (err.status === 500 || err.status >= 502) {
                errorMsg = 'AI service is temporarily unavailable. Please try again in a moment.';
            } else {
                errorMsg = `AI request failed: ${err.message || String(err)}. Please try again.`;
            }

            setAiError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            clearTimeout(timeoutId);
        }
    };

    return {
        aiStatus,
        aiError,
        conversationHistory,
        suggestionClickRef,
        handleChatMessage
    };
};


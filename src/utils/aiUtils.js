/**
 * Utility function to extract text from various AI API response formats
 * Handles OpenAI, Google, and other common response shapes
 */
export const extractResponseText = (data) => {
    // Normalize common provider response shapes to a single string
    if (!data) return '';

    // choices[0].message.content (chat format)
    const choiceMsg = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? null;

    if (typeof choiceMsg === 'string') return choiceMsg;

    if (Array.isArray(choiceMsg)) {
        return choiceMsg.map((r) => (typeof r === 'string' ? r : r?.text ?? JSON.stringify(r))).join('\n');
    }

    if (choiceMsg && typeof choiceMsg === 'object') {
        if (Array.isArray(choiceMsg.content)) {
            return choiceMsg.content.map((c) => c.text ?? JSON.stringify(c)).join('\n');
        }
        if (Array.isArray(choiceMsg.parts) || Array.isArray(choiceMsg.segments)) {
            const parts = choiceMsg.parts ?? choiceMsg.segments;
            return parts.map((p) => p.text ?? JSON.stringify(p)).join('\n');
        }
        if (typeof choiceMsg.text === 'string') return choiceMsg.text;
        return JSON.stringify(choiceMsg);
    }

    // Legacy shape: answer -> array of segments
    if (data?.answer && Array.isArray(data.answer) && data.answer[0]?.content) {
        return data.answer[0].content.map((c) => c.text ?? JSON.stringify(c)).join('\n');
    }

    // Fallback: stringify entire response
    try {
        return JSON.stringify(data);
    } catch (err) {
        return String(data);
    }
};


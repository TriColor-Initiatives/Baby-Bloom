import '../styles/pages.css';
import { useEffect, useMemo, useState, useRef } from 'react';
import { recipeLibrary } from '../data/recipes';
import BabyMealChat from '../components/BabyMealChat';

const FAVORITES_KEY = 'baby-bloom-recipe-favorites';
const PROFILE_AGE_KEY = 'babyAgeMonths';

const getProfileAge = () => {
  if (typeof window === 'undefined') return 8;
  const raw = localStorage.getItem(PROFILE_AGE_KEY);
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : 8;
};

const loadFavorites = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Unable to load favorites', err);
    return [];
  }
};

const Recipes = () => {
  const [viewMode, setViewMode] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState(() => new Set(loadFavorites()));
  const [aiStatus, setAiStatus] = useState('idle');
  const [aiError, setAiError] = useState('');
  const [dietFilter, setDietFilter] = useState('all');
  const [conversationHistory, setConversationHistory] = useState([]);
  const suggestionClickRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);


  const filteredRecipes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return recipeLibrary.filter((recipe) => {
      const matchesDiet = dietFilter === 'all' || recipe.diet === dietFilter;
      if (!matchesDiet) return false;

      if (!term) return true;
      return (
        recipe.name.toLowerCase().includes(term) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(term)) ||
        recipe.ingredients.some((item) => item.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, dietFilter]);

  const favoriteRecipes = recipeLibrary.filter((recipe) => favorites.has(recipe.id));
  const displayedRecipes = viewMode === 'favorites' ? favoriteRecipes : filteredRecipes;

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const extractResponseText = (data) => {
    // Normalize common provider response shapes to a single string
    if (!data) return '';
    // choices[0].message.content (chat format)
    const choiceMsg = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? null;
    if (typeof choiceMsg === 'string') return choiceMsg;
    if (Array.isArray(choiceMsg)) return choiceMsg.map((r) => (typeof r === 'string' ? r : r?.text ?? JSON.stringify(r))).join('\n');
    if (choiceMsg && typeof choiceMsg === 'object') {
      if (Array.isArray(choiceMsg.content)) return choiceMsg.content.map((c) => c.text ?? JSON.stringify(c)).join('\n');
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

  // Handle chat messages
  const handleChatMessage = async (userMessage) => {
    setAiStatus('loading');
    setAiError('');

    const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const babyAge = getProfileAge();

    // Determine token limit based on request type
    const isLongRequest =
      userMessage.toLowerCase().includes('7 days') ||
      userMessage.toLowerCase().includes('week') ||
      userMessage.toLowerCase().includes('meal plan') ||
      userMessage.toLowerCase().includes('weekly');

    const maxTokens = isLongRequest ? 3000 : 1500;

    // System message to keep AI focused on baby meal planning
    const systemMessage = {
      role: 'system',
      content: `You are the Baby Meal Assistant. Follow these formatting and behavior rules strictly:

1. STYLE & TONE:
- Warm, gentle, positive, and encouraging
- Baby-friendly energy without being childish
- Keep sentences clear and simple
- Use soft emojis like 🍼🥣👶🍐 only where they enhance clarity
- Never overwhelm with long paragraphs

2. FORMATTING RULES (NO hash headings allowed):
- All responses must use bold titles, bullets, numbers, and clean spacing
- Use this structure:

Main Title (bold)
A short friendly intro line.

Meal Title (bold, optional emoji)
Texture: smooth / mashed / finger food
Age: recommended age in months

Ingredients:
• ingredient
• ingredient
• ingredient

How to make:

Step

Step

Step

Notes:
• safety tips
• allergen info
• simple swaps

Finish with a gentle closing question or offer to help.

3. RESPONSE LAYOUT EXAMPLE (copy this format):

Day 1 – Breakfast: Apple Oatmeal 🥣
Texture: Smooth puree
Age: 7–8 months

Ingredients:
• 1/4 cup oats
• 1/2 apple, peeled
• Water or breast milk

How to make:

Cook oats until very soft.

Add diced apple and simmer until tender.

Blend or mash to your baby's preferred texture.

Notes:
• Add more milk if you need a thinner puree.
• Introduce new fruits slowly to check for reactions.

Let me know if you'd like a dairy-free or faster version! 💛

4. BEHAVIORAL CONSTRAINTS:
- Only discuss baby meals, purees, recipes, ingredients, textures, allergens, substitutions, and meal plans
- Do not give medical instructions
- If a medical question appears, gently redirect to a pediatrician
- Keep all answers concise but helpful
- Avoid over-formatting — keep responses clean and consistent

5. CHAT-FRIENDLY RULES:
- No long blocks of text
- Break sections with spacing
- Use bullets and numbers for readability
- Ensure every message is visually scannable in a chat bubble
- Keep tone supportive, not robotic
- When creating tables, use actual line breaks (press Enter) between items in cells, NOT <br> tags
- For multi-line content in table cells, use natural line breaks, not HTML tags

6. MEMORY OF CONTEXT:
- Remember the baby's age if mentioned earlier (current baby is ${babyAge} months old)
- Adjust textures according to age
- Consider allergens or diet preferences previously stated

Remember: Use **bold** for titles, not # headings. Keep responses warm, formatted, and focused on baby meal planning.`
    };

    const userMsg = {
      role: 'user',
      content: userMessage
    };

    // Build messages array with conversation history (last 10 messages for context)
    const messagesForApi = [
      systemMessage,
      ...conversationHistory.slice(-10), // Last 10 messages for context
      userMsg
    ];

    const sendRequest = async (messages, signal) => {
      if (!openAiKey) {
        // Demo fallback response
        return {
          choices: [{
            message: {
              content: `**Quick Meal Ideas for Your ${babyAge}-Month-Old** 🍼

Here are some simple suggestions to get you started:

**Avocado & Banana Puree** 🥑
Texture: Smooth puree
Age: 6+ months

Ingredients:
• 1/2 ripe avocado
• 1/2 banana
• Breast milk or formula (as needed)

How to make:

Mash avocado and banana together until smooth.

Add a little breast milk or formula if you need a thinner texture.

Serve fresh.

Notes:
• Avocado is rich in healthy fats for brain development.
• Introduce one new food at a time to check for reactions.

**Sweet Potato Mash** 🍠
Texture: Smooth puree
Age: 6+ months

Ingredients:
• 1 small sweet potato
• Water or breast milk

How to make:

Steam or bake sweet potato until very soft.

Peel and mash until smooth.

Add liquid if needed for desired texture.

Notes:
• Great source of beta-carotene.
• Can be stored in the fridge for up to 3 days.

To get personalized AI responses with more recipes and meal plans, set up your VITE_OPENAI_API_KEY. 💛`
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
    // Increase timeout for longer requests (7-day meal plans need more time)
    const timeoutDuration = isLongRequest ? 60000 : 30000; // 60s for long requests, 30s for regular
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      const response = await sendRequest(messagesForApi, controller.signal);
      const responseText = extractResponseText(response);

      // Check if response was truncated (OpenAI sometimes truncates even with max_tokens)
      const wasTruncated = responseText.length > 0 &&
        (responseText.endsWith('...') ||
          responseText.includes('[truncated]') ||
          (maxTokens >= 2000 && responseText.length < 100)); // Suspiciously short for long requests

      // Update conversation history
      setConversationHistory(prev => {
        const updated = [...prev, userMsg, {
          role: 'assistant',
          content: responseText
        }];
        // Keep only last 20 messages to avoid token bloat
        return updated.slice(-20);
      });

      setAiStatus('idle');
      setAiError('');

      // Add note if truncated
      if (wasTruncated) {
        return responseText + '\n\n*Note: Response may have been truncated. Please ask for specific days if you need more details.*';
      }

      return responseText || "I'm here to help with baby meal planning! Ask me about recipes, purees, or meal ideas.";
    } catch (err) {
      console.error('AI chat error', err);
      setAiStatus('idle');

      // Don't add failed user message to history
      if (err.name === 'AbortError') {
        // Check if it was a long request based on the user message
        const wasLongRequest =
          userMessage.toLowerCase().includes('7 days') ||
          userMessage.toLowerCase().includes('week') ||
          userMessage.toLowerCase().includes('meal plan') ||
          userMessage.toLowerCase().includes('weekly');

        const errorMsg = wasLongRequest
          ? 'Request timed out. Generating a 7-day meal plan takes longer. Please wait a moment and try again, or ask for fewer days.'
          : 'Request timed out. The AI may be taking longer than expected. Please try again.';
        setAiError(errorMsg);
        throw new Error(errorMsg);
      } else if (err.status === 429) {
        const errorMsg = 'Rate limit reached. Please wait a moment before trying again.';
        setAiError(errorMsg);
        throw new Error(errorMsg);
      } else if (err.status === 400) {
        const errorMsg = 'Invalid request. Please check your message and try again.';
        setAiError(errorMsg);
        throw new Error(errorMsg);
      } else if (err.status === 401) {
        const errorMsg = 'API key is invalid or missing. Please check your configuration.';
        setAiError(errorMsg);
        throw new Error(errorMsg);
      } else if (err.status === 500 || err.status >= 502) {
        const errorMsg = 'AI service is temporarily unavailable. Please try again in a moment.';
        setAiError(errorMsg);
        throw new Error(errorMsg);
      } else {
        const errorMsg = `AI request failed: ${err.message || String(err)}. Please try again.`;
        setAiError(errorMsg);
        throw new Error(errorMsg);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };



  return (
    <div className="page-container recipes-page" style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <div className="page-header">
        <div className="page-header-top">
          <h1 className="page-title">
            <span className="page-title-icon" aria-hidden="true">🥗</span>
            Meal Recipes & AI Planner
          </h1>
          <div className={`page-actions ${viewMode === 'planner' ? 'planner-mode' : ''}`}>
            <button
              className={`nav-tab ${viewMode === 'library' ? 'active' : ''}`}
              onClick={() => setViewMode('library')}
            >
              <span aria-hidden="true">🔎</span>
              <span>Recipe Library</span>
            </button>
            <button
              className={`nav-tab ${viewMode === 'favorites' ? 'active' : ''}`}
              onClick={() => setViewMode('favorites')}
            >
              <span aria-hidden="true">⭐</span>
              <span>Favorites</span>
            </button>
            <button
              className={`nav-tab ${viewMode === 'planner' ? 'active' : ''}`}
              onClick={() => setViewMode('planner')}
            >
              <span aria-hidden="true">🧠</span>
              <span>AI Meal Planner</span>
            </button>
          </div>
        </div>
      </div>

      <div className="page-meta"></div>

      {viewMode !== 'planner' && (
        <>
          <div className="recipes-toolbar-sticky">
            <div className="recipes-toolbar">
              <div className="toolbar-filters">
                <span className="filter-label">Diet:</span>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${dietFilter === 'all' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setDietFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${dietFilter === 'vegetarian' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setDietFilter('vegetarian')}
                  >
                    Vegetarian
                  </button>
                  <button
                    className={`filter-btn ${dietFilter === 'non-veg' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setDietFilter('non-veg')}
                  >
                    Non-veg
                  </button>
                </div>
              </div>
              <div className="toolbar-search">
                <input
                  className="recipe-search-input"
                  placeholder="Search recipes, ingredients, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="toolbar-meta">
                  {displayedRecipes.length} {displayedRecipes.length === 1 ? 'recipe' : 'recipes'}
                </span>
              </div>
            </div>
          </div>

          <div className="recipes-grid">
            {displayedRecipes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">🍼</div>
                <h3>No recipes found</h3>
                <p>Try clearing the search or switch back to the full library.</p>
              </div>
            ) : (
              displayedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`recipe-card-vertical ${recipe.diet === 'vegetarian' ? 'veg' : 'non-veg'}`}
                >
                  <div className="recipe-card-icon-wrapper">
                    <div className="recipe-icon-vertical" aria-hidden="true">{recipe.icon}</div>
                    <button
                      className={`recipe-favorite-btn-vertical ${favorites.has(recipe.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      aria-label={favorites.has(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.has(recipe.id) ? '⭐' : '☆'}
                    </button>
                  </div>
                  <h3 className="recipe-name-vertical">{recipe.name}</h3>
                  <button
                    className="recipe-view-btn-vertical"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    View Recipe
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {viewMode === 'planner' && (
        <div className="ai-planner-container">
          {/* Chat Container */}
          <div className="ai-chat-wrapper">
            <BabyMealChat
              onSendMessage={handleChatMessage}
              isLoading={aiStatus === 'loading'}
              error={aiError}
              onSuggestionClick={suggestionClickRef}
            />
          </div>
        </div>
      )}


      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal recipe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedRecipe.name}</h3>
              <button className="modal-close" onClick={() => setSelectedRecipe(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div className="recipe-modal-meta">
                <span>👶 {selectedRecipe.ageRange}</span>
                <span>⏱️ {selectedRecipe.time}</span>
                <span>⭐ {selectedRecipe.difficulty}</span>
              </div>
              <p className="recipe-nutrition">{selectedRecipe.nutrition}</p>
              <h4>Ingredients</h4>
              <ul className="recipe-list">
                {selectedRecipe.ingredients.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <h4>Steps</h4>
              <ol className="recipe-list">
                {selectedRecipe.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
              <p><strong>Allergens:</strong> {selectedRecipe.allergens.length ? selectedRecipe.allergens.join(', ') : 'None noted'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;

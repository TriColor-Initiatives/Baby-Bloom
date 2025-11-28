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
          max_tokens: 500
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
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await sendRequest([systemMessage, userMsg], controller.signal);
      const responseText = extractResponseText(response);
      setAiStatus('idle');
      setAiError('');
      return responseText || "I'm here to help with baby meal planning! Ask me about recipes, purees, or meal ideas.";
    } catch (err) {
      console.error('AI chat error', err);
      setAiStatus('idle');

      if (err.name === 'AbortError') {
        setAiError('Request timed out. Please try again.');
        throw new Error('Request timed out. Please try again.');
      } else if (err.status === 429) {
        setAiError('Rate limit reached. Please try again in a moment.');
        throw new Error('Rate limit reached. Please try again in a moment.');
      } else {
        const errorMsg = `AI request failed: ${err.message || String(err)}`;
        setAiError(errorMsg);
        throw new Error(errorMsg);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };



  return (
    <div className="page-container recipes-page">
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
        <div className="section-card">
          <div className="recipes-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Diet filter:</span>
              <button
                className={`btn btn-secondary ${dietFilter === 'all' ? 'active' : ''}`}
                type="button"
                onClick={() => setDietFilter('all')}
              >
                All
              </button>
              <button
                className={`btn btn-secondary ${dietFilter === 'vegetarian' ? 'active' : ''}`}
                type="button"
                onClick={() => setDietFilter('vegetarian')}
              >
                Vegetarian
              </button>
              <button
                className={`btn btn-secondary ${dietFilter === 'non-veg' ? 'active' : ''}`}
                type="button"
                onClick={() => setDietFilter('non-veg')}
              >
                Non-veg (eggs/meat)
              </button>
            </div>
            <input
              className="form-input"
              placeholder="Search by name, ingredient, or tag (e.g., puree, iron, finger food)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="toolbar-meta">
              {displayedRecipes.length} recipe{displayedRecipes.length === 1 ? '' : 's'}
            </span>
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
                  className={`card recipe-card ${recipe.diet === 'vegetarian' ? 'veg' : 'non-veg'}`}
                >
                  <div className="recipe-icon" aria-hidden="true">{recipe.icon}</div>
                  <div className="recipe-meta">
                    <h4 className="recipe-title">{recipe.name}</h4>
                    <div className="recipe-tags">
                      <span className="recipe-tag">👶 {recipe.ageRange}</span>
                      <span className="recipe-tag">⏱️ {recipe.time}</span>
                      <span className="recipe-tag">⭐ {recipe.difficulty}</span>
                    </div>
                    <div className="recipe-nutrition">{recipe.nutrition}</div>
                  </div>
                  <div className="recipe-actions">
                    <button className="btn btn-secondary" onClick={() => setSelectedRecipe(recipe)}>
                      <span aria-hidden="true">📖</span>
                      <span>View steps</span>
                    </button>
                    <button
                      className={`btn btn-secondary ${favorites.has(recipe.id) ? 'is-active' : ''}`}
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <span aria-hidden="true">{favorites.has(recipe.id) ? '💜' : '🤍'}</span>
                      <span>{favorites.has(recipe.id) ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                  <div className="recipe-footnote">
                    <strong>Allergens:</strong> {recipe.allergens.length ? recipe.allergens.join(', ') : 'None noted'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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

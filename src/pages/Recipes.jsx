import '../styles/pages.css';
import { useEffect, useMemo, useState, useRef } from 'react';
import { recipeLibrary } from '../data/recipes';
import BabyMealChat from '../components/BabyMealChat';
import { useAIChat } from '../hooks/useAIChat';

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
  const [dietFilter, setDietFilter] = useState('all');

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

  // AI Chat hook - Recipes has special handling for long requests
  const getSystemPrompt = (babyAge) => {
    const age = babyAge || getProfileAge();
    return `You are the Baby Meal Assistant. Follow these formatting and behavior rules:

1. STYLE & TONE:
- Warm, gentle, positive, and encouraging
- Baby-friendly energy without being childish
- Keep sentences clear and simple
- Use soft emojis like 🍼🥣👶🍐 only where they enhance clarity
- Natural, conversational responses

2. FORMATTING RULES:
- Use **bold** for recipe/meal titles (required for recipes)
- Use bullet points for ingredients and notes (required for recipes)
- For simple questions (not recipe requests), answer naturally without excessive formatting
- Only use structured formatting when providing actual recipes or meal plans
- For general questions about feeding, answer conversationally

3. WHEN TO USE STRUCTURED FORMAT:
- ALWAYS use structured format for: recipes, meal plans, specific meal suggestions
- DON'T use structured format for: general questions, yes/no answers, simple advice
- Examples that NEED structure: "give me a recipe", "meal plan for 7 days", "breakfast ideas"
- Examples that DON'T need structure: "when to start solids", "is this safe", "how much"

4. RECIPE FORMAT (use when providing recipes):

**Recipe Name** (emoji optional)
Texture: smooth / mashed / finger food
Age: recommended age in months

Ingredients:
• ingredient
• ingredient

How to make:

Step 1

Step 2

Notes:
• safety tips
• allergen info

5. BEHAVIORAL CONSTRAINTS:
- Only discuss baby meals, purees, recipes, ingredients, textures, allergens, substitutions, and meal plans
- Do not give medical instructions
- If a medical question appears, gently redirect to a pediatrician
- Keep all answers concise but helpful
- Be natural - not every response needs recipe formatting

6. CHAT-FRIENDLY RULES:
- No long blocks of text
- Break sections with spacing
- Use bullets and numbers for readability in recipes
- Ensure every message is visually scannable
- Keep tone supportive, not robotic
- When creating tables, use actual line breaks between items, NOT <br> tags

7. MEMORY OF CONTEXT:
- Remember the baby's age if mentioned earlier (current baby is ${age} months old)
- Adjust textures according to age
- Consider allergens or diet preferences previously stated

8. EXAMPLES:

User: "Give me a recipe for breakfast"
You: **Apple Oatmeal** 🥣
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

User: "When can I start giving finger foods?"
You: Most babies are ready for finger foods around 8-9 months when they can sit up independently and use a pincer grasp. Start with soft, easy-to-grasp foods like banana slices, avocado, or well-cooked pasta. Always supervise closely.

User: "Is honey safe for babies?"
You: No, honey is not safe for babies under 12 months due to the risk of botulism. Avoid all forms of honey, including in baked goods, until your baby is at least one year old.

Remember: Use structured formatting for recipes/meal plans, but answer general questions naturally.`;
  };

  const getFallbackResponse = (babyAge) => {
    const age = babyAge || getProfileAge();
    return `**Quick Meal Ideas for Your ${age}-Month-Old** 🍼

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

To get personalized AI responses with more recipes and meal plans, set up your VITE_OPENAI_API_KEY. 💛`;
  };

  // AI Chat hook - Recipes uses higher defaults for meal plans
  const {
    aiStatus,
    aiError,
    conversationHistory,
    suggestionClickRef,
    handleChatMessage: baseHandleChatMessage
  } = useAIChat(getSystemPrompt, {
    activeBaby: null,
    babyAgeInMonths: getProfileAge(),
    maxTokens: 3000, // Higher default for meal plans
    timeout: 60000, // Longer timeout for meal plans
    getFallbackResponse
  });

  // Wrapper to handle dynamic tokens/timeout for long requests
  const handleChatMessage = async (userMessage) => {
    // The hook already uses high defaults, so we can just use it directly
    // If needed in the future, we can enhance the hook to support dynamic parameters
    return baseHandleChatMessage(userMessage);
  };



  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <h1 className="page-title">
            <span className="page-title-icon" aria-hidden="true">🥗</span>
            Meal Recipes & AI Planner
          </h1>
          <div className={`page-actions ${viewMode === 'planner' ? 'planner-mode' : ''}`}>
            <button
              className={`btn ${viewMode === 'library' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('library')}
            >
              <span>🔎</span>
              <span>Recipe Library</span>
            </button>
            <button
              className={`btn btn-secondary ${viewMode === 'favorites' ? 'active' : ''}`}
              onClick={() => setViewMode('favorites')}
            >
              <span>⭐</span>
              <span>Favorites</span>
            </button>
            <button
              className={`btn btn-new-feature ${viewMode === 'planner' ? 'active' : ''}`}
              onClick={() => setViewMode('planner')}
            >
              <span>🧠</span>
              <span>AI Meal Planner</span>
            </button>
          </div>
        </div>
      </div>

      <div className="page-meta"></div>

      {viewMode !== 'planner' && (
        <>
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
    </>
  );
};

export default Recipes;

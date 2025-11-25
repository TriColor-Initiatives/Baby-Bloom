import '../styles/pages.css';
import { useEffect, useMemo, useState } from 'react';
import { recipeLibrary } from '../data/recipes';

const FAVORITES_KEY = 'baby-bloom-recipe-favorites';
const PLAN_KEY = 'baby-bloom-ai-plan';

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

const loadAiPlan = () => null;

const Recipes = () => {
  const [viewMode, setViewMode] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState(() => new Set(loadFavorites()));
  const [aiPlan, setAiPlan] = useState(loadAiPlan);
  const [aiStatus, setAiStatus] = useState('idle');
  const [aiError, setAiError] = useState('');
  const [dietFilter, setDietFilter] = useState('all');
  const [aiForm, setAiForm] = useState({
    ageMonths: 8,
    allergens: 'dairy, eggs',
    dislikes: '',
    texture: 'purees/mashed',
    mealsPerDay: 3,
    specialRequest: 'Keep prep under 20 minutes and use pantry basics.'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    // Ensure no cached plan (e.g., old sample) persists between sessions
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PLAN_KEY);
      if (aiPlan !== null) {
        setAiPlan(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (aiPlan) {
      localStorage.setItem(PLAN_KEY, JSON.stringify(aiPlan));
    } else {
      localStorage.removeItem(PLAN_KEY);
    }
  }, [aiPlan]);

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

  const parsePlanContent = (text) => {
    if (!text) return null;

    const tryParse = (value) => {
      if (!value) return null;
      const attempts = [
        value,
        value
          .replace(/[“”]/g, '"')
          .replace(/[‘’]/g, "'")
          .replace(/,\s*([}\]])/g, '$1')
          .trim()
      ];

      for (const attempt of attempts) {
        try {
          return JSON.parse(attempt);
        } catch {
          continue;
        }
      }
      return null;
    };

    const candidates = [];
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlock?.[1]) {
      candidates.push(codeBlock[1].trim());
    }

    const withoutThoughts = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (withoutThoughts && withoutThoughts !== text) {
      candidates.push(withoutThoughts);
    }

    candidates.push(text.trim());

    for (const candidate of candidates) {
      const parsed = tryParse(candidate);
      if (parsed) return parsed;
    }

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slice = text.slice(firstBrace, lastBrace + 1);
      const parsed = tryParse(slice);
      if (parsed) return parsed;
    }

    return null;
  };

  const generateAiPlan = async (event) => {
    event.preventDefault();
    setAiStatus('loading');
    setAiError('');

    const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const provider = perplexityKey ? 'perplexity' : openAiKey ? 'openai' : '';

    if (!provider) {
      setAiError('Add VITE_PERPLEXITY_API_KEY (or VITE_OPENAI_API_KEY) to your .env for live AI results.');
      setAiPlan(null);
      setAiStatus('ready');
      return;
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are a pediatric nutritionist. Respond with ONE JSON object only (no markdown, no code fences, no <think>, no prose, no citations, no URLs). Shape: {days:[{day, meals:[{name, timeOfDay, ingredients, prep, portionGrams, notes, allergens}]}], summary:{calciumMg, ironMg, proteinG, fiberG, reminders}}. Keep prep under 20 minutes; avoid honey and choking hazards. Ensure the JSON is valid for JavaScript JSON.parse.'
      },
      {
        role: 'user',
        content: `Baby age: ${aiForm.ageMonths} months
Avoid: ${aiForm.allergens || 'none'}
Texture: ${aiForm.texture}
Meals per day: ${aiForm.mealsPerDay} + 1 snack if appropriate
Dislikes/notes: ${aiForm.dislikes || 'none'}
Special request: ${aiForm.specialRequest || 'none'}
Output valid JSON only, no prose, markdown, or <think> content.`
      }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const isPerplexity = provider === 'perplexity';
      const response = await fetch(isPerplexity ? 'https://api.perplexity.ai/chat/completions' : 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${isPerplexity ? perplexityKey : openAiKey}`
        },
        body: JSON.stringify({
          model: isPerplexity ? 'sonar-reasoning' : 'gpt-4o-mini',
          messages,
          temperature: 0,
          max_tokens: 2000,
          ...(isPerplexity ? { return_citations: false } : { response_format: { type: 'json_object' } })
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`${isPerplexity ? 'Perplexity' : 'OpenAI'} error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = parsePlanContent(content);

      if (parsed) {
        setAiPlan(parsed);
        setAiStatus('ready');
        setAiError('');
      } else {
        console.error('AI plan parse failure. Raw content:', content);
        setAiError('AI response was not valid JSON.');
        setAiPlan(null);
        setAiStatus('error');
      }
    } catch (err) {
      console.error('AI planner error', err);
      if (err.name === 'AbortError') {
        setAiError('AI request timed out. Please try again.');
      } else {
        setAiError('AI meal plan failed.');
      }
      setAiPlan(null);
      setAiStatus('error');
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="page-container recipes-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-icon" aria-hidden="true">🥗</span>
          Meal Recipes & AI Planner
        </h1>
        <p className="page-subtitle">Wholesome meals with quick prep, plus an AI-powered weekly plan.</p>
      </div>

      <div className="page-actions">
        <button
          className={`btn btn-secondary ${viewMode === 'library' ? 'active' : ''}`}
          onClick={() => setViewMode('library')}
        >
          <span aria-hidden="true">🔎</span>
          <span>Recipe Library</span>
        </button>
        <button
          className={`btn btn-secondary ${viewMode === 'favorites' ? 'active' : ''}`}
          onClick={() => setViewMode('favorites')}
        >
          <span aria-hidden="true">⭐</span>
          <span>Favorites</span>
        </button>
        <button
          className={`btn btn-secondary ${viewMode === 'planner' ? 'active' : ''}`}
          onClick={() => setViewMode('planner')}
        >
          <span aria-hidden="true">🧠</span>
          <span>AI Meal Planner</span>
        </button>
      </div>

      <div className="page-meta">
        {viewMode === 'library' && <p>Browse age-appropriate recipes and open any card to see ingredients and steps.</p>}
        {viewMode === 'favorites' && <p>Saved recipes live here for quick reuse.</p>}
        {viewMode === 'planner' && <p>Ask Perplexity for a 7-day plan tailored to your baby. We never store your key.</p>}
      </div>

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
                <div key={recipe.id} className="card recipe-card">
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
        <div className="section-card recipe-planner-card">
          <form className="ai-form" onSubmit={generateAiPlan}>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Baby age (months)</label>
                <input
                  className="form-input"
                  type="number"
                  min="6"
                  max="24"
                  value={aiForm.ageMonths}
                  onChange={(e) => setAiForm({ ...aiForm, ageMonths: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Texture preference</label>
                <select
                  className="form-input"
                  value={aiForm.texture}
                  onChange={(e) => setAiForm({ ...aiForm, texture: e.target.value })}
                >
                  <option value="purees/mashed">Purees / mashed</option>
                  <option value="mashed/soft-finger">Mashed / soft finger foods</option>
                  <option value="mixed textures">Mixed textures</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Meals per day</label>
                <select
                  className="form-input"
                  value={aiForm.mealsPerDay}
                  onChange={(e) => setAiForm({ ...aiForm, mealsPerDay: Number(e.target.value) })}
                >
                  <option value={3}>3 meals</option>
                  <option value={4}>4 small meals</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Allergens to avoid</label>
                <input
                  className="form-input"
                  placeholder="e.g., dairy, eggs"
                  value={aiForm.allergens}
                  onChange={(e) => setAiForm({ ...aiForm, allergens: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Dislikes or ingredients to skip</label>
                <input
                  className="form-input"
                  placeholder="e.g., spinach, citrus"
                  value={aiForm.dislikes}
                  onChange={(e) => setAiForm({ ...aiForm, dislikes: e.target.value })}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Special request (optional)</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Add timing, budget, or cultural preferences"
                value={aiForm.specialRequest}
                onChange={(e) => setAiForm({ ...aiForm, specialRequest: e.target.value })}
              />
            </div>

            <div className="ai-actions">
              <button className="btn btn-primary btn-large" type="submit" disabled={aiStatus === 'loading'}>
                <span aria-hidden="true">{aiStatus === 'loading' ? '⏳' : '✨'}</span>
                <span>{aiStatus === 'loading' ? 'Generating...' : 'Generate with AI'}</span>
              </button>
            </div>
            {aiError && <div className="alert alert-warning">{aiError}</div>}
          </form>

          {!aiPlan && (
            <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
              <div className="empty-icon" aria-hidden="true">*</div>
              <h3>No plan yet</h3>
              <p>Enter your preferences above and click Generate with AI to see a tailored plan.</p>
            </div>
          )}

          {aiPlan && (
            <div className="ai-plan-grid">
              {aiPlan.days?.map((day) => (
                <div key={day.day} className="card ai-day">
                  <div className="ai-day-header">
                    <span className="ai-day-label">{day.day}</span>
                    <span className="ai-day-tip">Daily safety: keep pieces soft, no honey or whole nuts.</span>
                  </div>
                  <div className="ai-meals">
                    {day.meals.map((meal, idx) => (
                      <div key={`${meal.name}-${idx}`} className="ai-meal">
                        <div className="ai-meal-title">
                          <span className="ai-meal-time">{meal.timeOfDay}</span>
                          <span>{meal.name}</span>
                        </div>
                        <div className="ai-meal-row"><strong>Portion:</strong> {meal.portionGrams} g</div>
                        <div className="ai-meal-row"><strong>Ingredients:</strong> {meal.ingredients.join(', ')}</div>
                        <div className="ai-meal-row"><strong>Prep:</strong> {meal.prep}</div>
                        <div className="ai-meal-row"><strong>Note:</strong> {meal.notes}</div>
                        <div className="ai-meal-row"><strong>Allergens:</strong> {meal.allergens.length ? meal.allergens.join(', ') : 'None noted'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {aiPlan?.summary && (
            <div className="card ai-summary">
              <h4>Weekly Summary</h4>
              <div className="ai-summary-grid">
                <div className="ai-pill">Calcium: {aiPlan.summary.calciumMg}</div>
                <div className="ai-pill">Iron: {aiPlan.summary.ironMg}</div>
                <div className="ai-pill">Protein: {aiPlan.summary.proteinG}</div>
                <div className="ai-pill">Fiber: {aiPlan.summary.fiberG}</div>
              </div>
              {aiPlan.summary.reminders && (
                <ul className="ai-reminders">
                  {aiPlan.summary.reminders.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="section-card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Feeding Guidelines</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-md)'
          }}
        >
          <div className="info-item">
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>6-8 Months</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Start with single-ingredient purees. Introduce iron-rich foods like meat and fortified cereals.
            </p>
          </div>
          <div className="info-item">
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>8-10 Months</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Introduce mashed and chopped foods. Baby can start self-feeding with soft finger foods.
            </p>
          </div>
          <div className="info-item">
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>10-12 Months</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Most table foods are OK. Continue breast milk or formula. Avoid honey, choking hazards.
            </p>
          </div>
        </div>
      </div>

      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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

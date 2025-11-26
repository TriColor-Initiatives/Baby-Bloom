import '../styles/pages.css';
import { useEffect, useMemo, useState } from 'react';
import { recipeLibrary } from '../data/recipes';
import CustomSelect from '../components/onboarding/CustomSelect';

const FAVORITES_KEY = 'baby-bloom-recipe-favorites';
const PLAN_KEY = 'baby-bloom-ai-plan';
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
  const [aiForm, setAiForm] = useState(() => ({
    ageMonths: getProfileAge(),
    allergens: 'dairy, eggs',
    dislikes: '',
    texture: 'purees/mashed',
    mealsPerDay: 3,
    specialRequest: 'Keep prep under 20 minutes and use pantry basics.'
  }));

  const textureOptions = [
    { value: 'purees/mashed', label: 'Purees / mashed' },
    { value: 'mashed/soft-finger', label: 'Mashed / soft finger foods' },
    { value: 'mixed textures', label: 'Mixed textures' }
  ];
  const mealsOptions = [
    { value: '3', label: '3 meals' },
    { value: '4', label: '4 small meals' }
  ];

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

  const tryParseJson = (value) => {
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

  const parsePlanContent = (text) => {
    if (!text) return null;

    // 1) direct parse
    const direct = tryParseJson(text.trim());
    if (direct) return direct;

    // 2) extract code block
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlock?.[1]) {
      const p = tryParseJson(codeBlock[1].trim());
      if (p) return p;
    }

    // 3) remove <think> blocks and try
    const withoutThoughts = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (withoutThoughts && withoutThoughts !== text) {
      const p = tryParseJson(withoutThoughts);
      if (p) return p;
    }

    // 4) Balanced-brace extraction (try larger slices first)
    const extracts = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== '{') continue;
      let depth = 0;
      for (let j = i; j < text.length; j++) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') depth -= 1;
        if (depth === 0) {
          extracts.push(text.slice(i, j + 1));
          break;
        }
      }
    }
    extracts.sort((a, b) => b.length - a.length);
    for (const ex of extracts) {
      const p = tryParseJson(ex);
      if (p) return p;
    }

    return null;
  };

  const extractResponseText = (data) => {
    // Normalize common Perplexity/OpenAI-like shapes to a single string
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

    // Perplexity older shape: answer -> array of segments
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

  const generateAiPlan = async (event) => {
    event.preventDefault();
    setAiStatus('loading');
    setAiError('');

    const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    if (!perplexityKey) {
      // Demo fallback
      setAiPlan({
        days: [
          {
            day: 'Day 1',
            meals: [
              {
                name: 'Avocado & Banana Puree',
                timeOfDay: 'Breakfast',
                ingredients: ['avocado', 'banana'],
                prep: 'Mash and thin with breastmilk or formula',
                portionGrams: 120,
                notes: 'Rich in healthy fats',
                allergens: []
              }
            ]
          }
        ],
        summary: { calciumMg: 100, ironMg: 2.5, proteinG: 12, fiberG: 8, reminders: ['Avoid honey', 'Check texture for choking hazards'] }
      });
      setAiStatus('ready');
      setAiError('Using demo plan — set VITE_PERPLEXITY_API_KEY to generate live plans.');
      return;
    }

    const systemMessage = {
      role: 'system',
      content:
        'You are a pediatric nutritionist. RESPOND WITH ONLY A SINGLE VALID JSON OBJECT AND NOTHING ELSE. Do not include markdown, code fences, prose, analysis, <think> tags, citations, URLs, or any surrounding text. The response MUST begin with "{" and end with "}" and be directly parseable by JavaScript JSON.parse. If you cannot produce valid JSON, reply with the exact string: ERROR_NON_JSON.\n\nJSON shape (must match): {"days":[{"day":"Day 1","meals":[{"name":"...","timeOfDay":"...","ingredients":["..."],"prep":"...","portionGrams":0,"notes":"...","allergens":["..."]}]}],"summary":{"calciumMg":0,"ironMg":0,"proteinG":0,"fiberG":0,"reminders":["..."]}}.\n\nKeep prep under 20 minutes; avoid honey and choking hazards.'
    };

    const userMessage = {
      role: 'user',
      content: `Baby age: ${aiForm.ageMonths} months\nAvoid: ${aiForm.allergens || 'none'}\nTexture: ${aiForm.texture}\nMeals per day: ${aiForm.mealsPerDay} + 1 snack if appropriate\nDislikes/notes: ${aiForm.dislikes || 'none'}\nSpecial request: ${aiForm.specialRequest || 'none'}\nOutput valid JSON only, no prose, markdown, or <think> content.`
    };

    const sendRequest = async (messages, signal) => {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${perplexityKey}`
        },
        body: JSON.stringify({
          model: 'sonar',
          messages,
          temperature: 0,
          max_tokens: 2000
        }),
        signal
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Perplexity 400 response body:', errText);
        throw new Error(`Perplexity error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const first = await sendRequest([systemMessage, userMessage], controller.signal);
      console.debug('Perplexity first response:', first);
      const firstText = extractResponseText(first);
      let parsed = parsePlanContent(firstText);

      // If parse failed, attempt one follow-up asking for strict JSON-only output
      if (!parsed) {
        console.warn('Initial parse failed, attempting follow-up. Raw firstText:', firstText);

        if (typeof firstText === 'string' && firstText.trim().startsWith('ERROR_NON_JSON')) {
          setAiError('Perplexity indicated it could not produce JSON (ERROR_NON_JSON).');
          setAiStatus('error');
          setAiPlan(null);
          return;
        }

        const followUpUser = {
          role: 'user',
          content: 'Previous response included analysis or metadata. NOW OUTPUT ONLY THE JSON OBJECT that matches the required shape and nothing else. If you cannot, reply with ERROR_NON_JSON. Output must begin with { and end with }.'
        };

        const second = await sendRequest([systemMessage, { role: 'assistant', content: firstText }, followUpUser], controller.signal);
        console.debug('Perplexity second response:', second);
        const secondText = extractResponseText(second);
        parsed = parsePlanContent(secondText);

        if (!parsed) {
          console.error('Follow-up parse failure. secondText:', secondText, 'first:', first);
          setAiError('Perplexity returned unexpected output — not valid JSON after retry.');
          setAiPlan(null);
          setAiStatus('error');
          return;
        }
      }

      setAiPlan(parsed);
      setAiStatus('ready');
      setAiError('');
    } catch (err) {
      console.error('AI planner error', err);
      if (err.name === 'AbortError') {
        setAiError('AI request timed out. Please try again.');
      } else {
        setAiError(`AI meal plan failed: ${err.message || String(err)}`);
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
        <div className="section-card recipe-planner-card">
          <form className="ai-form" onSubmit={generateAiPlan}>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Texture preference</label>
                <CustomSelect
                  value={aiForm.texture}
                  onChange={(val) => setAiForm({ ...aiForm, texture: val })}
                  options={textureOptions}
                  placeholder="Select texture"
                  className="small"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Meals per day</label>
                <CustomSelect
                  value={String(aiForm.mealsPerDay)}
                  onChange={(val) => setAiForm({ ...aiForm, mealsPerDay: Number(val) })}
                  options={mealsOptions}
                  placeholder="Select meals"
                  className="small"
                  required
                />
              </div>
            </div>

            <div className="ai-age-note">Using your saved baby age from profile.</div>

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

// pages/DashboardPage.jsx

import { useEffect, useRef, useState } from 'react';
import { mealdbAPI, ratingAPI, recipeAPI } from '../services/api';
import RecipeCard from '../components/RecipeCard.jsx';
import RecipeModal from '../components/RecipeModal.jsx';

const isPerfLogEnabled = () =>
  typeof window !== 'undefined' && window.__RECIPE_PERF_LOGS__ === true;

const logPerf = (label, startedAt, extra = '') => {
  if (!isPerfLogEnabled()) {
    return;
  }
  const elapsedMs = Math.round(performance.now() - startedAt);
  const suffix = extra ? ` ${extra}` : '';
  console.info(`[perf] ${label} ${elapsedMs}ms${suffix}`);
};

const RANDOM_TARGET_COUNT = 30;
const RANDOM_CACHE_KEY = 'dashboard:randomRecipes';

const fetchRandomWithRetry = async (attempts = 2, limit = RANDOM_TARGET_COUNT, dedupeKey) => {
  let lastError = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const recipes = await recipeAPI.getRandom(limit, { dedupeKey });
      if (Array.isArray(recipes) && recipes.length > 0) {
        return recipes;
      }
      lastError = new Error('No recipes returned');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Failed to fetch recipes');
};

export default function DashboardPage({
  favourites,
  onSave,
  onView,
  selectedMeal,
  onCloseModal,
  onRatingUpdated,
  resetTrigger
}) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  const activeRandomRequestRef = useRef(0);

  const savedMealIds = new Set(favourites.map(f => f.mealId));

  // 🔄 RESET DASHBOARD STATE
  useEffect(() => {
    if (resetTrigger > 0) {
      activeRandomRequestRef.current += 1;
      setQuery('');
      setSearchResults([]);
      setSearchStatus('idle');
    }
  }, [resetTrigger]);

  useEffect(() => {
    return () => {
      activeRandomRequestRef.current += 1;
    };
  }, []);

  const loadCachedRandomRecipes = () => {
    try {
      const raw = window.sessionStorage.getItem(RANDOM_CACHE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const cacheRandomRecipes = (recipes) => {
    try {
      window.sessionStorage.setItem(RANDOM_CACHE_KEY, JSON.stringify(recipes));
    } catch {
      // Ignore storage failures and continue with in-memory UI state.
    }
  };

  const startRandomLoad = async (perfLabel) => {
    const startedAt = performance.now();
    const requestId = activeRandomRequestRef.current + 1;
    activeRandomRequestRef.current = requestId;

    const cachedRecipes = loadCachedRandomRecipes();
    if (cachedRecipes.length > 0) {
      setSearchResults(cachedRecipes);
    } else {
      setSearchResults([]);
    }
    setSearchStatus('loading');

    try {
      const randomMeals = await fetchRandomWithRetry(3, RANDOM_TARGET_COUNT, `random:${requestId}`);
      if (activeRandomRequestRef.current !== requestId) {
        return;
      }

      setSearchResults(randomMeals);
      setSearchStatus('done');
      cacheRandomRecipes(randomMeals);
      logPerf(perfLabel, startedAt, `count=${randomMeals.length}`);
    } catch (error) {
      console.error('Failed to load random recipes:', error);
      if (activeRandomRequestRef.current !== requestId) {
        return;
      }

      if (cachedRecipes.length > 0) {
        setSearchResults(cachedRecipes);
        setSearchStatus('done');
        logPerf(`${perfLabel}.fallbackCache`, startedAt, `count=${cachedRecipes.length}`);
        return;
      }

      setSearchStatus('error');
      logPerf(`${perfLabel}.failed`, startedAt);
    }
  };

  // 🔥 Load homepage recipes once per mount/reset using cached API responses
  useEffect(() => {
    if (searchStatus === 'idle') {
      startRandomLoad('dashboard.random');
    }
  }, [searchStatus]);

  // 🔍 Search
  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    
    // If empty search, show random recipes (homepage)
    if (!q) {
      startRandomLoad('dashboard.random.fromEmptySearch');
      return;
    }

    activeRandomRequestRef.current += 1;
    const startedAt = performance.now();
    setSearchStatus('loading');
    setSearchResults([]);

    try {
      const meals = await mealdbAPI.search(q);
      const recipeIds = meals
        .map((meal) => meal.idMeal)
        .filter((id) => !!id);
      let ratingMap = {};
      try {
        ratingMap = await ratingAPI.getSummaries(recipeIds);
      } catch (ratingError) {
        console.error('Failed to fetch rating summaries:', ratingError);
      }

      const enriched = meals.map((meal) => {
        const summary = ratingMap[meal.idMeal];
        return {
          ...meal,
          averageRating: summary?.averageRating ?? 0,
          totalRatings: summary?.totalRatings ?? 0,
        };
      });

      setSearchResults(enriched);
      setSearchStatus('done');
      logPerf('dashboard.search', startedAt, `query="${q}" count=${enriched.length}`);
    } catch (error) {
      console.error('Failed to search recipes:', error);
      setSearchStatus('error');
      logPerf('dashboard.search.failed', startedAt, `query="${q}"`);
    }
  };

  // ❤️ Save
  const handleCardSave = async (meal) => {
    try {
      const payload = {
        mealId: meal.idMeal || meal.mealId,
        mealName: meal.strMeal || meal.mealName,
        mealThumb: meal.strMealThumb || meal.mealThumb,
        area: meal.strArea || meal.area || '',
        category: meal.strCategory || meal.category || ''
      };

      await onSave(payload);
      // ✅ Silent success - no blocking alert
    } catch (err) {
      console.error(err);
      // ✅ Silent failure - let parent component handle via state
    }
  };

  // 👁 View
  const handleCardView = async (meal) => {
    const payload = meal.mealId
      ? {
          idMeal: meal.mealId,
          strMeal: meal.mealName,
          strMealThumb: meal.mealThumb,
          strArea: meal.area || '',
          strCategory: meal.category || '',
        }
      : meal;

    await onView(payload);
  };

  // ⭐ Rating update
  const handleRatingUpdated = (recipeId, summary) => {
    setSearchResults((prev) =>
      prev.map((recipe) =>
        (recipe.idMeal || recipe.mealId) === recipeId
          ? {
              ...recipe,
              averageRating: summary.averageRating,
              totalRatings: summary.totalRatings,
            }
          : recipe
      )
    );

    onRatingUpdated(recipeId, summary);
  };

  return (
    <>
      {/* 🔥 Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h2>Explore Recipes</h2>
          <p>Discover, save, and rate your favorite recipes</p>

          <form className="search-wrapper" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="What are you craving?"
              className="searchBox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button type="submit" className="searchBtn">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </header>

      {/* 🔥 Recipes Section */}
      <main>
        <div className="recipe-container">

          {searchStatus === 'loading' && (
            <p className="search-status">
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Fetching recipes...
            </p>
          )}

          {searchStatus === 'error' && (
            <p className="search-status" style={{ color: 'var(--error)' }}>
              Error fetching recipes.
            </p>
          )}

          {searchStatus === 'done' && searchResults.length === 0 && (
            <p className="search-status">
              No recipes found for "{query}".
            </p>
          )}

          {searchResults.map((meal) => (
            <RecipeCard
              key={meal.idMeal || meal.mealId}
              meal={meal}
              onView={handleCardView}
              onSave={handleCardSave}
              alreadySaved={savedMealIds.has(meal.idMeal || meal.mealId)}
              onRatingUpdated={handleRatingUpdated}
            />
          ))}

        </div>
      </main>

      {/* 🔥 Modal */}
      {selectedMeal && (
        <RecipeModal meal={selectedMeal} onClose={onCloseModal} />
      )}
    </>
  );
}

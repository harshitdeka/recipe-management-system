// services/api.js
// Centralized API layer with one Axios instance and JWT interceptor.
import axios from "axios";

const BASE = 'http://localhost:8080/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const AUTH_EXPIRED_EVENT = 'auth:expired';

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const inFlightRequests = new Map();

const runWithInFlightDedup = async (key, fetcher) => {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing;
  }

  const pending = (async () => {
    try {
      return await fetcher();
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, pending);
  return pending;
};

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setSession: ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  tokenKey: TOKEN_KEY,
  userKey: USER_KEY,
  expiredEvent: AUTH_EXPIRED_EVENT,
};

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getError = (error, fallbackMessage) => {
  const details = error?.response?.data?.details
    ? Object.values(error.response.data.details)[0]
    : null;
  const message =
    details ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;
  return new Error(message);
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';
    const hasSession = !!authStorage.getToken();
    const isAuthRoute = requestUrl.includes('/auth/');

    if (status === 401 && hasSession && !isAuthRoute) {
      authStorage.clearSession();
      window.dispatchEvent(new Event(authStorage.expiredEvent));
    }
    return Promise.reject(error);
  }
);

// ── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  /** Register a new user. Returns { token, userId, username, email } */
  signup: async (data) => {
    try {
      const res = await apiClient.post('/auth/signup', data);
      return res.data;
    } catch (error) {
      throw getError(error, 'Signup failed');
    }
  },

  /** Login. Returns { token, userId, username, email } */
  login: async (data) => {
    try {
      const usernameOrEmail = data?.usernameOrEmail ?? data?.email ?? '';
      const res = await apiClient.post('/auth/login', {
        usernameOrEmail,
        password: data?.password ?? '',
      });
      return res.data;
    } catch (error) {
      throw getError(error, 'Login failed');
    }
  },
};

// ── Recipe API ──────────────────────────────────────────────────────────────
export const recipeAPI = {
  getRandom: async (limit = 30, options = {}) =>
    runWithInFlightDedup(options.dedupeKey ?? `random:${limit}`, async () => {
      try {
        const res = await apiClient.get('/recipes/random', { params: { limit } });
        if (!Array.isArray(res.data)) {
          throw new Error('Invalid random recipe response');
        }
        return res.data;
      } catch (error) {
        throw getError(error, 'Failed to fetch random recipes');
      }
    }),
};

export const ratingAPI = {
  add: async (recipeId, rating) => {
    try {
      const res = await apiClient.post('/ratings', { recipeId, rating });
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to rate recipe');
    }
  },
  getAverage: async (recipeId) => {
    try {
      const res = await apiClient.get(`/ratings/${recipeId}`);
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to fetch rating');
    }
  },
  getSummaries: async (recipeIds = []) => {
    if (!recipeIds.length) {
      return {};
    }

    try {
      const params = new URLSearchParams();
      recipeIds.forEach((id) => params.append('recipeIds', id));
      const res = await apiClient.get(`/ratings/summary?${params.toString()}`);
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to fetch rating summaries');
    }
  },
};

export const profileAPI = {
  get: async () => {
    try {
      const res = await apiClient.get('/profile');
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to fetch profile');
    }
  },
};

export const reviewAPI = {
  add: async ({ recipeId, comment }) => {
    try {
      const res = await apiClient.post('/reviews', { recipeId, comment });
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to add review');
    }
  },
  getByRecipeId: async (recipeId) => {
    try {
      const res = await apiClient.get(`/reviews/${recipeId}`);
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to fetch reviews');
    }
  },
};

export const recentViewAPI = {
  add: async (recipeId) => {
    try {
      const res = await apiClient.post('/recent-views', { recipeId });
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to save recent view');
    }
  },
  getAll: async (limit = 5) => {
    try {
      const res = await apiClient.get('/recent-views', { params: { limit } });
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to fetch recent views');
    }
  },
};

export const favoriteAPI = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/favorites');
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to fetch favorites');
    }
  },
  save: async (recipe) => {
    try {
      const res = await apiClient.post('/favorites', recipe);
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to save favorite');
    }
  },
  remove: async (mealId) => {
    try {
      const res = await apiClient.delete(`/favorites/${mealId}`);
      return res.data;
    } catch (error) {
      throw getError(error, 'Failed to remove favorite');
    }
  },
};

// ── MealDB External API ─────────────────────────────────────────────────────
const fetchJsonWithTimeout = async (url, fallbackMessage, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(fallbackMessage);
    }
    return await res.json();
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const mealdbAPI = {
  /** Search recipes by name using the free MealDB API */
  search: async (query) => {
    return runWithInFlightDedup(`search:${query.trim().toLowerCase()}`, async () => {
      const data = await fetchJsonWithTimeout(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
        'Failed to fetch recipes from MealDB'
      );
      return data.meals || [];
    });
  },

  /** Get full recipe details by meal ID */
  getById: async (id) => {
    return runWithInFlightDedup(`meal:${id}`, async () => {
      const data = await fetchJsonWithTimeout(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
        'Failed to fetch recipe details'
      );
      return data.meals ? data.meals[0] : null;
    });
  },
};

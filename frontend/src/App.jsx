// App.jsx

import { useAuth } from './hooks/useAuth.js';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Navbar from './components/Navbar.jsx';

import { useEffect, useState } from 'react';
import { favoriteAPI, mealdbAPI, recentViewAPI } from './services/api.js';

export default function App() {
  const { user, loading, isLoggedIn, login, logout } = useAuth();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [favourites, setFavourites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [dashboardResetTrigger, setDashboardResetTrigger] = useState(0);

  // 🔥 Load favourites + random recipes
  useEffect(() => {
    if (!isLoggedIn) {
      setFavourites([]);
      setFavLoading(false);
      return;
    }

    const fetchData = async () => {
      setFavLoading(true);
      try {
        const favoritesData = await favoriteAPI.getAll();
        setFavourites(favoritesData);
      } catch (err) {
        console.error(err);
        setFavourites([]);
      } finally {
        setFavLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  // ❤️ SAVE
  const handleSave = async (meal) => {
    try {
      const payload = {
        mealId: meal.idMeal || meal.mealId,
        mealName: meal.strMeal || meal.mealName,
        mealThumb: meal.strMealThumb || meal.mealThumb,
        area: meal.strArea || meal.area || '',
        category: meal.strCategory || meal.category || '',
      };

      // ❗ prevent duplicate
      if (favourites.some((f) => f.mealId === payload.mealId)) {
        console.log('Already in favourites');
        return;
      }

      const saved = await favoriteAPI.save(payload);

      // ✅ update UI instantly
      setFavourites((prev) => [saved, ...prev]);
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  // ❌ REMOVE
  const handleRemove = async (mealId) => {
    try {
      await favoriteAPI.remove(mealId);

      setFavourites((prev) => prev.filter((r) => r.mealId !== mealId));
    } catch (error) {
      console.error('Error removing recipe:', error);
    }
  };

  // 👁 VIEW
  const handleView = async (meal) => {
    const recipeId = meal.idMeal || meal.mealId;
    if (recipeId) {
      try {
        await recentViewAPI.add(recipeId);
      } catch (error) {
        console.error(error);
      }
    }

    if (meal.strInstructions) {
      setSelectedMeal(meal);
      return;
    }

    try {
      const full = await mealdbAPI.getById(recipeId);
      setSelectedMeal(full || meal);
    } catch {
      setSelectedMeal(meal);
    }
  };

  // ⭐ UPDATE RATING
  const updateRecipeRating = (mealId, summary) => {
    setFavourites((prev) =>
      prev.map((recipe) =>
        recipe.mealId === mealId
          ? {
              ...recipe,
              averageRating: summary.averageRating,
              totalRatings: summary.totalRatings,
            }
          : recipe
      )
    );
  };

  // 🔄 RESET DASHBOARD
  const resetDashboard = () => {
    setSelectedMeal(null);
    setDashboardResetTrigger((prev) => prev + 1);
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif',
          color: '#666',
          fontSize: '1rem',
        }}
      >
        <i
          className="fas fa-spinner fa-spin"
          style={{ marginRight: '10px' }}
        ></i>
        Loading...
      </div>
    );
  }

  // 🔐 Not logged in
  if (!isLoggedIn) {
    return <AuthPage onLogin={login} />;
  }

  // ✅ MAIN UI
  return (
    <>
      <Navbar
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onResetDashboard={resetDashboard}
        onLogout={logout}
      />

      {currentPage === 'dashboard' && (
        <DashboardPage
          key={dashboardResetTrigger}
          resetTrigger={dashboardResetTrigger}
          favourites={favourites}
          onSave={handleSave}
          onView={handleView}
          selectedMeal={selectedMeal}
          onCloseModal={() => setSelectedMeal(null)}
          onRatingUpdated={updateRecipeRating}
        />
      )}

      {currentPage === 'favorites' && (
        <FavoritesPage
          favourites={favourites}
          loading={favLoading}
          onView={handleView}
          onRemove={handleRemove}
          onRatingUpdated={updateRecipeRating}
        />
      )}

      {currentPage === 'profile' && <ProfilePage />}
    </>
  );
}

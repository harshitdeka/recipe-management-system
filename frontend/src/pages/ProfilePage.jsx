import { useEffect, useState } from 'react';
import { mealdbAPI, profileAPI, recentViewAPI } from '../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [recentViews, setRecentViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, views] = await Promise.all([
          profileAPI.get(),
          recentViewAPI.getAll(5),
        ]);
        setProfile(profileData);
        setLoading(false);

        const enriched = await Promise.all(
          views.map(async (view) => {
            try {
              const meal = await mealdbAPI.getById(view.recipeId);
              return {
                recipeId: view.recipeId,
                viewedAt: view.viewedAt,
                name: meal?.strMeal || view.recipeId,
                image: meal?.strMealThumb || '',
              };
            } catch {
              return {
                recipeId: view.recipeId,
                viewedAt: view.viewedAt,
                name: view.recipeId,
                image: '',
              };
            }
          })
        );
        setRecentViews(enriched);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setRecentLoading(false);
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <main className="page-container">
        <p className="search-status">Loading profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <p className="search-status" style={{ color: 'var(--error)' }}>{error}</p>
      </main>
    );
  }

  return (
    <main className="page-container">
      <section className="profile-card">
        <h2>My Profile</h2>
        <div className="profile-metrics-grid">
          <div className="profile-metric-card">
            <p className="profile-metric-label">Username</p>
            <p className="profile-metric-value">{profile.username}</p>
          </div>
          <div className="profile-metric-card">
            <p className="profile-metric-label">Email</p>
            <p className="profile-metric-value">{profile.email}</p>
          </div>
          <div className="profile-metric-card">
            <p className="profile-metric-label">Total Favorites</p>
            <p className="profile-metric-value">{profile.totalFavorites ?? profile.favoriteRecipes?.length ?? 0}</p>
          </div>
          <div className="profile-metric-card">
            <p className="profile-metric-label">Total Ratings Given</p>
            <p className="profile-metric-value">{profile.totalRatingsGiven ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="profile-card recent-card">
        <h3>Recently Viewed Recipes</h3>
        {recentLoading ? (
          <p className="no-favourites-msg">Loading recently viewed recipes...</p>
        ) : recentViews.length === 0 ? (
          <p className="no-favourites-msg">No recent views yet.</p>
        ) : (
          <div className="recent-view-grid">
            {recentViews.map((item) => (
              <article key={`${item.recipeId}-${item.viewedAt}`} className="recent-view-item">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="recent-view-placeholder">No image</div>
                )}
                <div>
                  <p className="recent-view-title">{item.name}</p>
                  <p className="recent-view-time">{new Date(item.viewedAt).toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

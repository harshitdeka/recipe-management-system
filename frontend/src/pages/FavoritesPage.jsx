import FavouriteCard from '../components/FavouriteCard.jsx';

export default function FavoritesPage({ favourites, loading, onView, onRemove, onRatingUpdated }) {
  return (
    <main className="page-container">
      <section className="favourites-section">
        <h2 className="section-title">
          <i className="fas fa-heart"></i>
          My Favourites
        </h2>

        {loading ? (
          <p className="no-favourites-msg">
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
            Loading your favourites...
          </p>
        ) : (
          <div className="favourites-container">
            {favourites.length === 0 ? (
              <p className="no-favourites-msg">No favourites saved yet.</p>
            ) : (
              favourites.map((recipe) => (
                <FavouriteCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={onView}
                  onRemove={onRemove}
                  onRatingUpdated={onRatingUpdated}
                />
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}

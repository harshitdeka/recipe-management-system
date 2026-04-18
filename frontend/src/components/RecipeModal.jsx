import { useEffect, useState } from 'react';
import { reviewAPI } from '../services/api';

export default function RecipeModal({ meal, onClose }) {
  if (!meal) return null;
  const recipeId = meal.idMeal || meal.mealId;
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;
    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        const data = await reviewAPI.getByRecipeId(recipeId);
        if (active) setReviews(data);
      } catch {
        if (active) setReviews([]);
      } finally {
        if (active) setLoadingReviews(false);
      }
    };
    loadReviews();
    return () => {
      active = false;
    };
  }, [recipeId]);

  // Extract ingredients (MealDB stores them as strIngredient1..20 + strMeasure1..20)
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure    = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const comment = reviewText.trim();
    if (!comment) return;
    setSubmittingReview(true);
    try {
      const saved = await reviewAPI.add({ recipeId, comment });
      setReviews((prev) => [saved, ...prev]);
      setReviewText('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="recipe-details-overlay open" onClick={(e) => {
      if (e.target.classList.contains('recipe-details-overlay')) onClose();
    }}>
      <div className="recipe-details">
        <button className="recipe-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="recipe-details-content">
          <h2 className="recipeName">{meal.strMeal || meal.mealName}</h2>

          {(meal.strMealThumb || meal.mealThumb) && (
            <img
              src={meal.strMealThumb || meal.mealThumb}
              alt={meal.strMeal || meal.mealName}
              style={{ width: '100%', borderRadius: '12px', marginBottom: '20px', maxHeight: '300px', objectFit: 'cover' }}
            />
          )}

          <h3 style={{ marginBottom: '10px', color: '#333' }}>Ingredients</h3>
          <ul className="ingredientsList">
            {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>

          <h3 style={{ marginBottom: '10px', color: '#333' }}>Instructions</h3>
          <div className="recipeInstructions">
            <p>{meal.strInstructions || 'Instructions are not available for this recipe.'}</p>
          </div>

          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className="video-btn"
            >
              <i className="fab fa-youtube" style={{ marginRight: '8px' }}></i>
              Watch on YouTube
            </a>
          )}

          <section className="reviews-section">
            <h3>User Reviews</h3>

            <form className="review-form" onSubmit={handleSubmitReview}>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..."
                rows={3}
              />
              <button type="submit" className="view-btn" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>

            {loadingReviews ? (
              <p className="no-favourites-msg">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="no-favourites-msg">No reviews yet.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <p className="review-comment">{review.comment}</p>
                    <p className="review-meta">
                      by <strong>{review.username}</strong> • {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

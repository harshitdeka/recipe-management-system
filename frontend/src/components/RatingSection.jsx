import { useState } from 'react';
import { ratingAPI } from '../services/api';
import StarRating from './StarRating.jsx';

export default function RatingSection({ recipe, onRatingUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const recipeId = recipe.idMeal || recipe.mealId;

  const handleRate = async (value) => {
    setSubmitting(true);
    try {
      const updated = await ratingAPI.add(recipeId, value);
      onRatingUpdated(recipeId, updated);
    } catch (error) {
      console.error('Error submitting rating:', error);
      // ✅ Silent failure - prevent blocking UI
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-section">
      <p className="rating-summary">
        Average rating: <strong>{(recipe.averageRating || 0).toFixed(1)}</strong> ({recipe.totalRatings || 0} ratings)
      </p>
      <StarRating value={Math.round(recipe.averageRating || 0)} onRate={handleRate} disabled={submitting} />
    </div>
  );
}

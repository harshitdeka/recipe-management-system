// components/FavouriteCard.jsx
// Displays a saved recipe card with a Remove button
import RatingSection from './RatingSection.jsx';

export default function FavouriteCard({ recipe, onView, onRemove, onRatingUpdated }) {
  const handleView = () => {
    // Build a minimal meal object for the modal from saved data
    onView({
      idMeal:       recipe.mealId,
      strMeal:      recipe.mealName,
      strMealThumb: recipe.mealThumb,
      strArea:      recipe.area,
      strCategory:  recipe.category,
    });
  };

  return (
    <div className="recipe">
      <img src={recipe.mealThumb} alt={recipe.mealName} />
      <div className="recipe-content">
        <h3>{recipe.mealName}</h3>
        <p>{recipe.area} Cuisine</p>
        <p>{recipe.category}</p>
        <button className="view-btn" style={{ marginTop: '15px' }} onClick={handleView}>
          View Recipe
        </button>
        <RatingSection recipe={recipe} onRatingUpdated={onRatingUpdated} />
        <button
          className="remove-btn"
          onClick={() => onRemove(recipe.mealId)}
        >
          <i className="fas fa-trash" style={{ marginRight: '6px' }}></i>
          Remove
        </button>
      </div>
    </div>
  );
}

// components/RecipeCard.jsx
// Displays a single search result card with View and Save buttons
import RatingSection from './RatingSection.jsx';

export default function RecipeCard({ meal, onView, onSave, alreadySaved, onRatingUpdated }) {
  const mealName = meal.strMeal || meal.mealName;
  const mealThumb = meal.strMealThumb || meal.mealThumb;
  const area = meal.strArea || meal.area || '';
  const category = meal.strCategory || meal.category || '';

  return (
    <div className="recipe">
      <img src={mealThumb} alt={mealName} />
      <div className="recipe-content">
        <h3>{mealName}</h3>
        <p>{area} Cuisine</p>
        <p>{category}</p>
        <RatingSection recipe={meal} onRatingUpdated={onRatingUpdated} />
        <div className="btn-group">
          <button className="view-btn" onClick={() => onView(meal)}>
            View Recipe
          </button>
          <button
            className={`fav-btn ${alreadySaved ? 'saved' : ''}`}
            title={alreadySaved ? 'Already in favourites' : 'Save to favourites'}
            onClick={() => !alreadySaved && onSave(meal)}
            disabled={alreadySaved}
          >
            <i className={`fas fa-heart`}></i>
          </button>
        </div>
      </div>
    </div>
  );
}

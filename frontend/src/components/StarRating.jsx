import { useMemo } from 'react';

export default function StarRating({ value = 0, onRate, disabled = false }) {
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <div className="star-rating">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= value ? 'filled' : ''}`}
          onClick={() => !disabled && onRate(star)}
          disabled={disabled}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

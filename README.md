# Recipe Management System — Full Stack

Upgraded from the original Node.js + MongoDB project to:
- **Backend:** Spring Boot (Java 17) + MySQL + JWT Authentication
- **Frontend:** React (Vite) with user-based recipe management

---

## Project Structure

```
recipe-management-system/
├── backend/                  ← Spring Boot project
│   ├── pom.xml
│   └── src/main/java/com/recipe/
│       ├── RecipeApplication.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── RecipeController.java
│       │   ├── RatingController.java
│       │   ├── ProfileController.java
│       │   ├── ReviewController.java
│       │   └── RecentViewController.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── RecipeService.java
│       │   ├── RatingService.java
│       │   ├── ProfileService.java
│       │   ├── ReviewService.java
│       │   └── RecentViewService.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── RecipeRepository.java
│       │   ├── RatingRepository.java
│       │   ├── ReviewRepository.java
│       │   └── RecentViewRepository.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Recipe.java
│       │   ├── Rating.java
│       │   ├── Review.java
│       │   └── RecentView.java
│       ├── dto/
│       │   ├── SignupRequest.java
│       │   ├── LoginRequest.java
│       │   ├── AuthResponse.java
│       │   ├── RecipeRequest.java
│       │   ├── RecipeResponse.java
│       │   ├── RatingCreateRequest.java
│       │   ├── RecipeRatingSummaryResponse.java
│       │   ├── ReviewCreateRequest.java
│       │   ├── ReviewResponse.java
│       │   ├── RecentViewRequest.java
│       │   ├── RecentViewResponse.java
│       │   └── ProfileResponse.java
│       └── security/
│           ├── JwtUtil.java
│           ├── JwtFilter.java
│           └── SecurityConfig.java
│
└── frontend/                 ← React (Vite) project
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── hooks/
        │   └── useAuth.js
        ├── services/
        │   └── api.js
        ├── components/
        │   ├── LoginForm.jsx
        │   ├── SignupForm.jsx
        │   ├── Navbar.jsx
        │   ├── RecipeCard.jsx
        │   ├── FavouriteCard.jsx
        │   ├── StarRating.jsx
        │   ├── RatingSection.jsx
        │   └── RecipeModal.jsx
        └── pages/
            ├── AuthPage.jsx
            ├── DashboardPage.jsx
            ├── FavoritesPage.jsx
            └── ProfilePage.jsx
```

---

## Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8+
- Node.js 18+

---

## Step 1 — Set up MySQL

```sql
CREATE DATABASE recipedb;
```

> Hibernate will auto-create the `users` and `recipes` tables on first run.

---

## Step 2 — Configure the Backend

Open `backend/src/main/resources/application.properties` and update:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

The JWT secret is already set to a long default value. Change it for production.

---

## Step 3 — Run the Backend

```bash
cd backend
mvn spring-boot:run
```

You should see:
```
Started RecipeApplication in X seconds
Tomcat started on port(s): 8080
```

---

## Step 4 — Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## API Endpoints

### Auth (public)

| Method | URL                  | Body                              | Response                          |
|--------|----------------------|-----------------------------------|-----------------------------------|
| POST   | /api/auth/signup     | { username, email, password }     | { token, userId, username, email }|
| POST   | /api/auth/login      | { email, password }               | { token, userId, username, email }|

### Recipes (protected — requires `Authorization: Bearer <token>` header)

| Method | URL                       | Body / Params                          | Response               |
|--------|---------------------------|----------------------------------------|------------------------|
| GET    | /api/recipes              | —                                      | Array of user favorites (includes `averageRating`, `totalRatings`) |
| GET    | /api/recipes/random       | query: `limit` (optional)              | Random MealDB recipes enriched with DB ratings |
| POST   | /api/recipes              | { mealId, mealName, mealThumb, ... }   | Saved recipe object    |
| DELETE | /api/recipes/{mealId}     | mealId in URL path                     | { message: "..." }     |

### Favorites (protected)

| Method | URL                         | Body / Params                        | Response               |
|--------|-----------------------------|--------------------------------------|------------------------|
| GET    | /api/favorites              | —                                    | Same as `GET /api/recipes` (user favorites list) |
| POST   | /api/favorites              | { mealId, mealName, mealThumb, ... } | Same as `POST /api/recipes` |
| DELETE | /api/favorites/{mealId}     | mealId in URL path                   | { message: "..." }     |

### Ratings (protected)

| Method | URL                 | Body                                 | Response |
|--------|---------------------|--------------------------------------|----------|
| POST   | /api/ratings        | { "recipeId": "52772", "rating": 4 } | { recipeId, averageRating, totalRatings } |
| GET    | /api/ratings/{idMeal} | —                                  | { recipeId, averageRating, totalRatings } |

### Reviews (protected)

| Method | URL                   | Body                                    | Response |
|--------|-----------------------|-----------------------------------------|----------|
| POST   | /api/reviews          | { "recipeId": "52772", "comment": "..." } | Review object |
| GET    | /api/reviews/{idMeal} | —                                       | Array of review objects |

### Recent Views (protected)

| Method | URL               | Body                       | Response |
|--------|-------------------|----------------------------|----------|
| POST   | /api/recent-views | { "recipeId": "52772" }    | Recent view object |
| GET    | /api/recent-views | query: `limit` (default 5) | Last viewed recipes list |

### Profile (protected)

| Method | URL          | Response |
|--------|--------------|----------|
| GET    | /api/profile | { userId, username, email, totalFavorites, totalRatingsGiven, favoriteRecipes } |

---

## How Authentication Works

1. User signs up → password hashed with BCrypt → JWT issued
2. User logs in → password verified → JWT issued
3. JWT stored in `localStorage` using key `token` on the frontend
4. Frontend uses a single Axios instance (`src/services/api.js`) with a request interceptor that automatically adds `Authorization: Bearer <token>` to protected API calls
5. `JwtFilter` validates the token on every request
6. Recipe data is always scoped to the authenticated user

---

## Validation and Error Responses

- Request DTO validation uses `@NotBlank`, `@Email`, and size constraints.
- Errors are handled by a global `@RestControllerAdvice`.
- Common error format:

```json
{
  "error": "Validation failed",
  "details": {
    "email": "Must be a valid email address"
  }
}
```

Other API errors return:

```json
{
  "error": "Invalid email or password"
}
```

---

## Features

- User signup and login with JWT authentication
- Secure password hashing (BCrypt)
- Per-user recipe storage (each user sees only their own saved recipes)
- Recipe ratings (1–5 stars) for all recipes using MealDB `idMeal`
- User reviews per recipe
- Recent recipe view tracking
- Profile page with user details and recipe lists
- Navbar hamburger dropdown (Profile, Favorites, Logout)
- Home page auto-loads random MealDB recipes
- Search replaces random feed with search results
- Search recipes using the free MealDB API
- Save favourite recipes (linked to your account)
- View full recipe details in a modal (ingredients + instructions + YouTube link)
- Remove saved recipes
- Frontend + backend validation
- Session persists across page refreshes

---

## Testing the API (without frontend)

Use Postman or curl:

```bash
# Sign up
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"secret123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret123"}'

# Save a recipe (replace TOKEN with the token from login response)
curl -X POST http://localhost:8080/api/recipes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mealId":"52772","mealName":"Teriyaki Chicken","mealThumb":"https://...","area":"Japanese","category":"Chicken"}'

# Get saved recipes
curl http://localhost:8080/api/recipes \
  -H "Authorization: Bearer TOKEN"

# Delete a recipe
curl -X DELETE http://localhost:8080/api/recipes/52772 \
  -H "Authorization: Bearer TOKEN"
```

---

## Final MySQL Schema

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME(6)
);

CREATE TABLE recipes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  meal_id VARCHAR(255) NOT NULL,
  meal_name VARCHAR(255) NOT NULL,
  meal_thumb TEXT,
  area VARCHAR(255),
  category VARCHAR(255),
  saved_at DATETIME(6),
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_recipes_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uk_recipes_meal_user UNIQUE (meal_id, user_id)
);

CREATE TABLE ratings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  recipe_id VARCHAR(50) NOT NULL,
  rating INT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uk_ratings_user_recipe UNIQUE (user_id, recipe_id),
  INDEX idx_ratings_recipe_id (recipe_id),
  CONSTRAINT chk_ratings_range CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  recipe_id VARCHAR(50) NOT NULL,
  comment VARCHAR(1000) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_reviews_recipe_id (recipe_id)
);

CREATE TABLE recent_views (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  recipe_id VARCHAR(50) NOT NULL,
  viewed_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_recent_views_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_recent_views_user_viewed_at (user_id, viewed_at)
);
```

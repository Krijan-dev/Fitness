# MealPrep Pro — Complete Project Specification

## 1. Project Overview

Build a modern, responsive web application called **MealPrep Pro**.

MealPrep Pro helps users:

* Calculate calories and macronutrients for homemade meals.
* Calculate nutrition using raw ingredient quantities.
* Recalculate nutrition based on total cooked weight.
* Calculate calories and macros for any serving size.
* Save and manage personal recipes.
* Discover new recipes from external recipe providers.
* Add recipes to a weekly meal planner.
* Track daily calories and macros.
* Generate shopping lists from recipes.
* Compare supermarket prices based on the user's selected location.
* Calculate the cheapest supermarket basket.
* Track pantry ingredients.
* Calculate recipe costs and cost per serving.
* Track body weight, waist measurements and progress.

The initial version must work without:

* User accounts.
* Email login.
* Authentication.
* A database.
* Artificial intelligence.

All user-created information must initially be stored in the browser using `localStorage`.

The architecture must make it easy to add Supabase, authentication and additional APIs later.

---

# 2. Required Technology Stack

Use the following technologies:

* React
* Next.js
* TypeScript
* TSX
* Next.js App Router
* Tailwind CSS
* Zustand
* Recharts
* Lucide React
* npm

Use Next.js built-in routing.

Do not install React Router.

Use npm as the package manager.

The development server must run using:

```bash
npm run dev
```

The production build must run using:

```bash
npm run build
```

Do not use:

* Vite
* Create React App
* Java
* PHP
* Firebase
* Supabase in the initial version
* Authentication in the initial version
* AI features in the initial version

---

# 3. Initial Project Command

The project should be compatible with a project created using:

```bash
npx create-next-app@latest mealprep-pro --typescript --tailwind --eslint --app --src-dir --use-npm
```

Then run:

```bash
cd mealprep-pro
npm install
npm run dev
```

The application should normally be available at:

```text
http://localhost:3000
```

---

# 4. Application Architecture

Use a clean, scalable, feature-based architecture.

Recommended structure:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── dashboard/
│   │   └── page.tsx
│   ├── meal-calculator/
│   │   └── page.tsx
│   ├── recipes/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── discover/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── meal-planner/
│   │   └── page.tsx
│   ├── daily-tracker/
│   │   └── page.tsx
│   ├── shopping-list/
│   │   └── page.tsx
│   ├── price-comparison/
│   │   └── page.tsx
│   ├── pantry/
│   │   └── page.tsx
│   ├── weight-tracker/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── api/
│       ├── recipes/
│       │   └── route.ts
│       └── prices/
│           └── route.ts
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── TopBar.tsx
│   │   └── PageHeader.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── SearchInput.tsx
│   │   ├── ProgressBar.tsx
│   │   └── StatCard.tsx
│   ├── meals/
│   ├── recipes/
│   ├── shopping/
│   ├── prices/
│   ├── pantry/
│   ├── tracking/
│   └── charts/
│
├── features/
│   ├── dashboard/
│   ├── meal-calculator/
│   ├── recipes/
│   ├── recipe-discovery/
│   ├── meal-planner/
│   ├── daily-tracker/
│   ├── shopping-list/
│   ├── price-comparison/
│   ├── pantry/
│   ├── weight-tracker/
│   └── settings/
│
├── services/
│   ├── storage/
│   │   ├── storage.interface.ts
│   │   ├── localStorage.service.ts
│   │   └── storage.keys.ts
│   ├── recipes/
│   │   ├── recipe-provider.interface.ts
│   │   ├── local-recipe.provider.ts
│   │   ├── mock-recipe.provider.ts
│   │   └── external-recipe.provider.ts
│   ├── prices/
│   │   ├── price-provider.interface.ts
│   │   ├── mock-price.provider.ts
│   │   ├── coles.provider.ts
│   │   ├── woolworths.provider.ts
│   │   ├── aldi.provider.ts
│   │   └── price-comparison.service.ts
│   └── nutrition/
│       └── nutrition-calculator.service.ts
│
├── stores/
│   ├── recipe.store.ts
│   ├── daily-tracker.store.ts
│   ├── shopping-list.store.ts
│   ├── pantry.store.ts
│   ├── meal-planner.store.ts
│   ├── weight.store.ts
│   └── settings.store.ts
│
├── types/
│   ├── ingredient.ts
│   ├── nutrition.ts
│   ├── recipe.ts
│   ├── meal.ts
│   ├── shopping.ts
│   ├── price.ts
│   ├── pantry.ts
│   ├── weight.ts
│   ├── settings.ts
│   └── common.ts
│
├── data/
│   ├── ingredients.json
│   ├── mock-recipes.json
│   ├── mock-prices.json
│   └── australian-locations.json
│
├── hooks/
│   ├── useHydration.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
│
└── utils/
    ├── calculations.ts
    ├── currency.ts
    ├── date.ts
    ├── validation.ts
    ├── units.ts
    ├── ids.ts
    └── constants.ts
```

The exact structure may be adjusted when there is a strong architectural reason, but features must remain separated and reusable.

---

# 5. General Development Rules

The application must use:

* Strict TypeScript.
* Reusable components.
* Strongly typed interfaces.
* Feature-based modules.
* Clear naming conventions.
* Proper error handling.
* Input validation.
* Responsive design.
* Accessible form labels.
* Keyboard navigation.
* Loading states.
* Error states.
* Empty states.
* Confirmation before destructive actions.

Avoid:

* Duplicated calculation logic.
* Duplicated components.
* Direct `localStorage` access inside UI components.
* Very large page components.
* Hardcoded data inside components.
* Using `any` unless absolutely necessary.
* Mixing API logic directly into UI components.

All calculations should be placed inside reusable service or utility functions.

---

# 6. Storage Architecture

The first version uses browser `localStorage`.

Create a storage interface such as:

```ts
export interface StorageService {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}
```

Create a `LocalStorageService` implementation.

UI components must never call:

```ts
localStorage.getItem()
localStorage.setItem()
```

directly.

All storage access must go through:

* Zustand stores.
* Repository functions.
* Storage services.

The structure must later allow replacement with:

* Supabase.
* PostgreSQL.
* Cloud storage.
* Authenticated user storage.

---

# 7. Application Theme and Design

Create a premium fitness and nutrition dashboard.

Default theme:

* Dark mode.
* Modern.
* Minimal.
* Spacious.
* Professional.
* Rounded cards.
* Clear typography.
* Subtle borders.
* Soft shadows.
* Smooth hover effects.
* Large touch-friendly controls.

The UI must work well on:

* Mobile phones.
* Tablets.
* Laptops.
* Desktop screens.

Desktop layout:

* Fixed or sticky sidebar.
* Top navigation bar.
* Main content area.
* Clear page title and actions.

Mobile layout:

* Compact top bar.
* Bottom navigation or collapsible menu.
* Full-width cards.
* Large inputs.
* No horizontal overflow.

Use consistent spacing, border radius and typography.

---

# 8. Main Navigation

Create navigation links for:

1. Dashboard
2. Meal Calculator
3. My Recipes
4. Discover Recipes
5. Meal Planner
6. Daily Tracker
7. Shopping List
8. Price Comparison
9. Pantry
10. Weight Tracker
11. Settings

Show an icon beside each navigation item using Lucide React.

The active route must be visually highlighted.

---

# 9. Dashboard Page

The dashboard should provide a summary of the user's current information.

Display:

* Today's calories.
* Daily calorie goal.
* Calories remaining.
* Protein consumed.
* Protein goal.
* Carbohydrates consumed.
* Fat consumed.
* Current weight.
* Target weight.
* Weekly weight change.
* Meals logged today.
* Number of saved recipes.
* Shopping list item count.
* Pantry low-stock alerts.
* Weekly grocery cost estimate.

Add quick action buttons:

* Calculate Meal.
* Add Recipe.
* Log Meal.
* Add Shopping Item.
* Log Weight.
* Discover Recipes.

Add dashboard sections:

* Today's nutrition progress.
* Recent recipes.
* Planned meals.
* Shopping summary.
* Weight progress graph.
* Pantry alerts.

Use mock data until the related feature has real stored data.

---

# 10. Ingredient Data Model

Each ingredient should support:

```ts
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: WeightUnit;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g?: number;
  sugarPer100g?: number;
  sodiumPer100g?: number;
  category?: IngredientCategory;
  brand?: string;
  storeProductId?: string;
}
```

Supported units should initially include:

* g
* kg
* ml
* L
* item
* tablespoon
* teaspoon
* cup

For accurate calorie calculations, convert supported units to grams when possible.

For units that cannot be reliably converted, allow users to provide a gram equivalent.

---

# 11. Meal Calculator

The Meal Calculator is one of the most important features.

Users must be able to add unlimited ingredients.

Each ingredient row must contain:

* Ingredient name.
* Quantity.
* Unit.
* Calories per 100 g.
* Protein per 100 g.
* Carbohydrates per 100 g.
* Fat per 100 g.
* Optional fibre per 100 g.
* Optional brand.
* Optional notes.

Actions for each ingredient:

* Duplicate.
* Delete.
* Move up.
* Move down.

Add ingredient options:

* Search the local ingredient database.
* Manually add a custom ingredient.
* Select a recently used ingredient.

## Ingredient Calculation Formula

For an ingredient measured in grams:

```text
Ingredient calories =
ingredient weight ÷ 100 × calories per 100 g
```

The same formula applies to protein, carbohydrates and fat.

Example:

```text
Chicken breast:
Weight = 500 g
Calories per 100 g = 120

Calories =
500 ÷ 100 × 120
= 600 calories
```

## Recipe Totals

Display:

* Total raw weight.
* Total calories.
* Total protein.
* Total carbohydrates.
* Total fat.
* Total fibre when available.

## Cooked Weight Calculation

After cooking, the user enters:

* Total final cooked weight.

Example:

```text
Total recipe calories = 2,400
Final cooked weight = 1,800 g
```

Calculate:

```text
Calories per gram =
2,400 ÷ 1,800
```

Calculate nutrition per:

* 1 g.
* 100 g.
* User-selected serving weight.

## Serving Calculator

The user enters a serving weight, for example:

```text
350 g
```

The application calculates:

* Serving calories.
* Serving protein.
* Serving carbohydrates.
* Serving fat.
* Serving fibre.

Formula:

```text
Serving calories =
total recipe calories ÷ cooked weight × serving weight
```

The serving results must update instantly.

## Save Recipe

Allow the calculated meal to be saved as a recipe.

Required fields:

* Recipe name.
* Category.
* Description.
* Ingredients.
* Total nutrition.
* Cooked weight.
* Serving size.
* Number of servings.
* Preparation time.
* Cooking time.
* Notes.
* Favourite status.
* Date created.
* Date updated.

---

# 12. Personal Recipe Library

The My Recipes page stores user-created recipes.

Display recipes as responsive cards.

Each card should show:

* Recipe name.
* Placeholder image or saved image URL.
* Calories per serving.
* Protein per serving.
* Carbohydrates per serving.
* Fat per serving.
* Serving size.
* Number of servings.
* Category.
* Favourite icon.

Recipe actions:

* View.
* Edit.
* Duplicate.
* Delete.
* Favourite.
* Add to Daily Tracker.
* Add to Meal Planner.
* Add ingredients to Shopping List.

Filters:

* Breakfast.
* Lunch.
* Dinner.
* Snack.
* Meal Prep.
* High Protein.
* Low Calorie.
* Favourite.

Add:

* Search by recipe name.
* Sort by newest.
* Sort by oldest.
* Sort by calories.
* Sort by protein.
* Sort alphabetically.

---

# 13. Recipe Discovery Page

Create a separate page called **Discover Recipes**.

This page finds new recipes from external or built-in recipe sources.

The initial implementation should use:

* Local mock recipe data.
* A recipe provider interface.
* An API-ready architecture.

Do not make the UI depend directly on one external recipe API.

## Recipe Provider Interface

Create an interface similar to:

```ts
export interface RecipeProvider {
  searchRecipes(params: RecipeSearchParams): Promise<DiscoveredRecipe[]>;
  getRecipeById(id: string): Promise<DiscoveredRecipe | null>;
}
```

Possible future providers:

* Spoonacular.
* Edamam.
* TheMealDB.
* Other licensed recipe APIs.
* A custom Supabase recipe database.

The first implementation may use a mock provider.

## Recipe Search

Users should be able to search by:

* Recipe name.
* Ingredient.
* Cuisine.
* Meal type.
* Cooking time.
* Calories.
* Protein.
* Dietary preference.
* Budget.

## Filters

Include:

* High Protein.
* Low Calorie.
* Under 500 Calories.
* Under 700 Calories.
* 30 g+ Protein.
* 40 g+ Protein.
* Vegetarian.
* Vegan.
* Gluten Free.
* Dairy Free.
* Meal Prep.
* Budget Meals.
* Under 15 Minutes.
* Under 30 Minutes.
* Breakfast.
* Lunch.
* Dinner.
* Snacks.

## Recipe Discovery Cards

Each discovered recipe card should show:

* Recipe image.
* Recipe title.
* Short description.
* Total cooking time.
* Calories per serving.
* Protein per serving.
* Number of servings.
* Cuisine.
* Dietary tags.

Card actions:

* View Recipe.
* Save Recipe.
* Add to Meal Planner.
* Add Ingredients to Shopping List.

## Recipe Details Page

Display:

* Large recipe image.
* Recipe title.
* Description.
* Preparation time.
* Cooking time.
* Total time.
* Difficulty.
* Servings.
* Calories per serving.
* Protein.
* Carbohydrates.
* Fat.
* Ingredients.
* Ingredient quantities.
* Step-by-step instructions.
* Dietary information.
* Estimated recipe cost.
* Estimated cost per serving.
* Source information when required.

Actions:

* Save to My Recipes.
* Add to Meal Planner.
* Add ingredients to Shopping List.
* Adjust servings.
* Print recipe.
* Favourite.

When servings change, ingredient quantities should update proportionally.

---

# 14. External Recipe API Configuration

Do not hardcode API keys.

Use environment variables.

Example `.env.local` structure:

```env
RECIPE_API_PROVIDER=mock
RECIPE_API_KEY=
RECIPE_API_BASE_URL=
```

Create a `.env.example` file without real secret values.

API keys must only be used through Next.js server routes.

Do not expose secret keys directly in client-side code.

Create an API route such as:

```text
/api/recipes
```

The route should:

* Validate search parameters.
* Call the configured provider.
* Handle provider errors.
* Return a consistent application recipe format.
* Avoid exposing secret keys.
* Return mock data when the provider is set to `mock`.

---

# 15. Daily Calorie and Macro Tracker

Create meal sections for:

* Breakfast.
* Lunch.
* Dinner.
* Snacks.

Users can add:

* A saved recipe.
* A discovered recipe.
* A manually entered food.
* A custom calorie entry.

Each entry should contain:

* Food or recipe name.
* Serving amount.
* Calories.
* Protein.
* Carbohydrates.
* Fat.
* Meal category.
* Date.

Display daily totals:

* Total calories.
* Calorie goal.
* Calories remaining.
* Protein consumed.
* Protein goal.
* Carbohydrates consumed.
* Fat consumed.

Add progress bars.

Allow:

* Selecting another date.
* Editing entries.
* Deleting entries.
* Copying yesterday's meals.
* Duplicating a meal.
* Clearing a day with confirmation.

---

# 16. Weekly Meal Planner

Create a weekly meal planning page.

Days:

* Monday.
* Tuesday.
* Wednesday.
* Thursday.
* Friday.
* Saturday.
* Sunday.

Meal slots:

* Breakfast.
* Lunch.
* Dinner.
* Snacks.

Users should be able to:

* Add a saved recipe.
* Add a discovered recipe.
* Remove a recipe.
* Change servings.
* Copy one day to another.
* Clear a day.
* Clear the whole week.
* Move meals between days.

Drag and drop may be added, but simple buttons are acceptable initially.

Display weekly totals:

* Calories.
* Protein.
* Carbohydrates.
* Fat.
* Estimated grocery cost.

Add a button:

```text
Generate Shopping List
```

This should combine ingredients from planned recipes.

When the same ingredient appears in multiple recipes, combine the quantities when units are compatible.

---

# 17. Shopping List

Users can manually add shopping items or generate them from recipes.

Each shopping item should contain:

```ts
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  preferredBrand?: string;
  preferredStore?: string;
  notes?: string;
  purchased: boolean;
  sourceRecipeIds?: string[];
}
```

Categories:

* Fruit.
* Vegetables.
* Meat.
* Seafood.
* Dairy.
* Frozen.
* Bakery.
* Pantry.
* Drinks.
* Household.
* Other.

Features:

* Add item.
* Edit item.
* Delete item.
* Mark purchased.
* Mark all purchased.
* Clear purchased items.
* Search items.
* Group by category.
* Sort alphabetically.
* Filter purchased or unpurchased.
* Send list to Price Comparison.

Generated recipe ingredients should be combined where possible.

---

# 18. Price Comparison System

Create a Price Comparison page.

The user selects a location.

Initial location examples:

* Canberra.
* Sydney.
* Melbourne.
* Brisbane.
* Adelaide.
* Perth.
* Hobart.
* Darwin.

Store the selected location in settings.

The system should compare grocery items across supported supermarkets.

Initial supported stores:

* Coles.
* Woolworths.
* Aldi.
* IGA.
* Costco.
* Harris Farm.

Not every store will have publicly available live product data.

The system must clearly show when information is:

* Live.
* Recently cached.
* Mock.
* Manually entered.
* Unavailable.

## Product Price Model

```ts
export interface StoreProductPrice {
  id: string;
  query: string;
  productName: string;
  brand?: string;
  size?: string;
  store: StoreName;
  currentPrice: number;
  regularPrice?: number;
  unitPrice?: number;
  unitLabel?: string;
  isOnSpecial: boolean;
  discountPercentage?: number;
  availability?: "in-stock" | "out-of-stock" | "unknown";
  productUrl?: string;
  imageUrl?: string;
  location?: string;
  dataSource: "live-api" | "cached" | "mock" | "manual";
  lastUpdated: string;
}
```

## Price Provider Interface

Create:

```ts
export interface PriceProvider {
  storeName: StoreName;
  searchProducts(
    query: string,
    location: string
  ): Promise<StoreProductPrice[]>;
}
```

Provider implementations should include placeholders for:

* ColesProvider.
* WoolworthsProvider.
* AldiProvider.
* IGAProvider.
* CostcoProvider.
* HarrisFarmProvider.
* MockPriceProvider.

The UI must not call supermarket providers directly.

Use a central price comparison service.

## Price Comparison Results

For every shopping item, display:

* Matched product.
* Brand.
* Package size.
* Store.
* Current price.
* Regular price.
* Unit price.
* Special status.
* Discount percentage.
* Availability.
* Last updated.
* Data source.
* Product link when available.

Allow the user to choose the correct product match.

## Basket Calculations

Calculate:

* Cheapest price for each shopping item.
* Cheapest total using multiple stores.
* Total cost at each individual store.
* Best single store.
* Best combination of stores.
* Highest basket total.
* Estimated savings.

Example:

```text
Best single store: Woolworths
Estimated total: $76.40

Cheapest mixed basket: $68.25

Estimated savings: $8.15
```

## Live Price Data Requirements

Live supermarket data should only be integrated using:

* Official APIs.
* Approved affiliate APIs.
* Licensed third-party providers.
* Public product feeds.
* Data sources permitted by their terms.

Do not build fragile or unauthorised scraping as the main data source.

Create the architecture so mock data can later be replaced with an approved live provider.

## Price API Route

Create a Next.js route such as:

```text
/api/prices
```

It should:

* Accept product query and location.
* Validate inputs.
* Call one or more configured providers.
* Normalize results.
* Handle failed providers.
* Return partial results when some stores fail.
* Include data source and last updated fields.
* Never expose provider secrets.

## Price Environment Variables

Example:

```env
PRICE_PROVIDER_MODE=mock
COLES_API_KEY=
WOOLWORTHS_API_KEY=
THIRD_PARTY_GROCERY_API_KEY=
```

Do not put real keys inside the repository.

---

# 19. Pantry Management

Users should be able to track ingredients they already own.

Each pantry item should contain:

```ts
export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  lowStockThreshold?: number;
  expiryDate?: string;
  notes?: string;
}
```

Features:

* Add pantry item.
* Edit item.
* Delete item.
* Search pantry.
* Filter by category.
* Mark low-stock threshold.
* Display low-stock warnings.
* Display upcoming expiry warnings.
* Add low-stock items to Shopping List.

Future-ready features:

* Automatically subtract ingredients after cooking.
* Suggest recipes based on pantry ingredients.
* Show missing ingredients.
* Reduce food waste.

For the initial version, users may manually update quantities.

---

# 20. Cook With What I Have

Add a section inside Recipe Discovery or Pantry called:

```text
Cook With What I Have
```

It should compare pantry ingredients with available recipes.

Display:

* Recipes the user can make now.
* Recipes missing one ingredient.
* Recipes missing two ingredients.
* Percentage of ingredients already available.
* Missing ingredients.
* Button to add missing ingredients to Shopping List.

This should use standard matching logic, not AI.

Matching should normalize ingredient names where possible.

Example:

```text
chicken breast
Chicken Breast
chicken breasts
```

These should be treated as similar matches.

---

# 21. Recipe Cost Calculator

Each recipe should support ingredient cost information.

Calculate:

* Total recipe cost.
* Cost per serving.
* Cost per 100 g.
* Weekly cost if repeatedly planned.
* Monthly estimated cost.

When live price data is available, use the selected product price.

When no live price is available, allow users to manually enter an estimated ingredient price.

Each cost result should display its data source.

---

# 22. Weight Tracker

Users should be able to log:

* Date.
* Weight.
* Waist measurement.
* Notes.

Display:

* Current weight.
* Starting weight.
* Target weight.
* Total weight lost.
* Highest recorded weight.
* Lowest recorded weight.
* Weekly change.
* Monthly change.
* BMI when height is entered.
* Progress toward target.

Create Recharts graphs for:

* Weekly weight.
* Monthly weight.
* Long-term progress.

Allow:

* Add entry.
* Edit entry.
* Delete entry.
* Select date range.
* Export weight data.

Do not provide medical diagnoses.

---

# 23. Settings Page

Settings should include:

## Profile Preferences

* Display name, optional.
* Height.
* Current weight.
* Target weight.

## Nutrition Goals

* Daily calorie goal.
* Daily protein goal.
* Daily carbohydrate goal.
* Daily fat goal.

## Units

* Metric.
* Imperial.

Metric should be the default.

## Location

* Country.
* State or territory.
* City or suburb.
* Postcode.

Use the selected location for supermarket price comparison.

## Display

* Dark mode.
* Light mode.
* System mode.

## Data Management

* Export all application data.
* Import application data.
* Reset application.
* Clear individual feature data.

Destructive actions must require confirmation.

---

# 24. Import and Export

Allow users to export data as JSON.

Include:

* Recipes.
* Daily meals.
* Meal plans.
* Shopping lists.
* Pantry.
* Weight logs.
* Settings.

Support importing previously exported JSON.

Validate imported data before saving.

Reject invalid or unsafe data.

Optional CSV exports:

* Weight history.
* Daily nutrition.
* Shopping list.

---

# 25. Local Ingredient Database

Create a starter ingredient JSON file.

Include common foods such as:

* Chicken breast.
* Chicken thigh.
* Lean beef mince.
* Salmon.
* Tuna.
* Eggs.
* White rice.
* Brown rice.
* Basmati rice.
* Pasta.
* Potato.
* Sweet potato.
* Onion.
* Tomato.
* Diced tomatoes.
* Garlic.
* Broccoli.
* Spinach.
* Capsicum.
* Olive oil.
* Butter.
* Milk.
* Greek yogurt.
* Cottage cheese.
* Whey protein.
* Oats.
* Banana.
* Apple.

Each ingredient should contain:

* Name.
* Category.
* Calories per 100 g.
* Protein per 100 g.
* Carbohydrates per 100 g.
* Fat per 100 g.
* Default unit.

Clearly label local nutrition values as estimates.

Allow users to override every value.

---

# 26. Mock Data

Provide useful mock data for:

* Recipes.
* Discovered recipes.
* Supermarket products.
* Shopping lists.
* Daily meals.
* Pantry items.
* Weight entries.

Mock data should make the UI testable immediately.

Mock data must be separated from production services.

Use an environment setting or provider configuration to choose mock providers.

---

# 27. State Management

Use Zustand for application state.

Create separate stores for major features.

Examples:

* Recipe store.
* Daily tracker store.
* Meal planner store.
* Shopping list store.
* Pantry store.
* Weight store.
* Settings store.

Each store should support:

* Loading persisted data.
* Creating records.
* Updating records.
* Removing records.
* Resetting feature data.
* Persisting changes through the storage service.

Avoid putting the entire application inside one large Zustand store.

---

# 28. Hydration and Next.js Client Storage

Because `localStorage` only exists in the browser:

* Client-side storage code must only run after hydration.
* Avoid server/client hydration mismatches.
* Use `"use client"` only where required.
* Keep server components as the default where possible.
* Create a hydration helper or hook.
* Display a loading state while persisted data loads.

Do not access `window` or `localStorage` during server rendering.

---

# 29. Validation

Validate:

* Ingredient quantities.
* Nutrition values.
* Cooked weights.
* Serving sizes.
* Recipe names.
* Dates.
* Weight entries.
* Shopping quantities.
* Imported JSON.
* API parameters.

Prevent:

* Negative quantities.
* Division by zero.
* Invalid cooked weight.
* Serving size greater than cooked weight without warning.
* Empty required names.
* Invalid numbers.
* NaN results.
* Infinite results.

Show helpful validation messages beside fields.

---

# 30. Error Handling

Create consistent error handling.

The application should gracefully handle:

* Missing local data.
* Corrupted stored data.
* Failed recipe API.
* Failed supermarket provider.
* Partial provider results.
* Invalid form submissions.
* Missing recipe images.
* Offline mode.
* Unexpected errors.

Create:

* Error boundary.
* Page error state.
* Retry button.
* Friendly error messages.
* Console logging only during development.

Do not expose API keys or technical server details to users.

---

# 31. Accessibility

The application should include:

* Semantic HTML.
* Form labels.
* Keyboard navigation.
* Visible focus states.
* Accessible buttons.
* Sufficient contrast.
* Alt text for recipe images.
* ARIA labels where required.
* Large touch targets.
* Accessible modal behaviour.
* Escape key support for dialogs.

---

# 32. Performance

Use:

* Debounced search.
* Memoized expensive calculations.
* Lazy loading where useful.
* Next.js Image for remote recipe images.
* Optimized component rendering.
* Pagination or load-more for large recipe result lists.
* Cached API results where appropriate.

Avoid unnecessary API calls.

Price and recipe searches should not run on every keystroke without debounce.

---

# 33. Security

Do not expose secret API keys.

Store private API keys only in `.env.local`.

Add `.env.local` to `.gitignore`.

Use server-side Next.js API routes for providers requiring secret keys.

Validate API input.

Do not render unsafe HTML from recipe APIs.

Do not use `dangerouslySetInnerHTML` unless content is sanitized.

Do not trust imported files.

---

# 34. Testing Requirements

Create unit tests for critical calculations where practical.

Important calculation tests:

* Ingredient calorie calculation.
* Total recipe nutrition.
* Calories per gram.
* Nutrition per 100 g.
* Serving nutrition.
* Recipe serving scaling.
* Shopping ingredient merging.
* Basket price totals.
* Cheapest store selection.
* Cheapest mixed basket.
* Weight change calculation.

Add a small set of component tests for:

* Meal Calculator.
* Shopping List.
* Recipe filters.
* Price comparison results.

Testing may use:

* Vitest or Jest.
* React Testing Library.

Do not use Vite as the application build tool.

Using Vitest only as a test runner is acceptable only when properly isolated, but Jest is preferred to avoid confusion.

---

# 35. Required Pages and Routes

Create these routes:

```text
/
```

Redirect or display the Dashboard.

```text
/dashboard
/meal-calculator
/recipes
/recipes/[id]
/discover
/discover/[id]
/meal-planner
/daily-tracker
/shopping-list
/price-comparison
/pantry
/weight-tracker
/settings
```

Create custom:

```text
/not-found
```

Use loading and error states where suitable.

---

# 36. Initial Development Phases

## Phase 1 — Foundation

Build:

* Next.js project.
* TypeScript configuration.
* Tailwind setup.
* Layout.
* Sidebar.
* Mobile navigation.
* Shared components.
* Routes.
* Types.
* Local storage service.
* Zustand store pattern.
* Mock data.
* Dark theme.

## Phase 2 — Meal Calculator

Build:

* Ingredient rows.
* Nutrition calculations.
* Cooked weight calculation.
* Serving calculator.
* Recipe saving.

## Phase 3 — Personal Recipes

Build:

* Recipe library.
* Recipe details.
* Editing.
* Duplication.
* Deletion.
* Favourites.

## Phase 4 — Recipe Discovery

Build:

* Mock recipe provider.
* Search.
* Filters.
* Recipe details.
* Save discovered recipe.
* Add ingredients to Shopping List.

## Phase 5 — Daily Tracker and Meal Planner

Build:

* Daily meal logging.
* Nutrition totals.
* Weekly planner.
* Shopping list generation.

## Phase 6 — Shopping and Pantry

Build:

* Shopping list.
* Ingredient merging.
* Pantry management.
* Low-stock alerts.
* Cook With What I Have.

## Phase 7 — Price Comparison

Build:

* Mock price providers.
* Product matching.
* Per-store totals.
* Cheapest mixed basket.
* Provider architecture.
* API route.

## Phase 8 — Weight and Settings

Build:

* Weight tracking.
* Graphs.
* Goals.
* Settings.
* Import and export.

## Phase 9 — Review

Complete:

* Testing.
* Accessibility review.
* Performance review.
* TypeScript review.
* Error handling.
* Responsive testing.
* Production build validation.

---

# 37. Definition of Done

A feature is complete only when:

* It works on mobile and desktop.
* It uses TypeScript correctly.
* It has validation.
* It has loading, empty and error states where relevant.
* It persists data correctly.
* It does not duplicate existing logic.
* It does not cause hydration errors.
* It passes linting.
* It passes the production build.
* It does not expose secrets.
* It follows the architecture in this specification.

---

# 38. Required Commands

These commands must work:

```bash
npm install
npm run dev
npm run lint
npm run build
```

Add test scripts when tests are configured:

```bash
npm run test
```

---

# 39. Required Documentation

Create a `README.md` containing:

* Project overview.
* Technology stack.
* Installation steps.
* Development command.
* Build command.
* Environment variables.
* Current features.
* Future features.
* Folder structure.
* Storage explanation.
* API provider explanation.

Create:

```text
.env.example
```

Include placeholder environment variables only.

---

# 40. Important Implementation Restrictions

Do not:

* Build login or signup.
* Add user accounts.
* Connect Supabase yet.
* Add AI features.
* Use Vite.
* Use React Router.
* Expose API keys.
* Scrape supermarket websites without an approved method.
* Hardcode live prices and label them as live.
* Store all application code in one file.
* Remove working functionality without a strong reason.
* Change the selected technology stack.

Use:

```text
React + Next.js + TypeScript + npm
```

Development command:

```bash
npm run dev
```

Storage for now:

```text
Browser localStorage through a reusable storage service
```

Database later:

```text
Supabase
```

Authentication later:

```text
Supabase Auth or another approved authentication provider
```

---

# 41. Final Product Goal

The final product should allow a user to complete this workflow:

1. Discover or create a recipe.
2. Enter ingredient quantities.
3. Calculate total calories and macros.
4. Enter final cooked weight.
5. Calculate nutrition for a specific serving.
6. Save the recipe.
7. Add the recipe to a meal plan.
8. Generate a shopping list.
9. Compare supermarket prices based on location.
10. Find the cheapest basket.
11. Track pantry items.
12. Log the meal in the Daily Tracker.
13. Track body weight and progress.

The codebase must remain clean and extendable so a database, authentication, real recipe APIs and approved live supermarket price providers can be added later.

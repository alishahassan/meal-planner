// Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.0/+esm';

const supabaseUrl = 'https://uewubyuguyljkwlwwaqf.supabase.co';
const supabaseAnonKey = 'sb_publishable_zkM7vzXzd3mR0RmeQ9IvCQ_bMfgBikf';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Render Results Helper
function renderSearchResults(recipes) {
    const container = document.getElementById("recipe-results");
    if (!container) {
        console.error("Error: Could not find element with ID 'recipe-results'.");
        return;
    }

    container.innerHTML = "<h2>Matching Meals</h2>";

    if (!recipes || recipes.length === 0) {
        container.innerHTML += "<p>No recipes found.</p>";
        return;
    }


    recipes.forEach(recipe => {
        if (!recipe || !recipe.Recipe) return;

        const card = document.createElement("article");
        card.className = "recipe-card";

        const imgSrc = recipe.photo_url || "img/default.jpg";
        const name = recipe.Recipe;
        const calories = recipe.Calories || "N/A";
        const id = recipe.RecepieID;

        card.innerHTML = `
            <img src="${imgSrc}" alt="${name}">
            <div class="card-content">
                <h3>${name}</h3>
                <p>Calories: ${calories} kcal</p>
                <a href="recipe-detail.html?id=${id}" class="btn-primary">View Meal</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// Main Page Logic
document.addEventListener("DOMContentLoaded", async () => {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('recipe-search');
            const query = input.value.trim();

            if (query) {
                window.location.href = `index.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("q");
    const ingredientList = params.get("ingredients");
    const maxCalories = params.get("max_cals");

    console.log("🔍 URL ingredient list =", ingredientList);

    // Results from pantry.html via localStorage
    const rawResults = localStorage.getItem("recipeResults");

    if (rawResults) {
        console.log("Loading recipes from localStorage…", ingredientList);
        const recipes = JSON.parse(rawResults);
        renderSearchResults(recipes);

        localStorage.removeItem("recipeResults");
        return;
    }

    // If no search params, keep page blank
    if (!searchQuery && !ingredientList) {
        console.log("No search requested — leaving page blank.");
        return;
    }

    let recipes = [];

    // Case A: search by recipe name
    if (searchQuery) {
        console.log("Searching by name:", searchQuery);
    
        // Initialize the query chain
        let queryBuilder = supabase
            .from("Recepies")
            .select("*")
            .ilike("Recipe", `%${searchQuery}%`);
    
        // Apply filter maxCalories parameter is present
        if (maxCalories && !isNaN(parseInt(maxCalories))) {
            const calValue = parseInt(maxCalories);
            console.log(`Applying Max Calories filter: ${calValue}`);
            
            // Chain the filter
            queryBuilder = queryBuilder.lte("Calories", parseInt(maxCalories));
        }
    
        // Await final result after all filtering is complete
        const { data, error } = await queryBuilder;
    
        if (error) {
            console.error("Supabase name search error:", error);
            console.error("Supabase error details:", error.message);
            return;
        }
        
        recipes = data || [];
        console.log(`Found ${recipes.length} recipes by name.`);
    }

    // Case B: search by selected pantry ingredients
    if (ingredientList) {
        // Prepare search string: "chicken | pasta | bread"
        const selected = ingredientList.split(",").map(s => s.trim());    
        const searchString = selected.join(' | '); 
        
        console.log("Searching by ingredients OR:", searchString);
    
        // Use RPC OR direct query to find matching Recipe IDs
        // Standard query that finds all ingredient rows containing the search term
        const { data: ingredientRows, error: ingError } = await supabase
            .from("Ingridients")
            .select("RecepieID")
            .textSearch('Ingredient', searchString, {
                type: 'websearch',
                config: 'english'
            });
    
        if (ingError) {
            console.error("Supabase ingredient fetch error:", ingError);
            return;
        }
        
        // Extract unique Recepie IDs
        const matchedRecipeIDs = Array.from(new Set(
            ingredientRows.map(row => row.RecepieID).filter(id => id > 0)
        ));
        
        console.log("Matched unique recipe IDs:", matchedRecipeIDs);

        if (matchedRecipeIDs.length === 0) {
             recipes = [];
        } else {
             // Fetch the recipe data using the IDs
             const { data: recipesData, error: recipesError } = await supabase
                 .from("Recepies")
                 .select("*")
                 .in("RecepieID", matchedRecipeIDs);
        
             if (recipesError) {
                 console.error("Recipe fetch error:", recipesError);
                 return;
             }
             console.log("Recipes Data returned:", recipesData);
        
             recipes = recipesData || [];
        }
    }
    
    // Final Render for Case A and Case B
    if (recipes.length > 0) {
        renderSearchResults(recipes);
    } else {
        if (searchQuery || ingredientList) {
            renderSearchResults([]); 
        }
    }
});
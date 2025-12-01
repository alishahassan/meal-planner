// Supabase Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.0/+esm';

const supabaseUrl = 'https://uewubyuguyljkwlwwaqf.supabase.co';
const supabaseAnonKey = 'sb_publishable_zkM7vzXzd3mR0RmeQ9IvCQ_bMfgBikf';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add ingredient to Pantry list
document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const nameInput = document.getElementById('ingredient-name');
    const list = document.getElementById('ingredient-list');
    const name = nameInput.value.trim();

    if (name === "") {
        alert("Please enter an ingredient.");
        return;
    }

    const newItem = document.createElement('li');
    newItem.className = 'pantry-item';
    
    newItem.innerHTML = `
        <label>
            <input type="checkbox" class="ingredient-checkbox" data-ingredient="${name}">
            <span>${name}</span>
        </label>
        <button class="btn-small delete-item">🗑️</button>
    `;
    
    list.appendChild(newItem);
    nameInput.value = '';
});

// RPC Search
async function searchRecipes(ingredients) {
    const messageElement = document.getElementById('search-message');
    const inputSearch = ingredients.join(' | '); 
    const calLimit = 4000;

    messageElement.textContent = "Searching...";
    messageElement.style.display = 'block';
    
    try {
        const { data, error } = await supabase.rpc(
            'get_recipes_under_calories',
            {
                search: '%' + inputSearch + '%',
                cal_limit: calLimit
            }
        );

        if (error) throw error;

        if (data.length > 0) {
            messageElement.style.color = 'green';
            messageElement.textContent = `Found ${data.length} recipes matching your pantry items!`;

            console.log("RPC Search Results:", data);

            // Store results for index.html rendering
            localStorage.setItem("recipeResults", JSON.stringify(data));

            // Redirect without ingredients (RPC results come via localStorage)
            window.location.href = "../index.html";
        } else {
            messageElement.textContent = "No recipes found matching your selection.";
        }

    } catch (error) {
        console.error('Supabase Search Error:', error);
        messageElement.style.color = 'red';
        messageElement.textContent = 'Error during search. Check console.';
    } finally {
        setTimeout(() => { messageElement.style.display = 'none'; }, 5000);
    }
}

// Existing button for RPC
document.getElementById("search-by-pantry-btn").addEventListener("click", () => {
    const checkboxes = document.querySelectorAll("#ingredient-list input[type='checkbox']:checked");

    const selected = Array.from(checkboxes).map(cb => cb.dataset.ingredient);

    if (selected.length === 0) {
        const msg = document.getElementById("search-message");
        msg.textContent = "Please select at least one ingredient.";
        msg.style.display = "block";
        return;
    }

    // Build the query string
    const query = encodeURIComponent(selected.join(","));

    console.log("Redirecting to:", `/index.html?ingredients=${query}`);

    // Updates browser URL
    window.location.href = `../index.html?ingredients=${query}`;
});


// Delete item from Pantry list
document.getElementById('ingredient-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-item')) {
        const listItem = e.target.closest('.pantry-item');
        if (listItem) {
            listItem.remove();
        }
    }
});
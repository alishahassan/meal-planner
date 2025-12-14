// Supabase Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.0/+esm';

const supabaseUrl = 'https://uewubyuguyljkwlwwaqf.supabase.co';
const supabaseAnonKey = 'sb_publishable_zkM7vzXzd3mR0RmeQ9IvCQ_bMfgBikf';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;

// Auth + initial load
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  currentUser = user;
  await loadUserPantry();
});

// Load user pantry
async function loadUserPantry() {
  const list = document.getElementById("ingredient-list");
  list.innerHTML = "";

  const { data, error } = await supabase
    .from("OwndedIngridrients")
    .select(`
      OwnedID,
      Ingridients (
        Ingredient
      )
    `)
    .eq("UserID", currentUser.id);

  if (error) {
    console.error("Load pantry error:", error);
    return;
  }

  data.forEach(row => {
    renderIngredient(row.OwnedID, row.Ingridients.Ingredient);
  });
}

// Add ingredient
document.getElementById("add-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const input = document.getElementById("ingredient-name");
    const value = input.value.trim();
    if (!value) return;
  
    // Find closest ingredient
    const { data: match, error: matchError } = await supabase
      .from("Ingridients")
      .select("IngridientID, Ingredient")
      .ilike("Ingredient", `%${value}%`)
      .limit(1)
      .single();
  
    if (matchError || !match) {
      alert("Ingredient not found");
      return;
    }
  
    // Check if ingredient is already in user's pantry
    const { data: existing, error: existingError } = await supabase
      .from("OwndedIngridrients")
      .select("*")
      .eq("UserID", currentUser.id)
      .eq("IngridientID", match.IngridientID)
      .single();
  
    if (existing) {
      alert("Ingredient already in your pantry!");
      input.value = "";
      return;
    }
  
    // Insert into OwndedIngridrients
    const { error: insertError } = await supabase
      .from("OwndedIngridrients")
      .insert({
        UserID: currentUser.id,
        IngridientID: match.IngridientID
      });
  
    if (insertError) {
      console.error("Insert error:", insertError);
      alert("Could not add ingredient. Make sure your account exists in Users table.");
      return;
    }
  
    input.value = "";
    await loadUserPantry();
  });
  

// Delete Ingredient
document.getElementById("ingredient-list").addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-item")) return;

  const li = e.target.closest(".pantry-item");
  const ownedID = li.dataset.ownedid;

  const { error } = await supabase
    .from("OwndedIngridrients")
    .delete()
    .eq("OwnedID", ownedID);

  if (error) {
    console.error("Delete error:", error);
    return;
  }

  li.remove();
});

// Render helper function
function renderIngredient(ownedID, name) {
  const list = document.getElementById("ingredient-list");

  const li = document.createElement("li");
  li.className = "pantry-item";
  li.dataset.ownedid = ownedID;

  li.innerHTML = `
    <label>
      <input type="checkbox" class="ingredient-checkbox" value="${name}">
      <span>${name}</span>
    </label>
    <button class="btn-small delete-item">🗑️</button>
  `;

  list.appendChild(li);
}

document.getElementById("search-by-pantry-btn").addEventListener("click", () => {
    const checkedBoxes = Array.from(document.querySelectorAll(".ingredient-checkbox:checked"));
    const selectedIngredients = checkedBoxes.map(cb => cb.value);

    const searchMessage = document.getElementById("search-message");
    if (selectedIngredients.length === 0) {
        searchMessage.style.display = "block";
        searchMessage.textContent = "Please select at least one ingredient to search.";
        return;
    } else {
        searchMessage.style.display = "none";
    }

    // Build URL for index.html
    const url = `../index.html?ingredients=${encodeURIComponent(selectedIngredients.join(','))}`;
    window.location.href = url;
});

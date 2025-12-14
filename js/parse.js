async function init() {
    console.log("Loading CSV...");
    const recipes = await loadCSV("data/new_a.csv");
    console.log("CSV Loaded:", recipes);
    displayRecipes(recipes.slice(0, 5));
}
init();

async function loadCSV(path) {
    const response = await fetch(path);
    const text = await response.text();
    return parseCSV(text);
}

function parseCSV(csvText) {
    const lines = csvText.split("\n").map(l => l.trim());
    const headers = lines.shift().split(",");

    return lines.map(line => {
        // split on commas not inside quotes
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
            .map(v => v.replace(/^"|"$/g, ""));

        let obj = {};
        headers.forEach((h, i) => {
            obj[h] = values[i] ?? "";
        });

        return obj;
    });
}

function displayRecipes(recipes) {
    const main = document.querySelector("#saved-meals");

    let html = "";
    recipes.forEach(r => {
        const image = "../images/placeholder.jpg"; // your default image
        html += `
            <article class="recipe-card">
                <img src="${image}" alt="${r.Title}">
                <div class="card-content">
                    <h3>${r.Title}</h3>
                    <p>${r.Calories}</p>
                    <p>Allergens: ${r.Allergens}</p>
                    <a href="#" class="btn-primary">View Meal</a>
                </div>
            </article>
        `;
    });

    main.innerHTML = html;
}


function filterByKeyword(recipes, keyword) {
    return recipes.filter(r => r.Title.toLowerCase().includes(keyword.toLowerCase()));
}


function filterLowCal(recipes, max) {
    return recipes.filter(r => {
        const num = Number(r.Calories.replace(/[^0-9]/g, ""));
        return num <= max;
    });
}

function filterByAllergen(recipes, allergen) {
    return recipes.filter(r => r.Allergens.includes(allergen));
}

async function init() {
    const recipes = await loadCSV("/data/new_a.csv");

    // choose what to show:
    // const selected = filterByKeyword(recipes, "Ribeye");
    // const selected = filterLowCal(recipes, 600);
    // const selected = filterByAllergen(recipes, "Milk");

    const selected = recipes.slice(0, 10); // first 10 items for testing

    displayRecipes(selected);
}

init();


console.log("PLANNING SCRIPT LOADED");


class Recipe {
    constructor({name, ingredients = [], image = ""}) {
        this.name = name;
        this.ingredients = ingredients;
        this.image = image;
    }
}

const chicken = new Recipe({ name: "Spicy Chicken Stir Fry", ingredients: ["chicken", "sauce", "egg"], image: "../img/spicy_chicken_stir_fry.jpg" });
const lentil_soup = new Recipe({ name: "Afghan Red Lentil Soup", ingredients: ["bread", "butter"], image: "../img/afghan_red_lentil_soup.jpg"});
const crabcakes = new Recipe({ name: "Aioli-Topped Crab Cakes", ingredients: ["hotdog", "bun"], image: "../img/aioli-topped_crab_cakes.jpg" });
const ribeye = new Recipe({ name: "20 oz Rib-Eye Steak", ingredients: ["hotdog", "bun"], image: "../img/20_oz_rib-eye_steaks.jpg" });
const salad = new Recipe({ name: "Ceasar Salad", ingredients: ["hotdog", "bun"], image: "../img/a_caesar_salad_to_rule_them_all.jpg" });
const adobosteak = new Recipe({ name: "Adobo Loco Steak", ingredients: ["hotdog", "bun"], image: "../img/adobo_loco_steak.jpg" });
const picopork = new Recipe({ name: "Al Pastor Pico Pork", ingredients: ["hotdog", "bun"], image: "../img/al_pastor_pico_pork.jpg" });
const panini = new Recipe({ name: "Alpine Mushroom & Swiss Panini", ingredients: ["hotdog", "bun"], image: "../img/alpine_mushroom_&_swiss_panini.jpg"});
const turkeyburger = new Recipe({ name: "Alpine Turkey Burgers", ingredients: ["hotdog", "bun"], image: "../img/alpine_turkey_burgers.jpg"});
const apricotchicken = new Recipe({ name: "Amazing Apricot Chicken", ingredients: ["hotdog", "bun"], image: "../img/amazing_apricot_chicken.jpg"});
const pancake = new Recipe({ name: "Apple Dutch Baby Pancake", ingredients: ["hotdog", "bun"], image: "../img/apple_dutch_baby_pancake.jpg"});


let pastRecipes = [chicken, lentil_soup, crabcakes, ribeye, salad, adobosteak, picopork, panini, turkeyburger, apricotchicken, pancake];



const dateElement = document.getElementById("current-date");
const weekElement = document.getElementById("current-week");

const today = new Date();
if (dateElement) {
    dateElement.textContent = today.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });
}

if (weekElement) {
    const day = today.getDay();
    const monday = new Date(today);
    const diffToMonday = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const options = { month: 'long', day: 'numeric' };
    weekElement.textContent = `Week of ${monday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}`;
}



const weeklyGrid = document.getElementById("weekly-meals-grid");
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 

// add items to cards
for (let i = 0; i < weekdays.length; i++) {
    const dayCard = document.createElement("div");
    dayCard.classList.add("day-card");

    dayCard.innerHTML = `
        <div class="card-header">
            <h1>${weekdays[i]}</h1>
        </div>
        <div class="scroll-box"></div>
    `;

    weeklyGrid.appendChild(dayCard);

    const scrollBox = dayCard.querySelector(".scroll-box");

    for (let j = 0; j < pastRecipes.length; j++) {
        const recipe = pastRecipes[j];

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <div class="card-content">
                <h3>${recipe.name}</h3>
                <a href="#" class="btn-primary">View Meal</a>
            </div>
        `;

        scrollBox.appendChild(recipeCard);
    }
}


    
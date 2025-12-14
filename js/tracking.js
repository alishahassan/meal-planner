// if not working reload browser cache
console.log("SCRIPT LOADED");

const xArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const yArray = [1857, 1901, 2100, 500, 0, 0, 0, 0];

const data = [{
  x: xArray,
  y: yArray,
  type: "bar",
  orientation:"v",
  marker: {color:["rgba(197,255,145, 1)", 
                "rgba(197,255,145, 1)", 
                "rgba(197,255,145, 1)", 
                "rgba(84,204,0, 1)"]
  }
}];

const layout = {title:""};


Plotly.newPlot(document.getElementById("barchart"), data, layout, {responsive: true});


let calorieCount = 0;
function updateCalories(calories) {
    calorieCount= calories
    document.getElementById("calorie-count").textContent = calories + "\ncalories";
}

document.addEventListener("DOMContentLoaded", () => {
    updateCalories(1200);
});



const main = document.querySelector('#saved-meals');


class Recipe {
    constructor({name, ingredients = [], image = ""}) {
        this.name = name;
        this.ingredients = ingredients;
        this.image = image;
    }
}

const chicken = new Recipe ({
    name: "Chicken Stir Fry",
    ingredients: ["chicken", "sauce", "egg"],
    image: "../images/chicken2.jpg"
})

const toast = new Recipe ({
    name: "Toast",
    ingredients: ["bread", "butter"],
    image: "../images/toast.jpg"
})

const hotdog = new Recipe ({
    name: "Hot Dog",
    ingredients: ["hotdog", "bun"],
    image: "../images/hotdog.webp"
})

const hotdog2 = new Recipe ({
    name: "Hot Dog",
    ingredients: ["hotdog", "bun"],
    image: "../images/hotdog.webp"
})

const hotdog3 = new Recipe ({
    name: "Hot Dog",
    ingredients: ["hotdog", "bun"],
    image: "../images/hotdog.webp"
})

let pastRecipes = [chicken, toast, hotdog];
let htmlString = "";
for (let i = 0; i < pastRecipes.length; i++) {
    // htmlString += `<div class="recipe-card" style="background-image: url('${pastRecipes[i].image}')">${pastRecipes[i].name}</div>`;
    htmlString += `
                <article class="recipe-card">
                <img src="${pastRecipes[i].image}" alt="Recipe Name">
                <div class="card-content">
                    <h3>${pastRecipes[i].name}</h3>
                    <p>Calories: 490 kcal</p>
                    <a href="recipe-detail.html?id=123" class="btn-primary">View Meal</a>
                </div>
            </article>
    `;

}
main.innerHTML = htmlString;

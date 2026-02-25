// script.js
// JavaScript for interactivity on the fitness learning website

// Edamam Nutrition API Configuration
const EDAMAM_API_ID = 'e3eb5852';
const EDAMAM_API_KEY = '2d57da926c844cdf6a873b15e3b6c8f4';

// Function to display current date and time in UTC
function displayDateTime() {
    const now = new Date();
    const utcDateTime = now.toUTCString();
    if (document.getElementById('datetime')) {
        document.getElementById('datetime').innerText = utcDateTime;
    }
}

// Nutrition API Functions
async function searchFoodNutrition(foodQuery) {
    const resultsContainer = document.getElementById('nutritionResults');
    
    if (!foodQuery.trim()) {
        resultsContainer.innerHTML = '<div class="nutrition-error">Bitte geben Sie ein Lebensmittel ein.</div>';
        return;
    }
    
    resultsContainer.innerHTML = '<div class="nutrition-loading">Durchsuche Datenbank...</div>';
    
    try {
        const url = `https://api.edamam.com/api/nutrition-data?query=${encodeURIComponent(foodQuery)}&app_id=${EDAMAM_API_ID}&app_key=${EDAMAM_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.foods && data.foods.length > 0) {
            displayNutritionResults(data.foods);
        } else {
            resultsContainer.innerHTML = '<div class="nutrition-error">Keine Lebensmittel gefunden. Versuchen Sie einen anderen Suchbegriff.</div>';
        }
    } catch (error) {
        console.error('API Error:', error);
        resultsContainer.innerHTML = '<div class="nutrition-error">Fehler beim Abrufen der Daten. Bitte versuchen Sie es später erneut.</div>';
    }
}

function displayNutritionResults(foods) {
    const resultsContainer = document.getElementById('nutritionResults');
    resultsContainer.innerHTML = '';
    
    foods.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        
        const nutrients = food.food.nutrients;
        const calories = Math.round(nutrients.ENERC_KCAL || 0);
        const protein = Math.round(nutrients.PROCNT || 0);
        const carbs = Math.round(nutrients.CHOCDF || 0);
        const fat = Math.round(nutrients.FAT || 0);
        const fiber = Math.round(nutrients.FIBTG || 0);
        
        foodCard.innerHTML = `
            <h4>${food.food.label}</h4>
            <div class="food-info">
                <div class="nutrient">
                    <div class="nutrient-label">Kalorien (pro 100g)</div>
                    <div class="nutrient-value">${calories} kcal</div>
                </div>
                <div class="nutrient">
                    <div class="nutrient-label">Protein</div>
                    <div class="nutrient-value">${protein}g</div>
                </div>
                <div class="nutrient">
                    <div class="nutrient-label">Kohlenhydrate</div>
                    <div class="nutrient-value">${carbs}g</div>
                </div>
                <div class="nutrient">
                    <div class="nutrient-label">Fett</div>
                    <div class="nutrient-value">${fat}g</div>
                </div>
                <div class="nutrient">
                    <div class="nutrient-label">Ballaststoffe</div>
                    <div class="nutrient-value">${fiber}g</div>
                </div>
                <div class="nutrient">
                    <div class="nutrient-label">Kategorie</div>
                    <div class="nutrient-value">${food.food.category || 'N/A'}</div>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(foodCard);
    });
}

// Call the function on page load
window.onload = function() {
    displayDateTime();
    
    // Add event listener for Hello World button
    const helloButton = document.getElementById('helloButton');
    if (helloButton) {
        helloButton.addEventListener('click', function() {
            alert('Hello world');
        });
    }
    
    // Nutrition API event listeners
    const searchBtn = document.getElementById('searchBtn');
    const foodSearch = document.getElementById('foodSearch');
    
    if (searchBtn && foodSearch) {
        searchBtn.addEventListener('click', function() {
            searchFoodNutrition(foodSearch.value);
        });
        
        // Allow Enter key to trigger search
        foodSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchFoodNutrition(foodSearch.value);
            }
        });
    }
};

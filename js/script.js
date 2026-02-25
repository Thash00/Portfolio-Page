// script.js
// JavaScript for interactivity on the fitness learning website

// Nutrition API uses Nutritionix API (free, CORS-enabled)

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
        // Using Nutritionix API (free, CORS-enabled)
        const url = `https://www.nutritionix.com/api/v2/search/instant?query=${encodeURIComponent(foodQuery)}&limit=10`;
        
        console.log('API Request:', foodQuery);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.common && data.common.length > 0) {
            displayNutritionResults(data.common);
        } else if (data.branded && data.branded.length > 0) {
            displayNutritionResults(data.branded);
        } else {
            resultsContainer.innerHTML = '<div class="nutrition-error">Keine Lebensmittel gefunden. Versuchen Sie mit englischen Namen (z.B. "apple", "chicken breast", "brown rice").</div>';
        }
    } catch (error) {
        console.error('API Error:', error);
        resultsContainer.innerHTML = `<div class="nutrition-error">Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.</div>`;
    }
}

function displayNutritionResults(foods) {
    const resultsContainer = document.getElementById('nutritionResults');
    resultsContainer.innerHTML = '';
    
    foods.forEach(food => {
        // Get nutrition details for each food
        getDetailedNutrition(food, resultsContainer);
    });
}

async function getDetailedNutrition(food, resultsContainer) {
    try {
        const url = `https://www.nutritionix.com/api/v2/search/item?nix_id=${food.nix_id}`;
        const response = await fetch(url);
        const foodData = await response.json();
        
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        
        const nutrients = foodData.foods[0];
        const calories = Math.round(nutrients.nf_calories || 0);
        const protein = Math.round(nutrients.nf_protein || 0);
        const carbs = Math.round(nutrients.nf_total_carbohydrate || 0);
        const fat = Math.round(nutrients.nf_total_fat || 0);
        const fiber = Math.round(nutrients.nf_dietary_fiber || 0);
        const servingSize = Math.round(nutrients.nf_serving_size_qty || 100);
        
        foodCard.innerHTML = `
            <h4>${nutrients.food_name}</h4>
            <div class="food-info">
                <div class="nutrient">
                    <div class="nutrient-label">Kalorien (${servingSize}g)</div>
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
                    <div class="nutrient-label">Servierungsgröße</div>
                    <div class="nutrient-value">${servingSize}g</div>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(foodCard);
    } catch (error) {
        console.error('Error fetching detailed nutrition:', error);
    }
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

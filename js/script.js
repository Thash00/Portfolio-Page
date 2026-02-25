// script.js
// JavaScript for interactivity on the fitness learning website

// Function to display current date and time in UTC
function displayDateTime() {
    const now = new Date();
    const utcDateTime = now.toUTCString();
    if (document.getElementById('datetime')) {
        document.getElementById('datetime').innerText = utcDateTime;
    }
}

// Calorie Calculator Functions
async function searchFoodCalories(foodName) {
    const resultsContainer = document.getElementById('calorieResults');
    
    if (!foodName.trim()) {
        resultsContainer.innerHTML = '<div class="calorie-error">Bitte geben Sie ein Lebensmittel ein.</div>';
        return;
    }
    
    resultsContainer.innerHTML = '<div class="calorie-loading">Suche nach Lebensmitteln...</div>';
    
    try {
        // Open Food Facts API - kostenlos und CORS-enabled
        const url = `https://world.openfoodfacts.org/api/v0/products.json?search=${encodeURIComponent(foodName)}&page=1`;
        
        console.log('API Request:', foodName);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.products && data.products.length > 0) {
            // Filter products that have calorie information
            const productsWithCalories = data.products.filter(product => 
                product.energy_kcal_100g || product.nutrient_levels
            );
            
            if (productsWithCalories.length > 0) {
                displayCalorieResults(productsWithCalories.slice(0, 6)); // Show top 6 results
            } else {
                resultsContainer.innerHTML = '<div class="calorie-error">Keine Nährwertinformationen für dieses Lebensmittel gefunden. Versuchen Sie einen anderen Suchbegriff.</div>';
            }
        } else {
            resultsContainer.innerHTML = '<div class="calorie-error">Lebensmittel nicht gefunden. Versuchen Sie z.B. "apple", "chicken", "rice" oder "banana".</div>';
        }
    } catch (error) {
        console.error('API Error:', error);
        resultsContainer.innerHTML = '<div class="calorie-error">Fehler beim Abrufen der Daten. Bitte versuchen Sie es später erneut.</div>';
    }
}

function displayCalorieResults(products) {
    const resultsContainer = document.getElementById('calorieResults');
    resultsContainer.innerHTML = '';
    
    products.forEach(product => {
        const calorieCard = document.createElement('div');
        calorieCard.className = 'calorie-card';
        
        const calories = Math.round(product.energy_kcal_100g || 0);
        const protein = product.nutriments?.proteins_100g ? Math.round(product.nutriments.proteins_100g) : 'N/A';
        const carbs = product.nutriments?.carbohydrates_100g ? Math.round(product.nutriments.carbohydrates_100g) : 'N/A';
        const fat = product.nutriments?.fat_100g ? Math.round(product.nutriments.fat_100g) : 'N/A';
        const fiber = product.nutriments?.fiber_100g ? Math.round(product.nutriments.fiber_100g) : 'N/A';
        
        const productName = product.product_name || 'Unbekanntes Produkt';
        const brand = product.brands ? ` (${product.brands})` : '';
        
        calorieCard.innerHTML = `
            <h4>${productName}${brand}</h4>
            <div class="calorie-info">
                <div class="info-item">
                    <div class="info-label">Kalorien pro 100g</div>
                    <div class="info-value">${calories} kcal</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Protein</div>
                    <div class="info-value">${protein}g</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Kohlenhydrate</div>
                    <div class="info-value">${carbs}g</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fett</div>
                    <div class="info-value">${fat}g</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Ballaststoffe</div>
                    <div class="info-value">${fiber}g</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Land</div>
                    <div class="info-value">${product.countries || 'N/A'}</div>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(calorieCard);
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
    
    // Food Search event listeners
    const searchBtn = document.getElementById('searchFoodBtn');
    const foodInput = document.getElementById('foodInput');
    
    if (searchBtn && foodInput) {
        searchBtn.addEventListener('click', function() {
            searchFoodCalories(foodInput.value);
        });
        
        // Allow Enter key to trigger search
        foodInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchFoodCalories(foodInput.value);
            }
        });
    }
};

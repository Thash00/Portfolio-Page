document.addEventListener('DOMContentLoaded', () => {

    // --- Slideshow Functionality ---
    const slideshowImages = document.querySelectorAll('.slideshow img');
    let currentSlide = 0;
    const totalSlides = slideshowImages.length;

    if (totalSlides > 0) {
        // Show the first slide initially
        slideshowImages[currentSlide].classList.add('active');

        const nextButton = document.querySelector('.next');
        const prevButton = document.querySelector('.prev');

        // Next Slide Function
        const nextSlide = () => {
            slideshowImages[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % totalSlides;
            slideshowImages[currentSlide].classList.add('active');
        };

        // Previous Slide Function
        const prevSlide = () => {
            slideshowImages[currentSlide].classList.remove('active');
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; // Handles wrapping around
            slideshowImages[currentSlide].classList.add('active');
        };

        // Event Listeners for buttons
        if (nextButton) {
            nextButton.addEventListener('click', nextSlide);
        }
        if (prevButton) {
            prevButton.addEventListener('click', prevSlide);
        }

        // Optional: Auto-slide every 5 seconds
        // const autoSlideInterval = setInterval(nextSlide, 5000);

        // Cleanup interval when component is removed or page unloads (if using frameworks)
        // For a simple static site, this might not be strictly necessary.
        // return () => clearInterval(autoSlideInterval);
    }

    // --- API Integration Placeholder ---
    const apiDataContainer = document.getElementById('api-data');

    // Replace with your actual API endpoint and logic
    const fetchApiData = async () => {
        if (!apiDataContainer) return; // Exit if the element doesn't exist on the page

        try {
            // Example: Fetching data from a public API (e.g., a quote API)
            // You'll need to find an API that suits your needs.
            // For demonstration, let's use a placeholder API.
            // const response = await fetch('https://api.example.com/data');
            // const data = await response.json();

            // Placeholder data:
            const placeholderData = {
                message: "This section will display data from an external API.",
                details: "For example, it could show the latest news, weather, or your GitHub stats."
            };

            if (apiDataContainer) {
                apiDataContainer.innerHTML = `
                    <h3>API Example</h3>
                    <p>${placeholderData.message}</p>
                    <p>${placeholderData.details}</p>
                    <p><small>Note: Replace this with actual API call.</small></p>
                `;
            }

            // Example of how to use fetched data:
            // if (apiDataContainer && data.someProperty) {
            //     apiDataContainer.innerHTML = `<h2>${data.title}</h2><p>${data.description}</p>`;
            // } else {
            //     apiDataContainer.innerHTML = '<p>Could not fetch API data.</p>';
            // }

        } catch (error) {
            console.error('Error fetching API data:', error);
            if (apiDataContainer) {
                apiDataContainer.innerHTML = '<p>Failed to load data from API. Please try again later.</p>';
            }
        }
    };

    // Call the function to fetch data when the page loads
    fetchApiData();

    // --- Contact Form Submission (Basic Example) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            console.log('Form Submitted:');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Message:', message);

            // In a real application, you would send this data to a server
            // using fetch() or XMLHttpRequest to a backend endpoint.
            // For now, we'll just log it and show a confirmation.

            alert('Thank you for your message, ' + name + '! I will get back to you soon.');

            // Optionally clear the form
            contactForm.reset();
        });
    }

});

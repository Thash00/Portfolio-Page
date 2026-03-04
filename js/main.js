// Slideshow Logik (nur ausführen, wenn wir auf der Hobbies-Seite sind)
let slideIndex = 1;

function showSlides(n) {
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return; // Beendet Funktion, wenn keine Slides da sind

    if (n > slides.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = slides.length}
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

// Initialisierung
if (document.getElementsByClassName("mySlides").length > 0) {
    showSlides(slideIndex);
    // Auto-Slide alle 5 Sekunden
    setInterval(() => plusSlides(1), 5000);
}

// Formular-Handling (für Kontaktseite)
const form = document.getElementById('contact-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Danke für deine Nachricht! (Dies ist eine Demo)');
        form.reset();
    });
}
// script.js
// JavaScript for interactivity on the portfolio page

// Function to display current date and time in UTC
function displayDateTime() {
    const now = new Date();
    const utcDateTime = now.toUTCString();
    document.getElementById('datetime').innerText = utcDateTime;
}

// Call the function on page load
window.onload = function() {
    displayDateTime();
};
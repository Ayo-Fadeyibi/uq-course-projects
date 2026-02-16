// Get references to the image and text elements in the carousel
const carouselImage = document.getElementById("ImgMen");
const carouselText = document.getElementById("MenP");

// Track the current index of the carousel
let index = 0;

// Array of promotional texts to display
const texts = [
    "Discover the latest styles in men's sneakers.",
    "Step up your game with Adidas classics.",
    "Experience the evolution of Air Jordans.",
    "Exclusive drops now available!"
];

// Array of image paths to show in the carousel
const images = [
    "./Images/Models/Zinoleesky.jpg",
    "./Images/Models/AdidasModel.jpg"
];

// Use the minimum length to prevent accessing undefined items
const carouselLength = Math.min(texts.length, images.length);

// Start automatic sliding every 5 seconds
let autoSlideInterval = setInterval(Next, 5000);

// Function to update the carousel content (image and text)
function displayCarousel() {
    carouselText.innerHTML = texts[index];
    carouselImage.src = images[index];
}

// Display the first item initially
displayCarousel();

// Reset and restart the auto-slide timer (called after manual nav)
function resetAutoSlide() {
    clearInterval(autoSlideInterval);           // Stop current timer
    autoSlideInterval = setInterval(Next, 5000); // Restart it
}

// Function to show the previous carousel item
function Prev() {
    index = (index - 1 + carouselLength) % carouselLength; // Loop around if needed
    displayCarousel();   // Update UI
    resetAutoSlide();    // Reset timer
}

// Function to show the next carousel item
function Next() {
    index = (index + 1) % carouselLength; // Loop to start if at the end
    displayCarousel();   // Update UI
    resetAutoSlide();    // Reset timer
}

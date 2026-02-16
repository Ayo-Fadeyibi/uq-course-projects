// === Functionality for the Main Carousel ===

// Get DOM elements for the animated heading and image
let h1 = document.getElementById("h1");
let Img = document.getElementById("image");

// Track the current index in the carousel
let currentIndex = 0;

// Automatically advance slides every 5 seconds
let timer = setInterval(NextSlide, 5000);

// Text, image, and color arrays for the carousel content
const text = [
    "NIKE AIR JORDAN HIGH-TOP SNEAKER",
    "NIKE DUNK LOW RETRO PANDA",
    "NIKE AIR JORDAN LEGACY 312 LOW"
];

const image = [
    "./Images/Anim/Air-Jordan-anim.png",
    "./Images/Anim/Air-Jordan-anim2.png",
    "./Images/Anim/Air-Jordan-anim3.png"
];

const color = [
    "rgb(130, 6, 6)",
    "rgb(0,0,0)",
    "rgb(9, 9, 158)"
];

// Function to update the current carousel display
function displayImageText() {
    // Remove animation classes to restart them
    h1.classList.remove("fade-in");
    Img.classList.remove("move-in");

    // Force reflow (hack to retrigger CSS animations)
    void h1.offsetWidth;
    void Img.offsetWidth;

    // Update the text and image content
    h1.innerHTML = text[currentIndex];
    Img.src = image[currentIndex];

    // Dynamically change the CSS variable for background color
    document.documentElement.style.setProperty('--after-bg', color[currentIndex]);

    // Re-add animation classes to trigger fade/move effects
    h1.classList.add("fade-in");
    Img.classList.add("move-in");
}

// Show the initial slide
displayImageText();

// Navigate to the previous slide
function PrevSlide() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = text.length - 1; // Wrap around to the last slide
    }
    displayImageText();
}

// Navigate to the next slide
function NextSlide() {
    clearInterval(timer); // Stop current auto-slide
    currentIndex++;
    if (currentIndex >= text.length) {
        currentIndex = 0; // Wrap around to the first slide
    }
    displayImageText();
    timer = setInterval(NextSlide, 5000); // Restart auto-slide
}


// === Functionality for the "Most Popular" Horizontal Slider ===

// Get DOM elements for the slider and navigation buttons
const slider = document.querySelector(".slide-track");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

// Track the index of the currently visible slide
let curentIndex = 0;

// Calculate total number of slides and the width of one slide (plus margin)
const totalSlides = document.querySelectorAll(".Sneaker").length;
const slideWidth = document.querySelector(".Sneaker").offsetWidth + 20; // 20px assumed margin/gap

// Automatically move to the next slide every 3 seconds
let autoSlide = setInterval(moveNext, 3000);

// Function to move slider forward
function moveNext() {
    curentIndex = (curentIndex + 1) % totalSlides;
    slider.style.transform = `translateX(-${curentIndex * slideWidth}px)`;
}

// Function to move slider backward
function movePrev() {
    curentIndex = (curentIndex - 1 + totalSlides) % totalSlides;
    slider.style.transform = `translateX(-${curentIndex * slideWidth}px)`;
}

// Pause and restart auto-slide after manual navigation
function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(moveNext, 5000); // Restart with 5s delay
}

// Set up click handlers for navigation buttons
nextBtn.addEventLi

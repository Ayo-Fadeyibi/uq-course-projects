// Wait until the DOM is fully loaded before executing script
document.addEventListener('DOMContentLoaded', function () {

    // Function to initialize a horizontal slider with navigation and auto-scroll
    function initializeSlider(sliderId, nextBtnId, prevBtnId, sneakerClass) {
        // Get the slider container and its corresponding navigation buttons
        const slider = document.getElementById(sliderId);
        const nextBtn = document.getElementById(nextBtnId);
        const prevBtn = document.getElementById(prevBtnId);

        // Check if essential elements exist; log error and exit if not
        if (!slider || !nextBtn || !prevBtn) {
            console.error(`Slider or buttons with ids: ${sliderId}, ${nextBtnId}, ${prevBtnId} not found.`);
            return;
        }

        // Index to track the current slide
        let rentIndex = 0;

        // Get the number of slide items using the provided class
        const totalSlides = document.querySelectorAll(`.${sneakerClass}`).length;

        // Ensure slides are present before proceeding
        if (totalSlides === 0) {
            console.error(`No slides found with class: ${sneakerClass}`);
            return;
        }

        // Calculate the width of each slide including margin/padding (assumed +20px)
        const slideWidth = document.querySelector(`.${sneakerClass}`).offsetWidth + 20;

        // Start auto-slide to move to next slide every 3 seconds
        let autoSlide = setInterval(moveNext, 3000);

        // Function to move slider to the next item
        function moveNext() {
            rentIndex = (rentIndex + 1) % totalSlides; // Loop to beginning when reaching end
            slider.style.transform = `translateX(-${rentIndex * slideWidth}px)`;
        }

        // Function to move slider to the previous item
        function movePrev() {
            rentIndex = (rentIndex - 1 + totalSlides) % totalSlides; // Loop to end when at start
            slider.style.transform = `translateX(-${rentIndex * slideWidth}px)`;
        }

        // Function to reset the auto-slide timer after manual interaction
        function resetAutoSlide() {
            clearInterval(autoSlide);
            autoSlide = setInterval(moveNext, 5000); // Restart with 5s delay after interaction
        }

        // Attach click listeners for navigation buttons
        nextBtn.addEventListener("click", () => {
            moveNext();
            resetAutoSlide();
        });

        prevBtn.addEventListener("click", () => {
            movePrev();
            resetAutoSlide();
        });
    }

    // Initialize multiple sliders by passing different IDs and class names
    initializeSlider("SlideTrack1", "nextButn1", "prevButn1", "sneaker1");
    initializeSlider("SlideTrack2", "nextButn2", "prevButn2", "sneaker2");
});

// Function for sticky Navigation
const Navi = document.querySelector(".Nav");

// Add scroll event listener to the window
window.addEventListener("scroll", () => {
    // If the page is scrolled more than 200px from the top, make the navbar sticky
    if (window.scrollY > 200) {
        Navi.classList.add("fixed-nav"); // Add class to make nav fixed (CSS should handle positioning)
    } else {
        Navi.classList.remove("fixed-nav"); // Remove class when scrolled back up
    }
});


// Function to animate hamburger Menu (mobile navigation toggle)
function toggleMenu() {
    // Toggle the 'active' class on the hamburger bar icon (for animation)
    document.querySelector(".Bar").classList.toggle("active");

    // Toggle the 'Active' class on the navigation menu (to show/hide links)
    document.querySelector(".navigation_UnorderedList").classList.toggle("Active");
}

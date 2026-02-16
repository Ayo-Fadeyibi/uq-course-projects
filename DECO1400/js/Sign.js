// === Function to animate the SignIn/SignUp Page toggle ===

// Get the element that wraps the sign-in and sign-up forms
let mini = document.getElementById("Mini");

// Function to activate the Sign-Up view
function moveSignUp() {
    // Remove the class that hides the sign-up form
    mini.classList.remove("signup-inactive");
    // Add the class that shows the sign-up form with animation
    mini.classList.add("signup-active");
}

// Function to activate the Sign-In view
function moveSignIn() {
    // Remove the class that shows the sign-up form
    mini.classList.remove("signup-active");
    // Add the class that shows the sign-in form with animation
    mini.classList.add("signup-inactive");
}

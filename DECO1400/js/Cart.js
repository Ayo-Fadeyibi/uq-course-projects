// Function to increase, decrease, and update the shopping cart
document.addEventListener("DOMContentLoaded", function () {
    // Get all the minus, plus, and remove buttons, and the total price element
    const minusBtns = document.querySelectorAll(".minus");
    const plusBtns = document.querySelectorAll(".plus");
    const removeBtns = document.querySelectorAll(".remove");
    const totalPriceEl = document.getElementById("total-price");

    // Function to update the total price of all items in the cart
    function updateTotal() {
        let total = 0;

        // Loop through each cart item to calculate the total cost
        document.querySelectorAll(".cart-item").forEach(item => {
            // Extract the item price and quantity
            const price = parseFloat(item.querySelector("p").innerText.replace("$", ""));
            const quantity = parseInt(item.querySelector(".item-qty").innerText);
            
            // Add item's total to the cart total
            total += price * quantity;
        });

        // Display the updated total price
        totalPriceEl.innerText = `$${total}`;
    }

    // Add event listeners to all "plus" buttons
    plusBtns.forEach(button => {
        button.addEventListener("click", function () {
            // Find the quantity element and increase its value
            let qtyEl = this.previousElementSibling;
            qtyEl.innerText = parseInt(qtyEl.innerText) + 1;

            // Update the total price after increasing quantity
            updateTotal();
        });
    });

    // Add event listeners to all "minus" buttons
    minusBtns.forEach(button => {
        button.addEventListener("click", function () {
            // Find the quantity element and decrease its value if greater than 1
            let qtyEl = this.nextElementSibling;
            if (parseInt(qtyEl.innerText) > 1) {
                qtyEl.innerText = parseInt(qtyEl.innerText) - 1;

                // Update the total price after decreasing quantity
                updateTotal();
            }
        });
    });

    // Add event listeners to all "remove" buttons
    removeBtns.forEach(button => {
        button.addEventListener("click", function () {
            // Remove the cart item from the DOM
            this.parentElement.remove();

            // Update the total price after item removal
            updateTotal();
        });
    });

    // Initial total update when the page is loaded
    updateTotal();
});

// This is the final and correct version of checkout.js with validation

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENT SELECTORS ---
  const shippingForm = document.getElementById("shipping-form");
  const paymentForm = document.getElementById("payment-form");
  const placeOrderBtn = document.getElementById("place-order-btn");
  const shippingSubmitBtn = document.getElementById("shipping-submit-btn");

  const steps = {
    1: document.getElementById("shipping-step"),
    2: document.getElementById("payment-step"),
    3: document.getElementById("review-step"),
  };
  const stepIndicators = {
    1: document.getElementById("step-1"),
    2: document.getElementById("step-2"),
    3: document.getElementById("step-3"),
  };

  const summaryItems = document.getElementById("summary-items");
  const summaryTotal = document.getElementById("summary-total");

  // --- STATE ---
  let shippingData = {};
  let paymentData = {};

  // --- FORM VALIDATION LOGIC ---
  const inputs = shippingForm.querySelectorAll("input[required]");

  function validateShippingForm() {
    let isFormValid = true;
    inputs.forEach((input) => {
      // Run validation on each input and track if any are invalid
      if (!validateInput(input)) {
        isFormValid = false;
      }
    });
    // Enable or disable the button based on the overall form validity
    shippingSubmitBtn.disabled = !isFormValid;
  }

  function validateInput(input) {
    const errorSpan = input.nextElementSibling; // The <span> right after the <input>
    let isValid = true;
    let errorMessage = "";

    // Rule 1: Field must not be empty
    if (input.value.trim() === "") {
      isValid = false;
      // Get the label text for a dynamic error message
      errorMessage = `${input.previousElementSibling.textContent} is required.`;
    }
    // Rule 2 (Example): ZIP code must be at least 5 digits
    else if (input.id === "zip" && !/^\d{5,}$/.test(input.value)) {
      isValid = false;
      errorMessage = "Please enter a valid ZIP code (at least 5 digits).";
    } else if (input.id === "phoneNumber" && !/^\+?[1-9]\d{1,14}$/.test(input.value)) {
      isValid = false;
      errorMessage = "Please enter a valid phone number (e.g., +11234567890).";
    }

    if (!isValid) {
      input.classList.add("invalid");
      input.classList.remove("valid");
      errorSpan.textContent = errorMessage;
      errorSpan.style.display = "block";
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      errorSpan.style.display = "none";
    }
    return isValid;
  }

  // Add event listeners to each input for real-time feedback
  inputs.forEach((input) => {
    input.addEventListener("input", () => validateShippingForm());
  });

  // --- NAVIGATION & SUBMIT LOGIC ---
  function goToStep(stepNumber) {
    Object.values(steps).forEach((step) => (step.style.display = "none"));
    Object.values(stepIndicators).forEach((indicator) =>
      indicator.classList.remove("active")
    );
    steps[stepNumber].style.display = "block";
    stepIndicators[stepNumber].classList.add("active");
  }

  shippingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(shippingForm);
    shippingData = Object.fromEntries(formData.entries());
    goToStep(2);
  });

  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(paymentForm);
    paymentData = Object.fromEntries(formData.entries());
    populateReviewDetails();
    goToStep(3);
  });

  function populateReviewDetails() {
    const reviewDetails = document.getElementById("review-details");
    reviewDetails.innerHTML = `
            <h4>Shipping To:</h4>
            <p>${shippingData.fullName}<br>${shippingData.address}<br>${
      shippingData.city
    }, ${shippingData.zip}</p>
            <hr>
            <h4>Payment Method:</h4>
            <p>Card ending in ${paymentData.cardNumber.slice(-4)}</p>
        `;
  }

  placeOrderBtn.addEventListener("click", async () => {
    // ... (This part is correct from the previous step)
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    const token = localStorage.getItem("authToken");
    if (cart.length === 0 || !token) {
      alert("Your cart is empty or you are not logged in.");
      return;
    }
    const orderData = {
      cart: cart,
      shippingAddress: shippingData,
      totalPrice: parseFloat(summaryTotal.textContent.replace("$", "")),
    };
    try {
      const response = await fetch("http://localhost:3000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.removeItem("shoppingCart");
        window.location.href = `order-confirmation.html?orderId=${result.orderId}`;
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Could not place order. Please try again.");
    }
  });

  // --- INITIALIZATION ---
  async function renderSummary() {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    if (
      cart.length === 0 &&
      window.location.pathname.endsWith("checkout.html")
    ) {
      alert("Your cart is empty. Returning to shop.");
      window.location.href = "shop.html";
      return;
    }

    let subtotal = 0;
    summaryItems.innerHTML = "";

    for (const item of cart) {
      const product = await (
        await fetch(`http://localhost:3000/api/products/${item.id}`)
      ).json();
      if (product) {
        subtotal += product.price * item.quantity;
        summaryItems.innerHTML += `<div class="summary-item"><span class="item-name">${
          product.name
        } (x${item.quantity})</span><span>$${(
          product.price * item.quantity
        ).toFixed(2)}</span></div>`;
      }
    }
    summaryTotal.textContent = `$${subtotal.toFixed(2)}`;
  }

  // Run all initialization functions
  renderSummary();
  validateShippingForm(); // Initialize the button state on page load
  goToStep(1);
});

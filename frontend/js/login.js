// This is the complete and final code for frontend/js/login.js

document.addEventListener("DOMContentLoaded", () => {
  // Select the form and the message area
  const loginForm = document.getElementById("login-form");
  const formMessage = document.getElementById("form-message");

  // Add an event listener for the form submission
  loginForm.addEventListener("submit", async (event) => {
    // Prevent the default form action
    event.preventDefault();

    // Clear any previous messages
    formMessage.innerHTML = "";
    formMessage.className = "form-message";

    // 1. Get the form data
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    // 2. Send the data to the backend API
    try {
      // UPDATED: Now points to your live Render backend
      const response = await fetch("https://ashfit.onrender.com/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // 3. Handle the response from the backend
      if (response.ok) {
        // Success: The backend sent back a token and user data
        // Store the token for session management
        localStorage.setItem("authToken", result.token);
        // Store the user data as a JSON string
        localStorage.setItem("userData", JSON.stringify(result.user));

        formMessage.textContent = "Login successful! Redirecting...";
        formMessage.classList.add("success");

        // Short delay before moving to home page so user sees the success message
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        // Error: e.g., invalid credentials
        formMessage.textContent =
          result.message || "An error occurred. Please try again.";
        formMessage.classList.add("error");
      }
    } catch (error) {
      // Handle network errors
      console.error("Login failed:", error);
      formMessage.textContent =
        "Could not connect to the server. Please check your connection.";
      formMessage.classList.add("error");
    }
  });
});
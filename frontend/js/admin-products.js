// This is the complete and final code for frontend/js/admin-products.js

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENT SELECTORS ---
  const token = localStorage.getItem("authToken");
  const productsTbody = document.getElementById("products-tbody");
  const modal = document.getElementById("product-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const addProductBtn = document.getElementById("add-product-btn");
  const productForm = document.getElementById("product-form");
  const modalTitle = document.getElementById("modal-title");
  const productIdInput = document.getElementById("productId"); // Hidden input

  // --- 1. FETCH & DISPLAY LOGIC ---

  // Fetches all products from the public API
  async function fetchProducts() {
    try {
      const response = await fetch("http://localhost:3000/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const products = await response.json();
      renderProducts(products);
    } catch (error) {
      console.error("Fetch products error:", error);
      productsTbody.innerHTML = `<tr><td colspan="6">Error loading products.</td></tr>`;
    }
  }

  // Renders the list of products into the table
  function renderProducts(products) {
    productsTbody.innerHTML = "";
    products.forEach((product) => {
      const row = document.createElement("tr");
      row.setAttribute("data-product-id", product.id);
      row.innerHTML = `
    <td data-label="Image"><img src="images/${product.image_url}" alt="${product.name}" width="50"></td>
    <td data-label="Name">${product.name}</td>
    <td data-label="Category">${product.category}</td>
    <td data-label="Price">$${product.price}</td>
    <td data-label="Stock">${product.stock}</td>
    <td data-label="Actions">
        <button class="edit-btn" data-id="${product.id}">Edit</button>
        <button class="delete-btn" data-id="${product.id}">Delete</button>
    </td>
`;
      productsTbody.appendChild(row);
    });
  }

  // --- 2. MODAL & FORM LOGIC ---

  // Opens the modal. If a product object is passed, it fills the form for editing.
  function openModal(product = null) {
    productForm.reset(); // Clear any old data
    if (product) {
      // EDIT MODE
      modalTitle.textContent = "Edit Product";
      productIdInput.value = product.id;
      document.getElementById("name").value = product.name;
      document.getElementById("category").value = product.category;
      document.getElementById("price").value = product.price;
      document.getElementById("stock").value = product.stock;
      document.getElementById("image_url").value = product.image_url;
      document.getElementById("description").value = product.description;
    } else {
      // ADD NEW MODE
      modalTitle.textContent = "Add New Product";
      productIdInput.value = ""; // Ensure the hidden ID is empty
    }
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("active"), 10);
  }

  // Closes the modal
  function closeModal() {
    modal.classList.remove("active");
    setTimeout(() => (modal.style.display = "none"), 300);
  }

  // --- 3. EVENT LISTENERS ---

  // Open modal to add a new product
  addProductBtn.addEventListener("click", () => openModal());

  // Close modal with 'X' button or by clicking the background
  modalCloseBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  // Handle the form submission for both creating and updating
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const data = Object.fromEntries(formData.entries());
    const productId = data.productId;

    // Determine if this is a new product (POST) or an update (PUT)
    const method = productId ? "PUT" : "POST";
    const url = productId
      ? `http://localhost:3000/api/admin/products/${productId}`
      : "http://localhost:3000/api/admin/products";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token, // Send the admin's auth token
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      alert(result.message); // Show success/error message from backend

      if (response.ok) {
        closeModal();
        fetchProducts(); // Refresh the product list
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("An error occurred while saving the product.");
    }
  });

  // Handle clicks on the 'Edit' and 'Delete' buttons in the table
  productsTbody.addEventListener("click", async (event) => {
    const target = event.target;
    const id = target.dataset.id;

    // --- EDIT LOGIC ---
    if (target.classList.contains("edit-btn")) {
      // Fetch the full details for this one product
      const response = await fetch(`http://localhost:3000/api/products/${id}`);
      const product = await response.json();
      // Open the modal and pre-fill it with this product's data
      openModal(product);
    }

    // --- DELETE LOGIC ---
    if (target.classList.contains("delete-btn")) {
      if (
        confirm("Are you sure you want to permanently delete this product?")
      ) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/admin/products/${id}`,
            {
              method: "DELETE",
              headers: { "x-auth-token": token }, // Prove we are an admin
            }
          );
          const result = await response.json();
          alert(result.message);
          if (response.ok) {
            fetchProducts(); // Refresh the product list
          }
        } catch (error) {
          alert("Error deleting product.");
        }
      }
    }
  });

  // --- 4. INITIALIZATION ---
  // Fetch and display all products when the page first loads
  fetchProducts();
});

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

  async function fetchProducts() {
    try {
      const response = await fetch("https://ashfit.onrender.com/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const products = await response.json();
      renderProducts(products);
    } catch (error) {
      console.error("Fetch products error:", error);
      productsTbody.innerHTML = `<tr><td colspan="6">Error loading products.</td></tr>`;
    }
  }

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

  function openModal(product = null) {
    productForm.reset(); 
    if (product) {
      modalTitle.textContent = "Edit Product";
      productIdInput.value = product.id;
      document.getElementById("name").value = product.name;
      document.getElementById("category").value = product.category;
      document.getElementById("price").value = product.price;
      document.getElementById("stock").value = product.stock;
      document.getElementById("image_url").value = product.image_url;
      document.getElementById("description").value = product.description;
    } else {
      modalTitle.textContent = "Add New Product";
      productIdInput.value = ""; 
    }
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("active"), 10);
  }

  function closeModal() {
    modal.classList.remove("active");
    setTimeout(() => (modal.style.display = "none"), 300);
  }

  addProductBtn.addEventListener("click", () => openModal());
  modalCloseBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const data = Object.fromEntries(formData.entries());
    const productId = data.productId;

    const method = productId ? "PUT" : "POST";
    const url = productId
      ? `https://ashfit.onrender.com/api/admin/products/${productId}`
      : "https://ashfit.onrender.com/api/admin/products";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      alert(result.message);

      if (response.ok) {
        closeModal();
        fetchProducts(); 
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("An error occurred while saving the product.");
    }
  });

  productsTbody.addEventListener("click", async (event) => {
    const target = event.target;
    const id = target.dataset.id;

    if (target.classList.contains("edit-btn")) {
      const response = await fetch(`https://ashfit.onrender.com/api/products/${id}`);
      const product = await response.json();
      openModal(product);
    }

    if (target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to permanently delete this product?")) {
        try {
          const response = await fetch(
            `https://ashfit.onrender.com/api/admin/products/${id}`,
            {
              method: "DELETE",
              headers: { "x-auth-token": token }, 
            }
          );
          const result = await response.json();
          alert(result.message);
          if (response.ok) {
            fetchProducts(); 
          }
        } catch (error) {
          alert("Error deleting product.");
        }
      }
    }
  });

  fetchProducts();
});
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>NectarGlow Products</title>
</head>
<body>

<h2>Products</h2>

<div id="status"></div>
<div id="products"></div>

<script>
const API = "https://nectarglow.onrender.com/api";
const token = localStorage.getItem("token");

const statusDiv = document.getElementById("status");
const productsDiv = document.getElementById("products");

statusDiv.innerText = "Loading products...";

fetch(`${API}/products`)
  .then(res => {
    console.log("Response status:", res.status);
    return res.json();
  })
  .then(products => {
    console.log("Products response:", products);

    if (!Array.isArray(products) || products.length === 0) {
      statusDiv.innerText = "No products available";
      return;
    }

    statusDiv.innerText = "";

    products.forEach(p => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.margin = "10px";
      div.style.padding = "10px";

      div.innerHTML = `
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>
        <button onclick="addToCart('${p.id}')">Add to Cart</button>
      `;

      productsDiv.appendChild(div);
    });
  })
  .catch(err => {
    console.error("Fetch error:", err);
    statusDiv.innerText = "Failed to load products";
  });

function addToCart(productId) {
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  fetch(`${API}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      product_id: productId,
      quantity: 1
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      alert("Added to cart");
    }
  });
}
</script>

</body>
</html>

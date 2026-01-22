const API = "https://nectarglow.onrender.com/api";

/* =======================
   ADMIN LOGIN
======================= */

function adminLogin() {
  const emailOrMobile = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailOrMobile.includes("@") ? emailOrMobile : undefined,
      mobile: emailOrMobile.includes("@") ? undefined : emailOrMobile,
      password
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.token) {
      document.getElementById("error").innerText = "Invalid login";
      return;
    }

    // Decode token payload (simple check)
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    if (payload.role !== "ADMIN") {
      document.getElementById("error").innerText = "Not an admin account";
      return;
    }

    localStorage.setItem("adminToken", data.token);
    window.location.href = "admin-dashboard.html";
  });
}

/* =======================
   AUTH HELPERS
======================= */

function getToken() {
  return localStorage.getItem("adminToken");
}

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin-login.html";
}

/* =======================
   ADD PRODUCT
======================= */

function addProduct() {
  fetch(`${API}/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      name: document.getElementById("pname").value,
      price: document.getElementById("pprice").value,
      description: document.getElementById("pdesc").value
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("productMsg").innerText =
      data.message || "Product added";
  });
}

/* =======================
   LOAD ORDERS
======================= */

if (window.location.pathname.includes("admin-dashboard")) {
  fetch(`${API}/admin/orders`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  })
  .then(res => res.json())
  .then(orders => {
    const div = document.getElementById("orders");

    orders.forEach(o => {
      div.innerHTML += `
        <div style="border:1px solid #ccc; margin:10px; padding:10px;">
          <b>Order ID:</b> ${o.id}<br>
          <b>Email:</b> ${o.email}<br>
          <b>Total:</b> ₹${o.total}<br>
          <b>Status:</b> ${o.status}<br>
          <button onclick="viewOrder('${o.id}')">View Items</button>
          <div id="items-${o.id}"></div>
        </div>
      `;
    });
  });
}

/* =======================
   VIEW ORDER ITEMS
======================= */

function viewOrder(orderId) {
  fetch(`${API}/admin/orders/${orderId}`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  })
  .then(res => res.json())
  .then(items => {
    const div = document.getElementById(`items-${orderId}`);
    div.innerHTML = "";

    items.forEach(i => {
      div.innerHTML += `
        <p>${i.name} - ₹${i.price} × ${i.quantity}</p>
      `;
    });
  });
}

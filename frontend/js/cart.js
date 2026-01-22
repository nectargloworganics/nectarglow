const API = "https://nectarglow.onrender.com/api";
const token = localStorage.getItem("token");

fetch(`${API}/cart`, {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
.then(res => res.json())
.then(items => {
  let total = 0;
  const div = document.getElementById("cart");

  items.forEach(i => {
    total += Number(i.total);
    div.innerHTML += `
      <div>
        ${i.name} - ₹${i.price} × ${i.quantity} = ₹${i.total}
      </div>
    `;
  });

  document.getElementById("grandTotal").innerText =
    `Grand Total: ₹${total}`;
});

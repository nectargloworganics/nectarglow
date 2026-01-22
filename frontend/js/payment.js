const API = "https://nectarglow.onrender.com/api";
const token = localStorage.getItem("token");
const ORDER_ID = localStorage.getItem("order_id");

const statusEl = document.getElementById("status");

function payNow() {
  if (!ORDER_ID) {
    alert("Order not found");
    return;
  }

  statusEl.innerText = "Preparing secure payment, please wait...";

  fetch(`${API}/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ order_id: ORDER_ID })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.razorpayOrderId) {
      statusEl.innerText = "Payment initialization failed";
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "NectarGlow",
      description: "Order Payment",
      order_id: data.razorpayOrderId,
      handler: function (response) {
        verifyPayment(response);
      }
    };

    statusEl.innerText = "";
    new Razorpay(options).open();
  });
}

function verifyPayment(response) {
  statusEl.innerText = "Verifying payment...";

  fetch(`${API}/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      order_id: ORDER_ID,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || "Payment successful");
    window.location.href = "orders.html";
  });
}

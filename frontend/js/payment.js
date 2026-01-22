const API = "https://nectarglow.onrender.com/api";

// Must already be set during checkout
const token = localStorage.getItem("token");
const ORDER_ID = localStorage.getItem("order_id");

function payNow() {
  if (!ORDER_ID) {
    alert("Order not found");
    return;
  }

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
      alert("Failed to initiate payment");
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

    const rzp = new Razorpay(options);
    rzp.open();
  });
}

function verifyPayment(response) {
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

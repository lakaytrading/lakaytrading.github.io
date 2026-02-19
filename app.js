
const tokenList = document.getElementById("tokenList");
const tokenSelect = document.getElementById("tokenSelect");
const priceDisplay = document.getElementById("priceDisplay");

const tokens = {
  "BASE ETH": { price: 115500, balance: 0.82, logo: "logos/eth.png" },
  "POL": { price: 12, balance: 100, logo: "logos/pol.png" },
  "HBAR": { price: 11, balance: 200, logo: "logos/hbar.png" },
  "SOL": { price: 5500, balance: 1, logo: "logos/solana.png" },
  "RON": { price: 12, balance: 100, logo: "logos/ronin.png" }
};

tokenList.innerHTML = "";

for (let t in tokens) {
  const token = tokens[t];
  const div = document.createElement("div");
  div.className = "tokenItem";
  div.innerHTML = `
    <div class="tokenHeader">
      <img src="${token.logo}" alt="${t} logo">
      ${t} - ₱${token.price}
    </div>
    <div>Available: ${token.balance}</div>
  `;
  tokenList.appendChild(div);
  tokenSelect.innerHTML += `<option value="${t}">${t}</option>`;
}


function updatePrice() {
  const selected = tokenSelect.value;
  priceDisplay.value = "₱" + tokens[selected].price;
}
updatePrice();

tokenSelect.addEventListener("change", updatePrice);

const amount = document.getElementById("amount");
const quantity = document.getElementById("quantity");
const total = document.getElementById("total");

function calculateFromAmount() {
  const selected = tokenSelect.value;
  const price = tokens[selected].price;
  quantity.value = (amount.value / price).toFixed(6);
  total.value = amount.value;
}

function calculateFromQuantity() {
  const selected = tokenSelect.value;
  const price = tokens[selected].price;
  amount.value = (quantity.value * price).toFixed(2);
  total.value = amount.value;
}

amount.addEventListener("input", calculateFromAmount);
quantity.addEventListener("input", calculateFromQuantity);

const modal = document.getElementById("modal");
const payBtn = document.getElementById("payBtn");
const confirmBtn = document.getElementById("confirmBtn");
const form = document.getElementById("orderForm");

payBtn.onclick = () => {
  if (!amount.value || !quantity.value) {
    alert("Please enter amount or quantity.");
    return;
  }
  modal.style.display = "flex";
};

const orderSentModal = document.getElementById("orderSentModal");
const closeOrderModalBtn = document.getElementById("closeOrderModal");

confirmBtn.onclick = () => {
  const firstName = form.first_name.value;
  const lastName = form.last_name.value;
  const email = form.email.value;
  const gcash = form.gcash_number.value;
  const wallet = form.wallet_address.value;
  const token = tokenSelect.value;
  const price = tokens[token].price;
  const amt = amount.value;
  const qty = quantity.value;

  const subject = encodeURIComponent("New Order - LAKAY TRADING");
  const body = encodeURIComponent(
    `Name: ${firstName} ${lastName}\n` +
    `Email: ${email}\n` +
    `GCash Number: ${gcash}\n` +
    `Wallet Address: ${wallet}\n` +
    `Token: ${token}\n` +
    `Price: ₱${price}\n` +
    `Amount Paid: ₱${amt}\n` +
    `Quantity: ${qty}`
  );

  modal.style.display = "none";

  window.location.href = `mailto:lakayfarming@gmail.com?subject=${subject}&body=${body}`;

  orderSentModal.style.display = "flex";
};

closeOrderModalBtn.onclick = () => {
  orderSentModal.style.display = "none";
};

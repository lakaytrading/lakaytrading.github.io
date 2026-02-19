
const tokenList = document.getElementById("tokenList");
const tokenSelect = document.getElementById("tokenSelect");
const priceDisplay = document.getElementById("priceDisplay");

const tokens = {
  "BASE ETH": {
    price: 115500,
    chain: "evm",
    rpc: "https://mainnet.base.org",
    wallet: "0x867B141B909a5baA9245D80ce49425050aF8F7B5",
    logo: "logos/eth.png",
    balance: 0
  },

  "POL": {
    price: 12,
    chain: "evm",
    rpc: "https://rpc.ankr.com/polygon",
    wallet: "0x867B141B909a5baA9245D80ce49425050aF8F7B5",
    logo: "logos/pol.png",
    balance: 0
  },

  "RON": {
    price: 12,
    chain: "evm",
    rpc: "https://api.roninchain.com/rpc",
    wallet: "ronin:YOUR_RONIN_WALLET",
    logo: "logos/ronin.png",
    balance: 0
  },

  "SOL": {
    price: 5500,
    chain: "sol",
    wallet: "YOUR_SOL_WALLET",
    logo: "logos/solana.png",
    balance: 0
  },

  "HBAR": {
    price: 11,
    chain: "hedera",
    wallet: "0.0.YOUR_ACCOUNT_ID",
    logo: "logos/hbar.png",
    balance: 0
  }
};

function renderTokens() {
  tokenList.innerHTML = "";
  tokenSelect.innerHTML = "";

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

  updatePrice();
}

async function fetchEVMBalance(tokenName) {
  const token = tokens[tokenName];

  let wallet = token.wallet;
  if (wallet.startsWith("ronin:")) {
    wallet = wallet.replace("ronin:", "0x");
  }

  try {
    const res = await fetch(token.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [wallet, "latest"]
      })
    });

    const data = await res.json();
    const wei = parseInt(data.result, 16);
    token.balance = (wei / 1e18).toFixed(4);

    renderTokens();
  } catch (err) {
    console.error("EVM fetch error:", err);
  }
}

async function fetchSolBalance(tokenName) {
  const token = tokens[tokenName];

  const res = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [token.wallet]
    })
  });

  const data = await res.json();
  token.balance = (data.result.value / 1e9).toFixed(4);

  renderTokens();
}

async function fetchHbarBalance(tokenName) {
  const token = tokens[tokenName];

  const res = await fetch(
    `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${token.wallet}`
  );

  const data = await res.json();
  token.balance = (data.balance.balance / 1e8).toFixed(4);

  renderTokens();
}

function refreshAllBalances() {
  for (let t in tokens) {
    if (tokens[t].chain === "evm") {
      fetchEVMBalance(t);
    }

    if (tokens[t].chain === "sol") {
      fetchSolBalance(t);
    }

    if (tokens[t].chain === "hedera") {
      fetchHbarBalance(t);
    }
  }
}

renderTokens();
refreshAllBalances();
setInterval(refreshAllBalances, 30000);


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

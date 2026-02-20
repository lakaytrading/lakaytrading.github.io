
const tokenList = document.getElementById("tokenList");
const tokenSelect = document.getElementById("tokenSelect");
const priceDisplay = document.getElementById("priceDisplay");

const tokens = {
    "RONIN (RON)": {
    price: 12,
    chain: "evm",
    rpc: "https://api.roninchain.com/rpc",
    wallet: "0x05b4CBc444205E176Ad84928ce9cED730DAeD4C5",
    logo: "logos/ronin.png",
    balance: 0,
    chainId: 2020
  },
  
    "POLYGON (POL)": {
    price: 12,
    chain: "evm",
    rpc: "https://polygon-mainnet.g.alchemy.com/v2/SvwOY9p6epW4FCU-RbmDe",
    wallet: "0x05b4CBc444205E176Ad84928ce9cED730DAeD4C5",
    logo: "logos/pol.png",
    balance: 0,
    chainId: 137
  },
  
  "Ethereum (ETH-BASE)": {
    price: 180000,
    chain: "evm",
    rpc: "https://mainnet.base.org",
    wallet: "0x05b4CBc444205E176Ad84928ce9cED730DAeD4C5",
    logo: "logos/eth.png",
    balance: 0,
    chainId: 8453
  },

  "SOLANA (SOL)": {
    price: 7500,
    chain: "sol",
    wallet: "6GK74UhpLrQgfGFB4Rwf2JQrMhwVTTerwGp1k1PxqFqw",
    logo: "logos/solana.png",
    balance: 0
  },

  "Hedera (HBAR)": {
    price: 11,
    chain: "hedera",
    wallet: "0.0.YOUR_ACCOUNT_ID",
    logo: "logos/hbar.png",
    balance: 0
  },
  
  "BNB (BSC)": {
  price: 50000, 
  chain: "evm",
  rpc: "https://bnb-mainnet.g.alchemy.com/v2/Tw9d5AaaGUqS9RcThkOVo",
  wallet: "0x05b4CBc444205E176Ad84928ce9cED730DAeD4C5",
  logo: "logos/bnb.png",
  balance: 0,
  chainId: 56
},

"TON (TON)": {
  price: 140, 
  chain: "ton",
  wallet: "UQADTH0gRuJlBX6MCqYNWBuNnbV4CGo27aP9h3A5jOVXofEy",
  logo: "logos/ton.png",
  balance: 0
}
};

function renderTokens() {
  const currentSelection = tokenSelect.value || localStorage.getItem("selectedToken");

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

    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;

    if (t === currentSelection) {
      option.selected = true;
    }

    tokenSelect.appendChild(option);
  }

  updatePrice();
}
async function fetchEVMBalance(tokenName) {
  const token = tokens[tokenName];

  try {
    const provider = new ethers.providers.JsonRpcProvider(token.rpc);

    const balanceWei = await provider.getBalance(token.wallet);
    const balance = parseFloat(ethers.utils.formatEther(balanceWei));

    token.balance = balance.toFixed(4);
  } catch (err) {
    console.warn(`${tokenName} EVM fetch warning:`, err.message);
    token.balance = "0.0000";
  }

  renderTokens();
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

async function fetchTonBalance(tokenName) {
  const token = tokens[tokenName];

  try {
    const res = await fetch(
      `https://toncenter.com/api/v2/getAddressBalance?address=${token.wallet}`
    );

    const data = await res.json();
    token.balance = (data.result / 1e9).toFixed(4);

    renderTokens();

  } catch (err) {
    console.error("TON fetch error:", err);
    token.balance = "0.0000";
    renderTokens();
  }
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
    
    if (tokens[t].chain === "ton") {
      fetchTonBalance(t);
    }
    
  }
}


renderTokens();
const savedToken = localStorage.getItem("selectedToken");
if (savedToken && tokens[savedToken]) {
  tokenSelect.value = savedToken;
}
updatePrice();

refreshAllBalances();
setInterval(refreshAllBalances, 30000);

function updatePrice() {
  const selected = tokenSelect.value;
  priceDisplay.value = "₱" + tokens[selected].price;
}
updatePrice();

tokenSelect.addEventListener("change", () => {
  updatePrice();
  localStorage.setItem("selectedToken", tokenSelect.value);
});

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

const warningModal = document.getElementById("warningModal");
const closeWarningBtn = document.getElementById("closeWarning");

window.addEventListener("load", () => {
  warningModal.style.display = "flex";
});

closeWarningBtn.onclick = () => {
  warningModal.style.display = "none";
};

const howToBtn = document.getElementById("howToBtn");
const howToModal = document.getElementById("howToModal");
const closeHowTo = document.getElementById("closeHowTo");

howToBtn.onclick = () => {
  howToModal.style.display = "flex";
};

closeHowTo.onclick = () => {
  howToModal.style.display = "none";
};
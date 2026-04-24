document.addEventListener("DOMContentLoaded", () => {
const CONTRACT_ADDRESS = "0xde8365dAF3CFdF952E2F946F19a4DcAcd57eFf0F";
const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";

async function getContracts() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const vaultContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    VAULTWISE_ABI,
    signer
  );

  const usdcContract = new ethers.Contract(
    USDC_ADDRESS,
    USDC_ABI,
    signer
  );

  return { vaultContract, usdcContract, signer };
}



async function createVault(goalAmount, durationInDays) {
  const { vaultContract } = await getContracts();

  const amount = ethers.parseUnits(goalAmount, 6);
  const duration = durationInDays * 24 * 60 * 60;

  const tx = await vaultContract.createVault(amount, duration);

  alert("Creating vault...");
  await tx.wait();

  alert("Vault created!");
}



async function depositToVault(vaultId, amount) {
  const { vaultContract, usdcContract } = await getContracts();

  const parsedAmount = ethers.parseUnits(amount, 6);

  const approveTx = await usdcContract.approve(
    CONTRACT_ADDRESS,
    parsedAmount
  );

  await approveTx.wait();

  const depositTx = await vaultContract.deposit(
    vaultId,
    parsedAmount
  );

  await depositTx.wait();

  alert("Deposit successful!");
}



async function investVault(vaultId) {
  const { vaultContract } = await getContracts();

  const tx = await vaultContract.invest(vaultId);
  await tx.wait();

  alert("Invested!");
}



async function loadVaults() {
  const { vaultContract, signer } = await getContracts();

  const user = await signer.getAddress();
  const vaultIds = await vaultContract.getUserVaults(user);

  console.log("Vault IDs:", vaultIds);

  for (let id of vaultIds) {
    const vault = await vaultContract.getVault(id);

    const goal = ethers.formatUnits(vault.goalAmount, 6);
    const balance = ethers.formatUnits(vault.balance, 6);

    console.log(`Vault ${id}: Goal ${goal}, Balance ${balance}`);
  }
}

loadVaults();



const demoHoldings = {
  tether: 1320.7043,
  ethereum: 0.5,
  cosmos: 20,
  "the-open-network": 40,
  axelar: 100,
  bitcoin: 0.02,
};

async function fetchCryptoPrices() {
  const coinIds = Object.keys(demoHoldings).join(",");

  const url =
    `https://api.coingecko.com/api/v3/coins/markets` +
    `?vs_currency=usd` +
    `&ids=${coinIds}` +
    `&order=market_cap_desc` +
    `&per_page=100` +
    `&page=1` +
    `&sparkline=false` +
    `&price_change_percentage=24h`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch crypto prices");
    }

    const coins = await response.json();

    coins.forEach((coin) => {
      const asset = document.querySelector(`[data-coin="${coin.id}"]`);
      if (!asset) return;

      const priceEl = asset.querySelector(".coin-price");
      const changeEl = asset.querySelector(".coin-change");
      const valueEl = asset.querySelector(".coin-value");

      const price = coin.current_price;
      const change = coin.price_change_percentage_24h || 0;
      const holding = demoHoldings[coin.id];
      const totalValue = price * holding;

      priceEl.textContent = `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 4 : 2,
      })}`;

      changeEl.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

      changeEl.classList.remove("positive", "negative");
      changeEl.classList.add(change >= 0 ? "positive" : "negative");

      valueEl.textContent = `$${totalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    });
  } catch (error) {
    console.error(error);

    document.querySelectorAll(".coin-price").forEach((item) => {
      item.textContent = "Price unavailable";
    });
  }
}

fetchCryptoPrices();
setInterval(fetchCryptoPrices, 60000);



  lucide.createIcons();

  // WALLET CONNECTION
 const connectWalletBtns = document.querySelectorAll(
  "#connectWalletBtn, #connectWalletBtnDesktop"
);

const walletBox = document.getElementById("walletBox");
const walletDisplayBtn = document.getElementById("walletDisplayBtn");
const walletDropdown = document.getElementById("walletDropdown");
const walletShortText = document.getElementById("walletShortText");
const copyWalletBtn = document.getElementById("copyWalletBtn");
const disconnectWalletBtn = document.getElementById("disconnectWalletBtn");
const profileWalletText = document.getElementById("profileWalletText");

let connectedWallet = null;

function shortAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

function showConnectedUI(wallet) {
  connectedWallet = wallet;

  connectWalletBtns.forEach((btn) => {
    btn.classList.add("hidden");
  });

  walletBox.classList.remove("hidden");
  walletShortText.innerText = shortAddress(wallet);

  if (profileWalletText) {
    profileWalletText.innerText = shortAddress(wallet);
  }

  lucide.createIcons();
}

function showDisconnectedUI() {
  connectedWallet = null;

  connectWalletBtns.forEach((btn) => {
    btn.classList.remove("hidden");
    btn.innerText = "Connect Wallet";
  });

  walletBox.classList.add("hidden");
  walletDropdown.classList.add("hidden");

  if (profileWalletText) {
    profileWalletText.innerText = "Not connected";
  }

  lucide.createIcons();
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not detected.");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    showConnectedUI(accounts[0]);
  } catch (error) {
    console.error(error);
    alert("Wallet connection failed or rejected.");
  }
}

connectWalletBtns.forEach((btn) => {
  btn.addEventListener("click", connectWallet);
});

walletDisplayBtn.addEventListener("click", () => {
  walletDropdown.classList.toggle("hidden");
});

copyWalletBtn.addEventListener("click", async () => {
  if (!connectedWallet) return;

  await navigator.clipboard.writeText(connectedWallet);
  copyWalletBtn.innerHTML = `<i data-lucide="check"></i> Copied`;

  lucide.createIcons();

  setTimeout(() => {
    copyWalletBtn.innerHTML = `<i data-lucide="copy"></i> Copy Address`;
    lucide.createIcons();
  }, 1500);
});

disconnectWalletBtn.addEventListener("click", async () => {
  try {
    if (window.ethereum) {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    }

    console.log("Wallet permission revoked");
  } catch (error) {
    console.warn("Permission revoke failed:", error);
  }

  showDisconnectedUI();
});

  // HIDE / SHOW BALANCE
  const toggleBtn = document.getElementById("toggleBalance");
  const balanceAmount = document.getElementById("balanceAmount");
  const balanceChange = document.getElementById("balanceChange");

  let isBalanceHidden = false;

  if (toggleBtn && balanceAmount && balanceChange) {
    toggleBtn.addEventListener("click", () => {
      isBalanceHidden = !isBalanceHidden;

      if (isBalanceHidden) {
        balanceAmount.textContent = "****";
        balanceChange.textContent = "****";
        toggleBtn.innerHTML = `<i data-lucide="eye-off"></i>`;
      } else {
        balanceAmount.textContent = balanceAmount.dataset.real;
        balanceChange.textContent = balanceChange.dataset.real;
        toggleBtn.innerHTML = `<i data-lucide="eye"></i>`;
      }

      lucide.createIcons();
    });
  }

  // PAGE NAVIGATION
  const navLinks = document.querySelectorAll(".nav-link");

  const pages = {
    home: document.getElementById("homePage"),
    save: document.getElementById("savePage"),
    invest: document.getElementById("investPage"),
    profile: document.getElementById("profilePage"),
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const selectedPage = link.dataset.page;

      navLinks.forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      Object.values(pages).forEach((page) => {
        if (page) {
          page.classList.add("hidden");
        }
      });

      if (pages[selectedPage]) {
        pages[selectedPage].classList.remove("hidden");
      }

      lucide.createIcons();
    });
  });
});

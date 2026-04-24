document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const landingPage = document.getElementById("landingPage");
  const appContainer = document.getElementById("appContainer");
  const startAppBtn = document.getElementById("startAppBtn");

  const usernameModal = document.getElementById("usernameModal");
  const usernameInput = document.getElementById("usernameInput");
  const avatarInput = document.getElementById("avatarInput");
  const saveUsernameBtn = document.getElementById("saveUsernameBtn");

  const desktopUser = document.querySelector(".desktop-user");
  const mobileUser = document.querySelector(".mobile-username");
  const profileUsername = document.querySelector(".profile-username");
  const userAvatars = document.querySelectorAll(".user-avatar");

  const connectWalletBtns = document.querySelectorAll(
    "#connectWalletBtn, #connectWalletBtnDesktop, #modalConnectWalletBtn"
  );

  const walletBox = document.getElementById("walletBox");
  const walletDisplayBtn = document.getElementById("walletDisplayBtn");
  const walletDropdown = document.getElementById("walletDropdown");
  const walletShortText = document.getElementById("walletShortText");
  const copyWalletBtn = document.getElementById("copyWalletBtn");
  const disconnectWalletBtn = document.getElementById("disconnectWalletBtn");
  const profileWalletText = document.getElementById("profileWalletText");
  const modalWalletText = document.getElementById("modalWalletText");

  const toggleBtn = document.getElementById("toggleBalance");
  const balanceAmount = document.getElementById("balanceAmount");
  const balanceChange = document.getElementById("balanceChange");

  const vaultGrid = document.getElementById("vaultGrid");
  const createVaultModal = document.getElementById("createVaultModal");
  const openCreateVaultModal = document.getElementById("openCreateVaultModal");
  const closeCreateVaultModal = document.getElementById("closeCreateVaultModal");
  const createVaultBtn = document.getElementById("createVaultBtn");

  let username = localStorage.getItem("vaultwiseUsername");
  let savedAvatar = localStorage.getItem("vaultwiseAvatar");
  let connectedWallet = null;
  let isBalanceHidden = false;

  let vaults = JSON.parse(localStorage.getItem("vaultwiseVaults")) || [];

  function getDefaultAvatar(name = "User") {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ffffff&color=000000`;
  }

  function setUserUI(name, avatarUrl) {
    const displayName = "@" + name;

    if (desktopUser) desktopUser.innerText = displayName;
    if (mobileUser) mobileUser.innerText = displayName;
    if (profileUsername) profileUsername.innerText = displayName;

    userAvatars.forEach((avatar) => {
      avatar.src = avatarUrl || getDefaultAvatar(name);
    });
  }

  function showDashboard() {
    if (landingPage) landingPage.style.display = "none";
    if (appContainer) appContainer.classList.remove("hidden");
    renderVaults();
  }

  function showLanding() {
    if (landingPage) landingPage.style.display = "grid";
    if (appContainer) appContainer.classList.add("hidden");
  }

  function shortAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  async function updateWalletBalance(wallet) {
    try {
      if (!window.ethereum || !ethers) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(wallet);
      const formattedBalance = Number(ethers.formatEther(balance)).toFixed(4);

      if (balanceAmount) {
        balanceAmount.textContent = `${formattedBalance} POL`;
        balanceAmount.dataset.real = `${formattedBalance} POL`;
      }

      if (balanceChange) {
        balanceChange.textContent = "Live wallet balance";
        balanceChange.dataset.real = "Live wallet balance";
      }
    } catch (error) {
      console.error("Balance fetch failed:", error);
    }
  }

  function showConnectedUI(wallet) {
    connectedWallet = wallet;

    connectWalletBtns.forEach((btn) => {
      btn.classList.add("hidden");
    });

    if (walletBox) walletBox.classList.remove("hidden");
    if (walletShortText) walletShortText.innerText = shortAddress(wallet);
    if (profileWalletText) profileWalletText.innerText = shortAddress(wallet);
    if (modalWalletText) modalWalletText.innerText = `Connected: ${shortAddress(wallet)}`;

    updateWalletBalance(wallet);

    if (!username) {
      if (landingPage) landingPage.style.display = "none";
      usernameModal.classList.remove("hidden");
    } else {
      setUserUI(username, savedAvatar || getDefaultAvatar(username));
      showDashboard();
    }

    lucide.createIcons();
  }

  function showDisconnectedUI() {
    connectedWallet = null;

    connectWalletBtns.forEach((btn) => {
      btn.classList.remove("hidden");
      btn.innerText = "Connect Wallet";
    });

    if (walletBox) walletBox.classList.add("hidden");
    if (walletDropdown) walletDropdown.classList.add("hidden");
    if (profileWalletText) profileWalletText.innerText = "Not connected";
    if (modalWalletText) modalWalletText.innerText = "Wallet not connected";

    if (balanceAmount) {
      balanceAmount.textContent = "0.0000 POL";
      balanceAmount.dataset.real = "0.0000 POL";
    }

    if (balanceChange) {
      balanceChange.textContent = "Connect wallet to view balance";
      balanceChange.dataset.real = "Connect wallet to view balance";
    }

    renderVaults();
    lucide.createIcons();
  }

  async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask not detected. Please install MetaMask or use a wallet browser.");
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

  function saveVaults() {
    localStorage.setItem("vaultwiseVaults", JSON.stringify(vaults));
  }

  function openCreateVault() {
    if (createVaultModal) {
      createVaultModal.classList.remove("hidden");
    }
  }

  function renderVaults() {
    if (!vaultGrid) return;

    const userVaults = connectedWallet
      ? vaults.filter((vault) => vault.owner === connectedWallet)
      : [];

    if (userVaults.length === 0) {
      vaultGrid.innerHTML = `
        <div class="create-vault-placeholder" id="emptyCreateVaultBtn">
          <div class="create-vault-inner">
            <span><i data-lucide="plus"></i></span>
            <h3>Create Vault</h3>
            <p>Create your first savings vault</p>
          </div>
        </div>
      `;

      const emptyCreateVaultBtn = document.getElementById("emptyCreateVaultBtn");

      if (emptyCreateVaultBtn) {
        emptyCreateVaultBtn.addEventListener("click", openCreateVault);
      }

      lucide.createIcons();
      return;
    }

    vaultGrid.innerHTML = "";

    userVaults.forEach((vault) => {
      const progress =
        vault.goalAmount > 0 ? (vault.currentAmount / vault.goalAmount) * 100 : 0;

      const remaining = Math.max(vault.goalAmount - vault.currentAmount, 0);

      vaultGrid.innerHTML += `
        <div class="vault-card">
          <div class="vault-head">
            <div class="vault-icon">
              <i data-lucide="badge-dollar-sign"></i>
            </div>

            <div>
              <h3>${vault.name} <span>Active</span></h3>
              <p>Main Vault • ${vault.duration}</p>
            </div>
          </div>

          <div class="vault-info">
            <div>
              <small>Savings Goal</small>
              <h4>$${vault.goalAmount.toFixed(2)}</h4>
            </div>

            <div>
              <small>Current Amount</small>
              <h4 class="blue">$${vault.currentAmount.toFixed(2)}</h4>
            </div>
          </div>

          <div class="progress-row">
            <small>Progress</small>
            <small>${progress.toFixed(2)}%</small>
          </div>

          <div class="progress">
            <span style="width: ${Math.min(progress, 100)}%"></span>
          </div>

          <small>$${remaining.toFixed(2)} to go</small>

          <button class="details-btn">
            View vault details <i data-lucide="chevron-right"></i>
          </button>
        </div>
      `;
    });

    lucide.createIcons();
  }

  if (username) {
    setUserUI(username, savedAvatar || getDefaultAvatar(username));
    showDashboard();
  } else {
    showLanding();
  }

  if (startAppBtn) {
    startAppBtn.addEventListener("click", () => {
      if (landingPage) landingPage.style.display = "none";
      usernameModal.classList.remove("hidden");
    });
  }

  connectWalletBtns.forEach((btn) => {
    btn.addEventListener("click", connectWallet);
  });

  if (walletDisplayBtn) {
    walletDisplayBtn.addEventListener("click", () => {
      walletDropdown.classList.toggle("hidden");
    });
  }

  if (copyWalletBtn) {
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
  }

  if (disconnectWalletBtn) {
    disconnectWalletBtn.addEventListener("click", () => {
      showDisconnectedUI();
      showLanding();
    });
  }

  if (saveUsernameBtn) {
    saveUsernameBtn.addEventListener("click", () => {
      const name = usernameInput.value.trim();

      if (!name) {
        alert("Please enter a username.");
        return;
      }

      if (!connectedWallet) {
        alert("Please connect your wallet first.");
        return;
      }

      username = name;
      localStorage.setItem("vaultwiseUsername", name);

      const file = avatarInput.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = () => {
          const avatarData = reader.result;

          localStorage.setItem("vaultwiseAvatar", avatarData);
          savedAvatar = avatarData;

          setUserUI(name, avatarData);
          usernameModal.classList.add("hidden");
          showDashboard();
        };

        reader.readAsDataURL(file);
      } else {
        const defaultAvatar = getDefaultAvatar(name);

        localStorage.setItem("vaultwiseAvatar", defaultAvatar);
        savedAvatar = defaultAvatar;

        setUserUI(name, defaultAvatar);
        usernameModal.classList.add("hidden");
        showDashboard();
      }
    });
  }

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

      document.querySelectorAll(`[data-page="${selectedPage}"]`).forEach((item) => {
        item.classList.add("active");
      });

      Object.values(pages).forEach((page) => {
        if (page) page.classList.add("hidden");
      });

      if (pages[selectedPage]) {
        pages[selectedPage].classList.remove("hidden");
      }

      lucide.createIcons();
    });
  });

  if (openCreateVaultModal) {
    openCreateVaultModal.addEventListener("click", openCreateVault);
  }

  if (closeCreateVaultModal) {
    closeCreateVaultModal.addEventListener("click", () => {
      createVaultModal.classList.add("hidden");
    });
  }

  if (createVaultBtn) {
    createVaultBtn.addEventListener("click", () => {
      const name = document.getElementById("vaultNameInput").value.trim();
      const goalAmount = Number(document.getElementById("goalAmountInput").value);
      const currentAmount = Number(document.getElementById("currentAmountInput").value);
      const duration = document.getElementById("durationInput").value.trim();

      if (!name || !goalAmount || !duration) {
        alert("Please fill in vault name, goal amount, and duration.");
        return;
      }

      vaults.push({
        owner: connectedWallet || "guest",
        name,
        goalAmount,
        currentAmount: currentAmount || 0,
        duration,
      });

      saveVaults();
      renderVaults();

      document.getElementById("vaultNameInput").value = "";
      document.getElementById("goalAmountInput").value = "";
      document.getElementById("currentAmountInput").value = "";
      document.getElementById("durationInput").value = "";

      createVaultModal.classList.add("hidden");

      document.querySelector('[data-page="home"]').click();
    });
  }

  renderVaults();

  const transferOverlay = document.getElementById("transferOverlay");
  const transferTitle = document.getElementById("transferTitle");
  const transferBackBtn = document.getElementById("transferBackBtn");
  const transferCloseBtn = document.getElementById("transferCloseBtn");
  const tokenSelectScreen = document.getElementById("tokenSelectScreen");
  const sendFormScreen = document.getElementById("sendFormScreen");
  const receiveScreen = document.getElementById("receiveScreen");
  const tokenSearchInput = document.getElementById("tokenSearchInput");
  const transferTokenList = document.getElementById("transferTokenList");
  const transferEmptyState = document.getElementById("transferEmptyState");
  const sendSelectedToken = document.getElementById("sendSelectedToken");
  const receiveSelectedToken = document.getElementById("receiveSelectedToken");
  const sendAddressInput = document.getElementById("sendAddressInput");
  const sendAmountInput = document.getElementById("sendAmountInput");
  const sendNextBtn = document.getElementById("sendNextBtn");
  const receiveAddressText = document.getElementById("receiveAddressText");
  const copyReceiveAddressBtn = document.getElementById("copyReceiveAddressBtn");

  const tokenAssets = [
    { symbol: "USDT", name: "Tether USD", coinClass: "usdt", icon: "₮", balance: "$1,320.7043", value: "$1,320.70" },
    { symbol: "ETH", name: "Ethereum", coinClass: "eth", icon: "◆", balance: "0.50 ETH", value: "$1,165.64" },
    { symbol: "ATOM", name: "Cosmos", coinClass: "atom", icon: "✺", balance: "20 ATOM", value: "$39.40" },
    { symbol: "TON", name: "Ton", coinClass: "ton", icon: "▽", balance: "40 TON", value: "$52.80" },
    { symbol: "AXL", name: "Axelar", coinClass: "axl", icon: "✖", balance: "100 AXL", value: "$5.92" },
    { symbol: "BTC", name: "Bitcoin", coinClass: "btc", icon: "₿", balance: "0.02 BTC", value: "$1,566.24" },
  ];

  let transferMode = "send";
  let selectedTransferToken = null;

  function tokenCardHTML(token) {
    return `
      <div class="coin ${token.coinClass}">${token.icon}</div>
      <div>
        <h3>${token.symbol}</h3>
        <p>${token.name}</p>
      </div>
    `;
  }

  function fullTokenItemHTML(token) {
    return `
      <button class="transfer-token-item" data-symbol="${token.symbol}">
        <div class="coin ${token.coinClass}">${token.icon}</div>

        <div class="token-meta">
          <h3>${token.symbol}</h3>
          <p>${token.name}</p>
        </div>

        <div class="token-right">
          <h4>${token.balance}</h4>
          <p>${token.value}</p>
        </div>
      </button>
    `;
  }

  function renderTransferTokens(filter = "") {
    const cleanFilter = filter.toLowerCase().trim();

    const filteredTokens = tokenAssets.filter((token) => {
      return (
        token.symbol.toLowerCase().includes(cleanFilter) ||
        token.name.toLowerCase().includes(cleanFilter)
      );
    });

    if (filteredTokens.length === 0) {
      transferTokenList.innerHTML = "";
      transferEmptyState.classList.remove("hidden");
      return;
    }

    transferEmptyState.classList.add("hidden");
    transferTokenList.innerHTML = filteredTokens.map(fullTokenItemHTML).join("");

    document.querySelectorAll(".transfer-token-item").forEach((item) => {
      item.addEventListener("click", () => {
        const symbol = item.dataset.symbol;
        const token = tokenAssets.find((asset) => asset.symbol === symbol);
        selectTransferToken(token);
      });
    });

    lucide.createIcons();
  }

  function showTransferScreen(screen) {
    tokenSelectScreen.classList.add("hidden");
    sendFormScreen.classList.add("hidden");
    receiveScreen.classList.add("hidden");

    screen.classList.remove("hidden");
  }

  function openTransfer(mode) {
    transferMode = mode;
    selectedTransferToken = null;

    transferTitle.innerText = mode === "send" ? "Send" : "Receive";
    tokenSearchInput.value = "";

    transferOverlay.classList.remove("hidden");
    showTransferScreen(tokenSelectScreen);
    renderTransferTokens();

    lucide.createIcons();
  }

  function closeTransfer() {
    transferOverlay.classList.add("hidden");
    sendAddressInput.value = "";
    sendAmountInput.value = "";
    sendNextBtn.disabled = true;
  }

  function selectTransferToken(token) {
    selectedTransferToken = token;

    if (transferMode === "send") {
      transferTitle.innerText = `Send ${token.symbol}`;
      sendSelectedToken.innerHTML = tokenCardHTML(token);
      showTransferScreen(sendFormScreen);
    } else {
      transferTitle.innerText = `Receive ${token.symbol}`;
      receiveSelectedToken.innerHTML = tokenCardHTML(token);
      receiveAddressText.innerText = connectedWallet || "Connect wallet first";
      showTransferScreen(receiveScreen);
    }

    lucide.createIcons();
  }

  function validateSendForm() {
    const address = sendAddressInput.value.trim();
    const amount = Number(sendAmountInput.value);

    sendNextBtn.disabled = !(address.length > 10 && amount > 0);
  }

  document.getElementById("sendActionBtn").addEventListener("click", () => {
    openTransfer("send");
  });

  document.getElementById("receiveActionBtn").addEventListener("click", () => {
    openTransfer("receive");
  });

  transferCloseBtn.addEventListener("click", closeTransfer);

  transferBackBtn.addEventListener("click", () => {
    if (!tokenSelectScreen.classList.contains("hidden")) {
      closeTransfer();
      return;
    }

    transferTitle.innerText = transferMode === "send" ? "Send" : "Receive";
    showTransferScreen(tokenSelectScreen);
  });

  tokenSearchInput.addEventListener("input", () => {
    renderTransferTokens(tokenSearchInput.value);
  });

  sendAddressInput.addEventListener("input", validateSendForm);
  sendAmountInput.addEventListener("input", validateSendForm);

  sendNextBtn.addEventListener("click", () => {
    if (!selectedTransferToken) return;

    alert(
      `Demo only: Sending ${sendAmountInput.value} ${selectedTransferToken.symbol} to ${sendAddressInput.value}`
    );

    closeTransfer();
  });

  copyReceiveAddressBtn.addEventListener("click", async () => {
    if (!connectedWallet) {
      alert("Connect wallet first.");
      return;
    }

    await navigator.clipboard.writeText(connectedWallet);
    copyReceiveAddressBtn.innerHTML = `<i data-lucide="check"></i>`;

    lucide.createIcons();

    setTimeout(() => {
      copyReceiveAddressBtn.innerHTML = `<i data-lucide="copy"></i>`;
      lucide.createIcons();
    }, 1200);
  });

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
});

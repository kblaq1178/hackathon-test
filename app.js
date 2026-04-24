document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // WALLET CONNECTION
  const connectWalletBtn = document.getElementById("connectWalletBtn");
const connectWalletBtnDesktop = document.getElementById("connectWalletBtnDesktop");

  if (connectWalletBtn) {
    connectWalletBtn.addEventListener("click", async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const wallet = accounts[0];

        connectWalletBtn.innerText =
          wallet.slice(0, 6) + "..." + wallet.slice(-4);
      } catch (error) {
        console.error(error);
        alert("Wallet connection failed");
      }
    });
  }

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



connectWalletBtn.innerText = shortWallet;

if (connectWalletBtnDesktop) {
  connectWalletBtnDesktop.innerText = shortWallet;
}
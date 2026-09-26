// ========== Dark Mode ==========
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
}

darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
        darkModeToggle.textContent = "☀️";
        localStorage.setItem("darkMode", "enabled");
    } else {
        darkModeToggle.textContent = "🌙";
        localStorage.setItem("darkMode", "disabled");
    }
});

// ========== Expense Tracker ==========
const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const transactionList = document.getElementById("transactionList");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const filterButtons = document.querySelectorAll(".filter-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentFilter = "all";

// Format Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

// Simpan ke localStorage
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Hitung ringkasan
function updateSummary() {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    balanceEl.textContent = formatRupiah(balance);
    incomeEl.textContent = formatRupiah(income);
    expenseEl.textContent = formatRupiah(expense);
}

// Render daftar transaksi
function renderTransactions() {
    transactionList.innerHTML = "";

    let filtered = transactions;
    if (currentFilter !== "all") {
        filtered = transactions.filter(t => t.type === currentFilter);
    }

    if (filtered.length === 0) {
        transactionList.innerHTML = `<li class="empty-message">Belum ada transaksi</li>`;
        updateSummary();
        return;
    }

    // Tampilkan dari yang terbaru
    filtered.forEach((transaction) => {
        const index = transactions.indexOf(transaction);
        const li = document.createElement("li");
        li.className = "transaction-item";

        const sign = transaction.type === "income" ? "+" : "-";

        li.innerHTML = `
            <div class="transaction-info">
                <div class="desc">${transaction.description}</div>
                <div class="meta">${transaction.category} · ${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${sign} ${formatRupiah(transaction.amount)}
            </div>
            <button class="delete-btn" data-index="${index}" title="Hapus">×</button>
        `;

        transactionList.appendChild(li);
    });

    updateSummary();
}

// Tambah transaksi
transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;

    if (!description || amount <= 0) return;

    const now = new Date();
    const date = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    transactions.unshift({
        description,
        amount,
        type,
        category,
        date
    });

    saveTransactions();
    renderTransactions();

    // Reset form
    descriptionInput.value = "";
    amountInput.value = "";
    typeSelect.value = "income";
    categorySelect.value = "Gaji";
    descriptionInput.focus();
});

// Hapus transaksi
transactionList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const index = e.target.dataset.index;
        const confirmed = confirm("Hapus transaksi ini?");
        if (confirmed) {
            transactions.splice(index, 1);
            saveTransactions();
            renderTransactions();
        }
    }
});

// Filter
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTransactions();
    });
});

// Render awal
renderTransactions();
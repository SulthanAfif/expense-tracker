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

// ========== Elements ==========
const transactionForm = document.getElementById("transactionForm");
const formTitle = document.getElementById("formTitle");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("dateInput");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const transactionList = document.getElementById("transactionList");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionCount = document.getElementById("transactionCount");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentFilter = "all";
let editIndex = null;

// Set tanggal hari ini sebagai default
dateInput.valueAsDate = new Date();

// Format Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateSummary() {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    balanceEl.textContent = formatRupiah(income - expense);
    incomeEl.textContent = formatRupiah(income);
    expenseEl.textContent = formatRupiah(expense);
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", options);
}

function renderTransactions() {
    let filtered = [...transactions];

    // Filter tipe
    if (currentFilter !== "all") {
        filtered = filtered.filter(t => t.type === currentFilter);
    }

    // Search
    const keyword = searchInput.value.trim().toLowerCase();
    if (keyword) {
        filtered = filtered.filter(t =>
            t.description.toLowerCase().includes(keyword) ||
            t.category.toLowerCase().includes(keyword)
        );
    }

    // Urutkan dari terbaru
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    transactionList.innerHTML = "";
    transactionCount.textContent = `${filtered.length} transaksi`;

    if (filtered.length === 0) {
        transactionList.innerHTML = `
            <li class="empty-message">
                <div class="icon">💸</div>
                <p>Belum ada transaksi</p>
            </li>
        `;
        updateSummary();
        return;
    }

    filtered.forEach((transaction) => {
        const realIndex = transactions.indexOf(transaction);
        const li = document.createElement("li");
        li.className = "transaction-item";

        const sign = transaction.type === "income" ? "+" : "-";

        li.innerHTML = `
            <div class="transaction-info">
                <div class="desc">${transaction.description}</div>
                <div class="meta">${transaction.category} · ${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-right">
                <div class="transaction-amount ${transaction.type}">
                    ${sign}${formatRupiah(transaction.amount)}
                </div>
                <button class="action-btn edit-btn" data-index="${realIndex}" title="Edit">✎</button>
                <button class="action-btn delete-btn" data-index="${realIndex}" title="Hapus">×</button>
            </div>
        `;

        transactionList.appendChild(li);
    });

    updateSummary();
}

// Tambah / Update transaksi
transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;
    const date = dateInput.value;

    if (!description || amount <= 0 || !date) return;

    if (editIndex !== null) {
        // Mode edit
        transactions[editIndex] = { description, amount, type, category, date };
        editIndex = null;
        formTitle.textContent = "Tambah Transaksi";
        submitBtn.textContent = "+ Tambah";
        cancelEditBtn.classList.add("hidden");
    } else {
        // Mode tambah
        transactions.unshift({ description, amount, type, category, date });
    }

    saveTransactions();
    renderTransactions();
    resetForm();
});

function resetForm() {
    descriptionInput.value = "";
    amountInput.value = "";
    typeSelect.value = "expense";
    categorySelect.value = "Makanan";
    dateInput.valueAsDate = new Date();
    descriptionInput.focus();
}

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
    editIndex = null;
    formTitle.textContent = "Tambah Transaksi";
    submitBtn.textContent = "+ Tambah";
    cancelEditBtn.classList.add("hidden");
    resetForm();
});

// Edit & Delete
transactionList.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains("delete-btn")) {
        const confirmed = confirm(`Hapus transaksi "${transactions[index].description}"?`);
        if (confirmed) {
            transactions.splice(index, 1);
            saveTransactions();
            renderTransactions();
        }
    }

    if (e.target.classList.contains("edit-btn")) {
        const t = transactions[index];
        descriptionInput.value = t.description;
        amountInput.value = t.amount;
        typeSelect.value = t.type;
        categorySelect.value = t.category;
        dateInput.value = t.date;

        editIndex = Number(index);
        formTitle.textContent = "Edit Transaksi";
        submitBtn.textContent = "Simpan Perubahan";
        cancelEditBtn.classList.remove("hidden");

        // Scroll ke form
        transactionForm.scrollIntoView({ behavior: "smooth" });
        descriptionInput.focus();
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

// Search
searchInput.addEventListener("input", renderTransactions);

// Render awal
renderTransactions();
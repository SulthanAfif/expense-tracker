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

// ========== State ==========
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budgets = JSON.parse(localStorage.getItem("budgets")) || {};
let currentFilter = "all";
let editIndex = null;
let currentCurrency = localStorage.getItem("currency") || "IDR";
let expenseChart = null;

const currencySymbols = {
    IDR: "Rp",
    USD: "$",
    EUR: "€",
    JPY: "¥",
    SGD: "S$"
};

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
const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");
const currencySelect = document.getElementById("currencySelect");
const budgetForm = document.getElementById("budgetForm");
const toggleBudgetForm = document.getElementById("toggleBudgetForm");
const budgetList = document.getElementById("budgetList");
const exportBtn = document.getElementById("exportBtn");

// Set default date
dateInput.valueAsDate = new Date();
currencySelect.value = currentCurrency;

// ========== Helpers ==========
function formatMoney(number) {
    const symbol = currencySymbols[currentCurrency];
    if (currentCurrency === "IDR") {
        return symbol + " " + new Intl.NumberFormat("id-ID").format(number);
    }
    return symbol + " " + new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(number);
}

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("budgets", JSON.stringify(budgets));
    localStorage.setItem("currency", currentCurrency);
}

function getFilteredTransactions() {
    let filtered = [...transactions];

    if (currentFilter !== "all") {
        filtered = filtered.filter(t => t.type === currentFilter);
    }

    const month = monthFilter.value;
    const year = yearFilter.value;

    if (month !== "all") {
        filtered = filtered.filter(t => t.date.substring(5, 7) === month);
    }
    if (year !== "all") {
        filtered = filtered.filter(t => t.date.substring(0, 4) === year);
    }

    const keyword = searchInput.value.trim().toLowerCase();
    if (keyword) {
        filtered = filtered.filter(t =>
            t.description.toLowerCase().includes(keyword) ||
            t.category.toLowerCase().includes(keyword)
        );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ========== Summary ==========
function updateSummary() {
    const filtered = getFilteredTransactions();

    const income = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    balanceEl.textContent = formatMoney(income - expense);
    incomeEl.textContent = formatMoney(income);
    expenseEl.textContent = formatMoney(expense);
}

// ========== Render Transactions ==========
function renderTransactions() {
    const filtered = getFilteredTransactions();
    transactionList.innerHTML = "";
    transactionCount.textContent = `${filtered.length} transaksi`;

    if (filtered.length === 0) {
        transactionList.innerHTML = `
            <li class="empty-message">
                <div class="icon">💸</div>
                <p>Belum ada transaksi</p>
            </li>`;
        updateSummary();
        updateChart();
        renderBudgets();
        return;
    }

    filtered.forEach(t => {
        const realIndex = transactions.indexOf(t);
        const li = document.createElement("li");
        li.className = "transaction-item";
        const sign = t.type === "income" ? "+" : "-";

        li.innerHTML = `
            <div class="transaction-info">
                <div class="desc">${t.description}</div>
                <div class="meta">${t.category} · ${formatDate(t.date)}</div>
            </div>
            <div class="transaction-right">
                <div class="transaction-amount ${t.type}">${sign}${formatMoney(t.amount)}</div>
                <button class="action-btn edit-btn" data-index="${realIndex}">✎</button>
                <button class="action-btn delete-btn" data-index="${realIndex}">×</button>
            </div>
        `;
        transactionList.appendChild(li);
    });

    updateSummary();
    updateChart();
    renderBudgets();
}

function formatDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric"
    });
}

// ========== Chart ==========
function updateChart() {
    const filtered = getFilteredTransactions().filter(t => t.type === "expense");
    const categoryTotals = {};

    filtered.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const ctx = document.getElementById("expenseChart").getContext("2d");

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    "#3b82f6", "#ef4444", "#f59e0b", "#22c55e",
                    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
                ],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: getComputedStyle(document.body).getPropertyValue('--text') }
                }
            }
        }
    });
}

// ========== Budget ==========
function renderBudgets() {
    budgetList.innerHTML = "";
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    Object.keys(budgets).forEach(cat => {
        const spent = transactions
            .filter(t => t.type === "expense" && t.category === cat && t.date.startsWith(currentMonth))
            .reduce((s, t) => s + t.amount, 0);

        const budget = budgets[cat];
        const percent = Math.min((spent / budget) * 100, 100);
        let status = "safe";
        if (percent >= 90) status = "danger";
        else if (percent >= 70) status = "warning";

        const div = document.createElement("div");
        div.className = "budget-item";
        div.innerHTML = `
            <div class="budget-item-header">
                <span>${cat}</span>
                <span>${formatMoney(spent)} / ${formatMoney(budget)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${status}" style="width: ${percent}%"></div>
            </div>
        `;
        budgetList.appendChild(div);
    });
}

toggleBudgetForm.addEventListener("click", () => {
    budgetForm.classList.toggle("hidden");
});

budgetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cat = document.getElementById("budgetCategory").value;
    const amount = Number(document.getElementById("budgetAmount").value);
    if (amount > 0) {
        budgets[cat] = amount;
        saveData();
        renderBudgets();
        budgetForm.reset();
        budgetForm.classList.add("hidden");
    }
});

// ========== Month & Year Filter ==========
function populateDateFilters() {
    const months = new Set();
    const years = new Set();

    transactions.forEach(t => {
        months.add(t.date.substring(5, 7));
        years.add(t.date.substring(0, 4));
    });

    const monthNames = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    monthFilter.innerHTML = `<option value="all">Semua Bulan</option>`;
    monthNames.forEach(m => {
        if (months.has(m)) {
            const name = new Date(`2024-${m}-01`).toLocaleString("id-ID", { month: "long" });
            monthFilter.innerHTML += `<option value="${m}">${name}</option>`;
        }
    });

    yearFilter.innerHTML = `<option value="all">Semua Tahun</option>`;
    [...years].sort().reverse().forEach(y => {
        yearFilter.innerHTML += `<option value="${y}">${y}</option>`;
    });
}

// ========== Export CSV ==========
exportBtn.addEventListener("click", () => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) {
        alert("Tidak ada data untuk diexport");
        return;
    }

    let csv = "Tanggal,Keterangan,Kategori,Tipe,Jumlah\n";
    filtered.forEach(t => {
        csv += `${t.date},"${t.description}",${t.category},${t.type},${t.amount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-tracker-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// ========== Form Submit ==========
transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;
    const date = dateInput.value;

    if (!description || amount <= 0 || !date) return;

    if (editIndex !== null) {
        transactions[editIndex] = { description, amount, type, category, date };
        editIndex = null;
        formTitle.textContent = "Tambah Transaksi";
        submitBtn.textContent = "+ Tambah";
        cancelEditBtn.classList.add("hidden");
    } else {
        transactions.unshift({ description, amount, type, category, date });
    }

    saveData();
    populateDateFilters();
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

cancelEditBtn.addEventListener("click", () => {
    editIndex = null;
    formTitle.textContent = "Tambah Transaksi";
    submitBtn.textContent = "+ Tambah";
    cancelEditBtn.classList.add("hidden");
    resetForm();
});

// ========== Edit & Delete ==========
transactionList.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains("delete-btn")) {
        if (confirm(`Hapus transaksi "${transactions[index].description}"?`)) {
            transactions.splice(index, 1);
            saveData();
            populateDateFilters();
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
        transactionForm.scrollIntoView({ behavior: "smooth" });
    }
});

// ========== Events ==========
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTransactions();
    });
});

searchInput.addEventListener("input", renderTransactions);
monthFilter.addEventListener("change", renderTransactions);
yearFilter.addEventListener("change", renderTransactions);

currencySelect.addEventListener("change", () => {
    currentCurrency = currencySelect.value;
    saveData();
    renderTransactions();
});

// ========== Init ==========
populateDateFilters();
renderTransactions();
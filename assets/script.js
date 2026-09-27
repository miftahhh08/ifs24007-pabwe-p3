/* =========================================================
   MIMIMIND WORKSPACE - PABWE PRAKTIKUM 3
   Fitur: Expense Tracker, Bookmark Manager, Quiz App
   ========================================================= */

"use strict";

/* ==================== HELPER ==================== */

const $ = (selector) => document.querySelector(selector);

const createId = () =>
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);

const formatDate = (dateString) =>
    new Date(`${dateString}T00:00:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

const escapeHTML = (value) => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
};

const isValidURL = (url) => /^https?:\/\/[^\s]+$/i.test(url.trim());


/* ==================== TAB ==================== */

const ACTIVE_TAB_KEY = "mimimind_active_tab";

function activateTab(tabName) {
    document.querySelectorAll(".tab-button").forEach((button) => {
        const active = button.dataset.tab === tabName;
        button.classList.toggle("active", active);
        button.classList.toggle("text-slate-600", !active);
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === tabName);
    });

    localStorage.setItem(ACTIVE_TAB_KEY, tabName);
}

document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
});


/* ==================== MODAL ==================== */

function openModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.modal));
});

document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(modal.id);
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal.show").forEach((modal) => closeModal(modal.id));
    }
});


/* ==================== DELETE MODAL ==================== */

let pendingDelete = null;

function askDelete(type, id) {
    pendingDelete = { type, id };

    $("#delete-message").textContent =
        type === "expense"
            ? "Transaksi yang dihapus tidak dapat dikembalikan."
            : "Bookmark yang dihapus tidak dapat dikembalikan.";

    openModal("delete-modal");
}

$("#confirm-delete").addEventListener("click", () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === "expense") {
        expenses = expenses.filter((item) => item.id !== pendingDelete.id);
        saveExpenses();
        renderExpenses();
        updateExpenseSummary();
    }

    if (pendingDelete.type === "bookmark") {
        bookmarks = bookmarks.filter((item) => item.id !== pendingDelete.id);
        saveBookmarks();
        renderBookmarks();
    }

    pendingDelete = null;
    closeModal("delete-modal");
});


/* ==================== EXPENSE TRACKER ==================== */

const EXPENSE_KEY = "mimimind_expenses";

let expenses = JSON.parse(localStorage.getItem(EXPENSE_KEY)) || [];

const expenseForm = $("#expense-form");
const expenseList = $("#expense-list");
const expenseSearch = $("#expense-search");
const expenseFilterType = $("#expense-filter-type");
const expenseFilterCategory = $("#expense-filter-category");
const expenseSort = $("#expense-sort");

function saveExpenses() {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
}

function validateExpense(title, category, amount, type, date) {
    if (!title || !category || !type || !date) {
        alert("Semua field transaksi wajib diisi.");
        return false;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Jumlah harus berupa angka dan lebih dari 0.");
        return false;
    }

    return true;
}

expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = $("#expense-title").value.trim();
    const category = $("#expense-category").value;
    const amount = Number($("#expense-amount").value);
    const type = $("#expense-type").value;
    const date = $("#expense-date").value;

    if (!validateExpense(title, category, amount, type, date)) return;

    expenses.push({
        id: createId(),
        title,
        category,
        amount,
        type,
        date,
        createdAt: Date.now()
    });

    saveExpenses();
    renderExpenses();
    updateExpenseSummary();
    expenseForm.reset();

    $("#expense-date").value = new Date().toISOString().split("T")[0];
    alert("Transaksi berhasil ditambahkan.");
});

function getFilteredExpenses() {
    const search = expenseSearch.value.trim().toLowerCase();
    const type = expenseFilterType.value;
    const category = expenseFilterCategory.value;

    const result = expenses.filter((item) => {
        const matchTitle = item.title.toLowerCase().includes(search);
        const matchType = type === "Semua" || item.type === type;
        const matchCategory = category === "Semua" || item.category === category;
        return matchTitle && matchType && matchCategory;
    });

    switch (expenseSort.value) {
        case "oldest":
            result.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case "highest":
            result.sort((a, b) => b.amount - a.amount);
            break;
        case "lowest":
            result.sort((a, b) => a.amount - b.amount);
            break;
        case "title":
            result.sort((a, b) => a.title.localeCompare(b.title, "id"));
            break;
        default:
            result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return result;
}

function renderExpenses() {
    const data = getFilteredExpenses();
    expenseList.innerHTML = "";
    $("#expense-count").textContent = `${data.length} transaksi`;

    if (data.length === 0) {
        expenseList.innerHTML = `
            <div class="text-center py-12">
                <div class="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                    <i class="ti ti-wallet-off text-2xl text-slate-400"></i>
                </div>
                <h4 class="font-bold text-slate-700">Belum ada transaksi</h4>
                <p class="text-sm text-slate-500 mt-1">Tambahkan transaksi atau ubah filter pencarian.</p>
            </div>`;
        return;
    }

    data.forEach((item) => {
        const article = document.createElement("article");
        const income = item.type === "Pemasukan";
        const amountClass = income ? "text-green-600" : "text-red-600";
        const badgeClass = income ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

        article.className = "border border-slate-200 rounded-xl p-4 hover:border-violet-300 transition";
        article.innerHTML = `
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <h4 class="font-bold text-slate-900">${escapeHTML(item.title)}</h4>
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}">${item.type}</span>
                        <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">${escapeHTML(item.category)}</span>
                    </div>
                    <p class="text-sm text-slate-500 mt-2"><i class="ti ti-calendar mr-1"></i>${formatDate(item.date)}</p>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p class="font-bold ${amountClass} text-lg">${income ? "+" : "-"}${formatRupiah(item.amount)}</p>
                    <div class="flex gap-2">
                        <button type="button" class="edit-expense px-3 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-semibold" data-id="${item.id}">
                            <i class="ti ti-edit mr-1"></i>Ubah
                        </button>
                        <button type="button" class="delete-expense px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-semibold" data-id="${item.id}">
                            <i class="ti ti-trash mr-1"></i>Hapus
                        </button>
                    </div>
                </div>
            </div>`;
        expenseList.appendChild(article);
    });
}

function updateExpenseSummary() {
    const income = expenses
        .filter((item) => item.type === "Pemasukan")
        .reduce((sum, item) => sum + item.amount, 0);

    const expense = expenses
        .filter((item) => item.type === "Pengeluaran")
        .reduce((sum, item) => sum + item.amount, 0);

    const currentBalance = income - expense;

    $("#total-income").textContent = formatRupiah(income);
    $("#total-expense").textContent = formatRupiah(expense);
    $("#balance").textContent = formatRupiah(currentBalance);
}

expenseList.addEventListener("click", (event) => {
    const edit = event.target.closest(".edit-expense");
    const remove = event.target.closest(".delete-expense");

    if (edit) {
        const item = expenses.find((expense) => expense.id === edit.dataset.id);
        if (!item) return;

        $("#edit-expense-id").value = item.id;
        $("#edit-expense-title").value = item.title;
        $("#edit-expense-category").value = item.category;
        $("#edit-expense-amount").value = item.amount;
        $("#edit-expense-type").value = item.type;
        $("#edit-expense-date").value = item.date;

        openModal("expense-modal");
    }

    if (remove) askDelete("expense", remove.dataset.id);
});

$("#expense-edit-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const id = $("#edit-expense-id").value;
    const title = $("#edit-expense-title").value.trim();
    const category = $("#edit-expense-category").value;
    const amount = Number($("#edit-expense-amount").value);
    const type = $("#edit-expense-type").value;
    const date = $("#edit-expense-date").value;

    if (!validateExpense(title, category, amount, type, date)) return;

    const index = expenses.findIndex((item) => item.id === id);
    if (index === -1) return;

    expenses[index] = { ...expenses[index], title, category, amount, type, date };

    saveExpenses();
    renderExpenses();
    updateExpenseSummary();
    closeModal("expense-modal");
    alert("Transaksi berhasil diperbarui.");
});

[expenseSearch, expenseFilterType, expenseFilterCategory, expenseSort].forEach((element) => {
    element.addEventListener(element === expenseSearch ? "input" : "change", renderExpenses);
});


/* ==================== BOOKMARK MANAGER ==================== */

const BOOKMARK_KEY = "mimimind_bookmarks";

let bookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];

function saveBookmarks() {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
}

$("#bookmark-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const title = $("#bookmark-title").value.trim();
    const url = $("#bookmark-url").value.trim();
    const category = $("#bookmark-category").value.trim();
    const note = $("#bookmark-note").value.trim();

    if (!title || !url || !category) {
        alert("Nama, URL, dan kategori wajib diisi.");
        return;
    }

    if (!isValidURL(url)) {
        alert("URL harus diawali http:// atau https://");
        return;
    }

    bookmarks.push({
        id: createId(),
        title,
        url,
        category,
        note,
        createdAt: Date.now()
    });

    saveBookmarks();
    renderBookmarks();
    $("#bookmark-form").reset();
    alert("Bookmark berhasil disimpan.");
});

function getFilteredBookmarks() {
    const search = $("#bookmark-search").value.trim().toLowerCase();

    const result = bookmarks.filter((item) =>
        item.title.toLowerCase().includes(search) ||
        item.url.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
    );

    switch ($("#bookmark-sort").value) {
        case "az":
            result.sort((a, b) => a.title.localeCompare(b.title, "id"));
            break;
        case "za":
            result.sort((a, b) => b.title.localeCompare(a.title, "id"));
            break;
        default:
            result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
}

function renderBookmarks() {
    const data = getFilteredBookmarks();
    const list = $("#bookmark-list");

    list.innerHTML = "";
    $("#bookmark-count").textContent = `${data.length} bookmark`;

    if (data.length === 0) {
        list.innerHTML = `
            <div class="lg:col-span-2 text-center py-12">
                <div class="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                    <i class="ti ti-bookmark-off text-2xl text-slate-400"></i>
                </div>
                <h4 class="font-bold text-slate-700">Belum ada bookmark</h4>
                <p class="text-sm text-slate-500 mt-1">Tambahkan tautan favoritmu.</p>
            </div>`;
        return;
    }

    data.forEach((item) => {
        const article = document.createElement("article");
        article.className = "border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition";

        article.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer"
                       class="font-bold text-lg text-blue-600 hover:underline break-words">${escapeHTML(item.title)}</a>
                    <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer"
                       class="block text-sm text-slate-500 hover:text-blue-600 truncate mt-1">${escapeHTML(item.url)}</a>
                    <div class="flex flex-wrap items-center gap-2 mt-3">
                        <span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">${escapeHTML(item.category)}</span>
                    </div>
                    ${item.note ? `<p class="text-sm text-slate-600 mt-3"><i class="ti ti-notes mr-1"></i>${escapeHTML(item.note)}</p>` : ""}
                </div>
                <div class="flex gap-1 shrink-0">
                    <button type="button" class="edit-bookmark w-9 h-9 rounded-lg bg-blue-50 text-blue-700" data-id="${item.id}" aria-label="Ubah bookmark">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button type="button" class="delete-bookmark w-9 h-9 rounded-lg bg-red-50 text-red-700" data-id="${item.id}" aria-label="Hapus bookmark">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </div>`;

        list.appendChild(article);
    });
}

$("#bookmark-list").addEventListener("click", (event) => {
    const edit = event.target.closest(".edit-bookmark");
    const remove = event.target.closest(".delete-bookmark");

    if (edit) {
        const item = bookmarks.find((bookmark) => bookmark.id === edit.dataset.id);
        if (!item) return;

        $("#edit-bookmark-id").value = item.id;
        $("#edit-bookmark-title").value = item.title;
        $("#edit-bookmark-url").value = item.url;
        $("#edit-bookmark-category").value = item.category;
        $("#edit-bookmark-note").value = item.note;

        openModal("bookmark-modal");
    }

    if (remove) askDelete("bookmark", remove.dataset.id);
});

$("#bookmark-edit-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const id = $("#edit-bookmark-id").value;
    const title = $("#edit-bookmark-title").value.trim();
    const url = $("#edit-bookmark-url").value.trim();
    const category = $("#edit-bookmark-category").value.trim();
    const note = $("#edit-bookmark-note").value.trim();

    if (!title || !url || !category) {
        alert("Nama, URL, dan kategori wajib diisi.");
        return;
    }

    if (!isValidURL(url)) {
        alert("URL harus diawali http:// atau https://");
        return;
    }

    const index = bookmarks.findIndex((item) => item.id === id);
    if (index === -1) return;

    bookmarks[index] = { ...bookmarks[index], title, url, category, note };

    saveBookmarks();
    renderBookmarks();
    closeModal("bookmark-modal");
    alert("Bookmark berhasil diperbarui.");
});

$("#bookmark-search").addEventListener("input", renderBookmarks);
$("#bookmark-sort").addEventListener("change", renderBookmarks);


/* ==================== QUIZ APP ==================== */

const QUIZ_KEY = "mimimind_high_score";

const quizQuestions = [
    {
        question: "Tag HTML yang digunakan untuk membuat tautan adalah...",
        options: ["<link>", "<a>", "<href>", "<url>"],
        answer: 1
    },
    {
        question: "Properti CSS yang digunakan untuk mengubah warna teks adalah...",
        options: ["background", "font-size", "color", "text-style"],
        answer: 2
    },
    {
        question: "Method JavaScript untuk menambahkan elemen ke akhir array adalah...",
        options: ["push()", "pop()", "shift()", "slice()"],
        answer: 0
    },
    {
        question: "Web Storage yang tetap menyimpan data setelah browser direfresh adalah...",
        options: ["sessionStorage", "localStorage", "cookieStorage", "browserStorage"],
        answer: 1
    },
    {
        question: "Method untuk mengubah object JavaScript menjadi JSON string adalah...",
        options: ["JSON.parse()", "JSON.object()", "JSON.stringify()", "JSON.convert()"],
        answer: 2
    }
];

let currentQuestion = 0;
let quizScore = 0;
let selectedAnswer = null;

function getHighScore() {
    return Number(localStorage.getItem(QUIZ_KEY)) || 0;
}

function updateHighScoreDisplay() {
    const score = getHighScore();
    $("#start-high-score").textContent = `${score} / ${quizQuestions.length}`;
    $("#final-high-score").textContent = `${score} / ${quizQuestions.length}`;
}

function startQuiz() {
    currentQuestion = 0;
    quizScore = 0;
    selectedAnswer = null;

    $("#quiz-start").classList.add("hidden");
    $("#quiz-result").classList.add("hidden");
    $("#quiz-question").classList.remove("hidden");

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const question = quizQuestions[currentQuestion];

    selectedAnswer = null;
    $("#quiz-feedback").textContent = "";
    $("#quiz-feedback").className = "text-sm font-semibold";
    $("#next-question").disabled = true;
    $("#next-question").innerHTML = `Berikutnya <i class="ti ti-arrow-right ml-1"></i>`;

    $("#quiz-progress").textContent =
        `Soal ${currentQuestion + 1} dari ${quizQuestions.length}`;

    $("#quiz-score").textContent = `Skor: ${quizScore}`;

    $("#quiz-progress-bar").style.width =
        `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;

    $("#quiz-question-text").textContent = question.question;
    $("#quiz-options").innerHTML = "";

    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className =
            "quiz-option w-full text-left px-5 py-4 rounded-xl border-2 border-slate-200 font-medium hover:border-violet-400 hover:bg-violet-50 transition";
        button.dataset.index = index;
        button.innerHTML = `
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold mr-3">
                ${String.fromCharCode(65 + index)}
            </span>${escapeHTML(option)}`;

        button.addEventListener("click", () => selectAnswer(index));
        $("#quiz-options").appendChild(button);
    });
}

function selectAnswer(index) {
    if (selectedAnswer !== null) return;

    selectedAnswer = index;

    const question = quizQuestions[currentQuestion];
    const buttons = $("#quiz-options").querySelectorAll(".quiz-option");

    buttons.forEach((button, buttonIndex) => {
        button.disabled = true;

        if (buttonIndex === question.answer) {
            button.classList.add("correct");
        }

        if (buttonIndex === index) {
            button.classList.add("selected");
        }

        if (buttonIndex === index && index !== question.answer) {
            button.classList.add("wrong");
        }
    });

    if (index === question.answer) {
        quizScore++;
        $("#quiz-feedback").textContent = "✓ Jawaban benar!";
        $("#quiz-feedback").classList.add("text-green-600");
    } else {
        $("#quiz-feedback").textContent =
            `✗ Kurang tepat. Jawaban benar: ${String.fromCharCode(65 + question.answer)}.`;
        $("#quiz-feedback").classList.add("text-red-600");
    }

    $("#quiz-score").textContent = `Skor: ${quizScore}`;
    $("#next-question").disabled = false;

    if (currentQuestion === quizQuestions.length - 1) {
        $("#next-question").innerHTML =
            `Lihat Hasil <i class="ti ti-trophy ml-1"></i>`;
    }
}

function finishQuiz() {
    $("#quiz-question").classList.add("hidden");
    $("#quiz-result").classList.remove("hidden");

    const oldHighScore = getHighScore();

    if (quizScore > oldHighScore) {
        localStorage.setItem(QUIZ_KEY, quizScore);
    }

    $("#final-score").textContent =
        `${quizScore} / ${quizQuestions.length}`;

    updateHighScoreDisplay();
}

$("#start-quiz").addEventListener("click", startQuiz);
$("#restart-quiz").addEventListener("click", startQuiz);

$("#next-question").addEventListener("click", () => {
    if (selectedAnswer === null) return;

    if (currentQuestion < quizQuestions.length - 1) {
        currentQuestion++;
        renderQuizQuestion();
    } else {
        finishQuiz();
    }
});


/* ==================== INITIALIZATION ==================== */

function initializeApplication() {
    const today = new Date().toISOString().split("T")[0];
    $("#expense-date").value = today;

    renderExpenses();
    updateExpenseSummary();
    renderBookmarks();
    updateHighScoreDisplay();

    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);

    if (["expense", "bookmark", "quiz"].includes(savedTab)) {
        activateTab(savedTab);
    } else {
        activateTab("expense");
    }
}

initializeApplication();

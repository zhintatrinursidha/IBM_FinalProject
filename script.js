/* =========================================================
   script.js — DompetKu Application Logic
   Vanilla JavaScript, no external libraries.

   Sections:
   1. Constants & State
   2. localStorage Helpers
   3. Utility Functions
   4. Smart Assistant — Auto-category & Insights
   5. Summary Updater
   6. Rendering — Transaction Cards
   7. Filter Logic
   8. Form — Add / Edit
   9. Delete with Confirmation Modal
   10. Event Listeners (init)
   ========================================================= */

'use strict';

// =========================================================
// 1. CONSTANTS & STATE
// =========================================================

/** Storage key for localStorage */
const STORAGE_KEY = 'dompetku_transactions';

/**
 * Auto-category keyword map.
 * Keys are lowercase keywords; values are category names.
 */
const KEYWORD_CATEGORY_MAP = {
  // Transportasi
  grab: 'Transportasi',
  gojek: 'Transportasi',
  ojek: 'Transportasi',
  bensin: 'Transportasi',
  bbm: 'Transportasi',
  parkir: 'Transportasi',
  bus: 'Transportasi',
  mrt: 'Transportasi',
  krl: 'Transportasi',
  kereta: 'Transportasi',
  taxi: 'Transportasi',
  taksi: 'Transportasi',
  angkot: 'Transportasi',
  motor: 'Transportasi',
  tol: 'Transportasi',

  // Makanan
  makan: 'Makanan',
  minum: 'Makanan',
  kopi: 'Makanan',
  coffee: 'Makanan',
  warteg: 'Makanan',
  warung: 'Makanan',
  resto: 'Makanan',
  restoran: 'Makanan',
  nasi: 'Makanan',
  mie: 'Makanan',
  bakso: 'Makanan',
  soto: 'Makanan',
  ayam: 'Makanan',
  pizza: 'Makanan',
  burger: 'Makanan',
  indomie: 'Makanan',
  snack: 'Makanan',
  jajan: 'Makanan',
  sarapan: 'Makanan',
  siang: 'Makanan',
  malam: 'Makanan',
  susu: 'Makanan',
  boba: 'Makanan',
  minuman: 'Makanan',

  // Tagihan
  listrik: 'Tagihan',
  pln: 'Tagihan',
  wifi: 'Tagihan',
  internet: 'Tagihan',
  pulsa: 'Tagihan',
  kuota: 'Tagihan',
  air: 'Tagihan',
  pdam: 'Tagihan',
  iuran: 'Tagihan',
  token: 'Tagihan',
  telepon: 'Tagihan',
  cicilan: 'Tagihan',
  bulanan: 'Tagihan',

  // Belanja
  belanja: 'Belanja',
  baju: 'Belanja',
  sepatu: 'Belanja',
  buku: 'Belanja',
  alat: 'Belanja',
  shopee: 'Belanja',
  tokopedia: 'Belanja',
  lazada: 'Belanja',
  indomaret: 'Belanja',
  alfamart: 'Belanja',
  supermarket: 'Belanja',
  minimarket: 'Belanja',

  // Gaji
  gaji: 'Gaji',
  salary: 'Gaji',
  upah: 'Gaji',
  honor: 'Gaji',
  freelance: 'Gaji',
  bonus: 'Gaji',
  thr: 'Gaji',
  lembur: 'Gaji',

  // Nabung
  nabung: 'Nabung',
  tabungan: 'Nabung',
  celengan: 'Nabung',
  deposito: 'Nabung',
  reksadana: 'Nabung',
  investasi: 'Nabung',
  saving: 'Nabung',
  savings: 'Nabung',
};

/** Category color mapping (bg + text pairs) for badges */
const CATEGORY_COLORS = {
  Makanan:      'bg-orange-100 text-orange-700',
  Transportasi: 'bg-blue-100 text-blue-700',
  Belanja:      'bg-purple-100 text-purple-700',
  Tagihan:      'bg-yellow-100 text-yellow-700',
  Gaji:         'bg-green-100 text-green-700',
  Lainnya:      'bg-gray-100 text-gray-600',
  Nabung:       'bg-blue-100 text-blue-800',
};

/** Category icons (simple emoji-style symbols) */
const CATEGORY_ICONS = {
  Makanan:      '🍽️',
  Transportasi: '🚗',
  Belanja:      '🛍️',
  Tagihan:      '📱',
  Gaji:         '💼',
  Lainnya:      '📂',
  Nabung:       '🏦',
};

/** App state: current filter values */
const state = {
  filterType: 'all',       // 'all' | 'pemasukan' | 'pengeluaran'
  filterCategory: 'all',   // 'all' | kategori name
  pendingDeleteId: null,   // ID of transaction pending deletion
};

// =========================================================
// 2. LOCALSTORAGE HELPERS
// =========================================================

/**
 * Load all transactions from localStorage.
 * @returns {Array} Array of transaction objects.
 */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // If data is corrupted, start fresh
    return [];
  }
}

/**
 * Save transactions array to localStorage.
 * @param {Array} transactions
 */
function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// =========================================================
// 3. UTILITY FUNCTIONS
// =========================================================

/**
 * Format a number as Rupiah currency string.
 * @param {number} amount
 * @returns {string} e.g. "Rp 150.000"
 */
function formatRupiah(amount) {
  return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
}

/**
 * Format a date string (YYYY-MM-DD) to locale date.
 * @param {string} dateStr
 * @returns {string} e.g. "2 Jan 2025"
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Generate a simple unique ID (timestamp + random).
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Get today's date as YYYY-MM-DD string (local time).
 * @returns {string}
 */
function getTodayDate() {
  const d = new Date();
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// =========================================================
// 4. SMART ASSISTANT
// =========================================================

/**
 * Suggest a category based on the description text.
 * Checks each word of the description against KEYWORD_CATEGORY_MAP.
 * @param {string} description
 * @returns {string|null} Suggested category name, or null if no match.
 */
function suggestCategory(description) {
  const words = description.toLowerCase().split(/\s+/);
  for (const word of words) {
    // Also check if any keyword is a substring of the word
    for (const [keyword, category] of Object.entries(KEYWORD_CATEGORY_MAP)) {
      if (word.includes(keyword) || keyword.includes(word) && word.length >= 3) {
        return category;
      }
    }
  }
  return null;
}

/**
 * Generate smart insight messages based on current transactions.
 * @param {Array} transactions
 * @returns {Array<{text: string, type: 'info'|'warning'|'positive'}>}
 */
function generateInsights(transactions) {
  const insights = [];
  if (transactions.length === 0) return insights;

  const ym = getCurrentYearMonth();

  // Nabung-aware totals (all-time for context, this-month for savings rate)
  const totalIncome   = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  // Pengeluaran excludes Nabung
  const totalExpense  = transactions
    .filter(t => t.type === 'pengeluaran' && t.category !== 'Nabung')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings  = transactions
    .filter(t => t.type === 'pengeluaran' && t.category === 'Nabung')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense - totalSavings;

  // Month-specific for savings rate insight
  const incomeThisMonth = transactions
    .filter(t => t.type === 'pemasukan' && t.date.startsWith(ym))
    .reduce((sum, t) => sum + t.amount, 0);

  const nabungThisMonth = transactions
    .filter(t => t.type === 'pengeluaran' && t.category === 'Nabung' && t.date.startsWith(ym))
    .reduce((sum, t) => sum + t.amount, 0);

  // --- Insight 1: Biggest expense category (Nabung excluded) ---
  const expenseByCategory = {};
  transactions
    .filter(t => t.type === 'pengeluaran' && t.category !== 'Nabung')
    .forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a);

  if (sortedCategories.length > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    insights.push({
      type: 'info',
      icon: CATEGORY_ICONS[topCat] || '📊',
      text: `Pengeluaran terbesar kamu ada di kategori <strong>${topCat}</strong> sebesar ${formatRupiah(topAmount)}.`,
    });
  }

  // --- Insight 2: Warning if expense > income ---
  if (totalExpense > totalIncome && totalIncome > 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      text: `Hati-hati! Total pengeluaran (${formatRupiah(totalExpense)}) sudah <strong>melebihi pemasukan</strong> (${formatRupiah(totalIncome)}). Yuk kurangi pengeluaran!`,
    });
  } else if (totalExpense > 0 && totalIncome === 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      text: `Kamu punya pengeluaran tapi belum ada pemasukan tercatat. Jangan lupa catat pendapatanmu ya!`,
    });
  }

  // --- Insight 3: Positive message if balance is healthy ---
  if (balance > 0 && totalExpense > 0) {
    const savingsRate = Math.round((balance / totalIncome) * 100);
    if (savingsRate >= 20) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        text: `Saldo kamu sehat! Kamu berhasil menyisihkan <strong>${savingsRate}%</strong> dari total pemasukan. Pertahankan! 💪`,
      });
    } else {
      insights.push({
        type: 'positive',
        icon: '👍',
        text: `Saldo kamu masih positif. Coba tingkatkan tabunganmu hingga minimal 20% dari pemasukan ya!`,
      });
    }
  } else if (balance === 0 && totalIncome > 0) {
    insights.push({
      type: 'warning',
      icon: '⚖️',
      text: `Pengeluaran kamu pas dengan pemasukan. Coba sisihkan sedikit untuk tabungan darurat.`,
    });
  }

  // --- Insight 4 (new): Nabung / savings this month ---
  if (nabungThisMonth > 0 && incomeThisMonth > 0) {
    const nabungPct = Math.round((nabungThisMonth / incomeThisMonth) * 100);
    insights.push({
      type: 'positive',
      icon: '🏦',
      text: `Kamu sudah menabung <strong>${formatRupiah(nabungThisMonth)} (${nabungPct}%)</strong> dari pemasukan bulan ini. ${nabungPct >= 10 ? 'Keren, terus pertahankan! 🌟' : 'Coba tingkatkan lagi ya!'}`,
    });
  }

  // --- Insight 5: Budget alerts (from budget module) ---
  const budgetAlerts = generateBudgetInsights();
  budgetAlerts.forEach(a => insights.push(a));

  return insights;
}

// =========================================================
// 5. SUMMARY UPDATER
// =========================================================

/**
 * Recalculate and render summary cards (balance, income, expense).
 * @param {Array} transactions
 */
function updateSummary(transactions) {
  const totalIncome = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  // Nabung is type pengeluaran but excluded from "Total Pengeluaran" display
  const totalSavings = transactions
    .filter(t => t.type === 'pengeluaran' && t.category === 'Nabung')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'pengeluaran' && t.category !== 'Nabung')
    .reduce((sum, t) => sum + t.amount, 0);

  // Balance is reduced by ALL pengeluaran including Nabung
  const balance = totalIncome - totalExpense - totalSavings;

  // Update DOM
  document.getElementById('balance').textContent       = formatRupiah(balance);
  document.getElementById('total-income').textContent  = formatRupiah(totalIncome);
  document.getElementById('total-expense').textContent = formatRupiah(totalExpense);
  document.getElementById('total-savings').textContent = formatRupiah(totalSavings);

  // Color balance: red if negative
  const balanceEl = document.getElementById('balance');
  if (balance < 0) {
    balanceEl.classList.add('text-red-300');
  } else {
    balanceEl.classList.remove('text-red-300');
  }
}

/**
 * Render the Smart Insight panel.
 * @param {Array} transactions
 */
function updateInsights(transactions) {
  const panel = document.getElementById('insight-panel');
  const list  = document.getElementById('insight-list');

  const insights = generateInsights(transactions);

  if (insights.length === 0) {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');
  list.innerHTML = insights.map(insight => `
    <li class="insight-item ${insight.type}" role="listitem">
      <span aria-hidden="true" class="text-base leading-none mt-0.5">${insight.icon}</span>
      <span>${insight.text}</span>
    </li>
  `).join('');
}

// =========================================================
// 6. RENDERING — TRANSACTION CARDS
// =========================================================

/**
 * Build the HTML for a single transaction card.
 * @param {Object} transaction
 * @returns {string} HTML string
 */
function buildTransactionCard(transaction) {
  const isIncome   = transaction.type === 'pemasukan';
  const isNabung   = transaction.category === 'Nabung';

  // Nabung gets blue styling (not red like other pengeluaran)
  const amountClass  = isIncome ? 'text-income' : isNabung ? 'text-primary' : 'text-expense';
  const amountPrefix = isIncome ? '+' : '−';
  const cardClass    = isIncome ? 'income' : isNabung ? 'nabung' : 'expense';
  const badgeColors  = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS['Lainnya'];
  const catIcon      = CATEGORY_ICONS[transaction.category]  || '📂';

  return `
    <article
      class="transaction-card ${cardClass} bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-3 highlight-new"
      data-id="${transaction.id}"
      aria-label="Transaksi: ${transaction.description}, ${amountPrefix}${formatRupiah(transaction.amount)}"
    >
      <!-- Left: icon + details -->
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <span class="text-xl leading-none mt-0.5 flex-shrink-0" aria-hidden="true">${catIcon}</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm text-gray-800 truncate">${escapeHtml(transaction.description)}</p>
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <span class="category-badge ${badgeColors}">${transaction.category}</span>
            <span class="text-xs text-gray-400">${formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>

      <!-- Right: amount + actions -->
      <div class="flex flex-col items-end gap-2 flex-shrink-0">
        <span class="font-bold text-sm ${amountClass}">
          ${amountPrefix}${formatRupiah(transaction.amount)}
        </span>
        <div class="flex gap-1">
          <button
            class="btn-edit p-1.5 rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            data-id="${transaction.id}"
            data-action="edit"
            aria-label="Edit transaksi ${escapeHtml(transaction.description)}"
          >
            <!-- Pencil icon -->
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.232 5.232l3.536 3.536M9 13l-4 1 1-4L16.768 2.768a2 2 0 012.828 2.828L9 13z"/>
            </svg>
          </button>
          <button
            class="btn-delete p-1.5 rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-expense"
            data-id="${transaction.id}"
            data-action="delete"
            aria-label="Hapus transaksi ${escapeHtml(transaction.description)}"
          >
            <!-- Trash icon -->
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Escape HTML entities to prevent XSS in user-generated content.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Render transaction list based on current filters.
 * Also updates filter tab counters.
 */
function renderTransactions() {
  const transactions = loadTransactions();

  // Update summary & insights whenever we re-render
  updateSummary(transactions);
  updateInsights(transactions);
  // Re-render budget cards so spending totals stay in sync
  renderBudget();
  // Re-render statistics charts
  renderStatistik();

  // Update type filter counters
  document.getElementById('count-all').textContent     = `(${transactions.length})`;
  document.getElementById('count-income').textContent  = `(${transactions.filter(t => t.type === 'pemasukan').length})`;
  document.getElementById('count-expense').textContent = `(${transactions.filter(t => t.type === 'pengeluaran').length})`;

  // Apply filters
  const filtered = transactions.filter(t => {
    const matchType     = state.filterType === 'all' || t.type === state.filterType;
    const matchCategory = state.filterCategory === 'all' || t.category === state.filterCategory;
    return matchType && matchCategory;
  });

  const listEl   = document.getElementById('transaction-list');
  const emptyEl  = document.getElementById('empty-state');

  if (filtered.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    emptyEl.classList.add('flex');
  } else {
    emptyEl.classList.add('hidden');
    emptyEl.classList.remove('flex');
    // Most recent first (newest date, then newest added by ID)
    const sorted = [...filtered].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.id.localeCompare(a.id);
    });
    listEl.innerHTML = sorted.map(buildTransactionCard).join('');
  }
}

// =========================================================
// 7. FILTER LOGIC
// =========================================================

/**
 * Initialise filter tab buttons (type filter).
 */
function initTypeFilters() {
  const buttons = document.querySelectorAll('.filter-type-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update state
      state.filterType = btn.dataset.filterType;

      // Update aria-pressed and active class
      buttons.forEach(b => {
        const isActive = b.dataset.filterType === state.filterType;
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        b.classList.toggle('active-filter', isActive);
      });

      renderTransactions();
    });
  });
}

/**
 * Initialise category dropdown filter.
 */
function initCategoryFilter() {
  document.getElementById('filter-category').addEventListener('change', (e) => {
    state.filterCategory = e.target.value;
    renderTransactions();
  });
}

// =========================================================
// 8. FORM — ADD / EDIT
// =========================================================

/** DOM refs cached once */
const formEl         = document.getElementById('transaction-form');
const descInput      = document.getElementById('desc');
const amountInput    = document.getElementById('amount');
const typeSelect     = document.getElementById('type');
const categorySelect = document.getElementById('category');
const dateInput      = document.getElementById('date');
const editIdInput    = document.getElementById('edit-id');
const submitBtn      = document.getElementById('submit-btn');
const formTitle      = document.getElementById('form-heading');
const autoCatBadge   = document.getElementById('auto-cat-badge');

/**
 * Reset the form to "Add" mode.
 * (cancel-edit-btn no longer exists in the Beranda form — guard safely)
 */
function resetForm() {
  formEl.reset();
  editIdInput.value     = '';
  dateInput.value       = getTodayDate();
  submitBtn.textContent = 'Simpan Transaksi';
  if (formTitle) formTitle.textContent = 'Tambah Transaksi';
  autoCatBadge.classList.add('hidden');
  clearValidationErrors();
}

/**
 * Populate the form for editing an existing transaction.
 * @param {string} id
 */
function loadTransactionForEdit(id) {
  const transactions = loadTransactions();
  const txn = transactions.find(t => t.id === id);
  if (!txn) return;

  editIdInput.value        = txn.id;
  descInput.value          = txn.description;
  amountInput.value        = txn.amount;
  typeSelect.value         = txn.type;
  categorySelect.value     = txn.category;
  dateInput.value          = txn.date;

  submitBtn.textContent    = 'Update Transaksi';
  cancelEditBtn.classList.remove('hidden');
  formTitle.textContent    = 'Edit Transaksi';
  autoCatBadge.classList.add('hidden');
  clearValidationErrors();

  // Scroll smoothly to form
  formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  descInput.focus();
}

/**
 * Validate form fields.
 * @returns {boolean} true if valid
 */
function validateForm() {
  let valid = true;
  clearValidationErrors();

  const desc   = descInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!desc) {
    showError('desc-error');
    descInput.classList.add('border-expense');
    valid = false;
  }

  if (!amountInput.value || isNaN(amount) || amount <= 0) {
    showError('amount-error');
    amountInput.classList.add('border-expense');
    valid = false;
  }

  return valid;
}

/** Show a validation error message by its element ID */
function showError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/** Hide all validation error messages and reset input borders */
function clearValidationErrors() {
  ['desc-error', 'amount-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  descInput.classList.remove('border-expense');
  amountInput.classList.remove('border-expense');
}

/**
 * Handle form submission — creates or updates a transaction.
 * @param {Event} e
 */
function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const transactions = loadTransactions();
  const isEdit = editIdInput.value !== '';

  const txnData = {
    description: descInput.value.trim(),
    amount:      parseFloat(amountInput.value),
    type:        typeSelect.value,
    category:    categorySelect.value,
    date:        dateInput.value || getTodayDate(),
  };

  if (isEdit) {
    const idx = transactions.findIndex(t => t.id === editIdInput.value);
    if (idx !== -1) {
      transactions[idx] = { ...transactions[idx], ...txnData };
    }
  } else {
    transactions.push({ id: generateId(), ...txnData });
    // Show toast confirmation only when adding a new transaction from Beranda form
    showToast('Transaksi berhasil disimpan! ✓');
  }

  saveTransactions(transactions);
  resetForm();
  renderTransactions();
}

/**
 * Auto-suggest category while the user types the description.
 */
function handleDescriptionInput() {
  const desc      = descInput.value.trim();
  const suggested = suggestCategory(desc);

  if (suggested) {
    categorySelect.value = suggested;
    autoCatBadge.classList.remove('hidden');
  } else {
    autoCatBadge.classList.add('hidden');
  }

  // Apply Nabung type-lock after auto-category
  applyNabungTypeLock(categorySelect.value);

  // Clear description error on input
  if (desc) {
    document.getElementById('desc-error').classList.add('hidden');
    descInput.classList.remove('border-expense');
  }
}

/**
 * If category is Nabung, force type to pengeluaran and disable the select.
 * Otherwise re-enable it.
 * Works for both the Beranda form and (via separate call) the edit modal.
 * @param {string} category
 * @param {HTMLSelectElement} [typeEl] - defaults to the main typeSelect
 * @param {string} [lockNoteId]        - id of the lock-note span
 */
function applyNabungTypeLock(category, typeEl, lockNoteId) {
  const tSel  = typeEl    || typeSelect;
  const noteId = lockNoteId || 'type-lock-note';
  const noteEl = document.getElementById(noteId);

  if (category === 'Nabung') {
    tSel.value    = 'pengeluaran';
    tSel.disabled = true;
    if (noteEl) noteEl.classList.remove('hidden');
  } else {
    tSel.disabled = false;
    if (noteEl) noteEl.classList.add('hidden');
  }
}

// =========================================================
// 9. DELETE WITH CONFIRMATION MODAL
// =========================================================

const confirmModal     = document.getElementById('confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelModalBtn   = document.getElementById('cancel-modal-btn');

/**
 * Show the delete confirmation modal for a given transaction ID.
 * @param {string} id
 */
function showDeleteModal(id) {
  state.pendingDeleteId = id;
  confirmModal.classList.remove('hidden');
  // Query fresh — the button may have been replaced by patchConfirmDeleteBtn
  const freshBtn = document.getElementById('confirm-delete-btn');
  if (freshBtn) freshBtn.focus();
}

/** Hide the confirmation modal and reset all pending delete IDs. */
function hideDeleteModal() {
  confirmModal.classList.add('hidden');
  state.pendingDeleteId = null;
  // Also reset budget pending delete and restore modal default text
  if (typeof pendingDeleteBudgetId !== 'undefined' && pendingDeleteBudgetId !== null) {
    pendingDeleteBudgetId = null;
    document.getElementById('modal-title').textContent = 'Hapus Transaksi?';
    confirmModal.querySelector('p').textContent =
      'Transaksi ini akan dihapus permanen dan tidak dapat dikembalikan.';
  }
}

/**
 * Execute the deletion of the pending transaction.
 */
function executeDelete() {
  if (!state.pendingDeleteId) return;

  let transactions = loadTransactions();
  transactions = transactions.filter(t => t.id !== state.pendingDeleteId);
  saveTransactions(transactions);
  hideDeleteModal();
  renderTransactions();
}

// Close modal on backdrop click
confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) hideDeleteModal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !confirmModal.classList.contains('hidden')) {
    hideDeleteModal();
  }
});

// =========================================================
// 10. EVENT LISTENERS & INIT
// =========================================================

/**
 * Delegate click events on the transaction list
 * to handle edit and delete actions.
 */
function initTransactionListActions() {
  document.getElementById('transaction-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const { action, id } = btn.dataset;

    if (action === 'edit') {
      // Open the edit modal — no page navigation needed
      openEditModal(id);
    } else if (action === 'delete') {
      showDeleteModal(id);
    }
  });
}

/** Keyboard support: Enter/Space also trigger action buttons (handled natively for <button>) */

/**
 * App initialisation — called on DOMContentLoaded.
 */
function init() {
  // Set today's date as default in the form
  dateInput.value = getTodayDate();

  // Attach form submit handler
  formEl.addEventListener('submit', handleFormSubmit);

  // Auto-category on description input
  descInput.addEventListener('input', handleDescriptionInput);

  // Nabung type-lock: also trigger when user manually changes category
  categorySelect.addEventListener('change', () => {
    applyNabungTypeLock(categorySelect.value);
  });

  // Clear amount error on input
  amountInput.addEventListener('input', () => {
    if (parseFloat(amountInput.value) > 0) {
      document.getElementById('amount-error').classList.add('hidden');
      amountInput.classList.remove('border-expense');
    }
  });

  // Confirm delete modal buttons
  confirmDeleteBtn.addEventListener('click', executeDelete);
  cancelModalBtn.addEventListener('click', hideDeleteModal);

  // Filter buttons and category dropdown
  initTypeFilters();
  initCategoryFilter();

  // Delegate edit/delete actions from list
  initTransactionListActions();

  // Initialise edit modal
  initEditModal();

  // Initialise multi-page navigation (no-refresh SPA routing)
  initNavigation();

  // Initialise budget feature
  initBudget();

  // Initial render from localStorage
  renderTransactions();
}

// Bootstrap the app when the DOM is ready
document.addEventListener('DOMContentLoaded', init);

// =========================================================
// 11. NAVIGATION — SPA-style page switching
// =========================================================

/**
 * All page IDs that exist in the HTML.
 * The key matches the `data-page` attribute on nav buttons.
 */
const PAGES = ['beranda', 'transaksi', 'budget', 'statistik'];

/**
 * Switch to a named page.
 * Hides all other page divs, shows the target, and syncs
 * aria-current on all nav buttons (top + bottom).
 *
 * @param {string} targetPage  - one of PAGES values
 * @param {boolean} [scrollTop=true] - scroll main to top on switch
 */
function switchPage(targetPage) {
  if (!PAGES.includes(targetPage)) return;

  // Show / hide page regions
  PAGES.forEach(page => {
    const el = document.getElementById('page-' + page);
    if (!el) return;
    if (page === targetPage) {
      el.classList.remove('hidden');
      // Trigger entry animation by toggling the class
      el.classList.remove('page-enter');
      // Force reflow so animation re-runs
      void el.offsetWidth;
      el.classList.add('page-enter');
    } else {
      el.classList.add('hidden');
    }
  });

  // Sync aria-current on every nav button (top tabs + bottom nav + goto buttons)
  document.querySelectorAll('[data-page]').forEach(btn => {
    const isActive = btn.dataset.page === targetPage;
    // nav-tab-btn and nav-bottom-btn use aria-current
    if (btn.classList.contains('nav-tab-btn') || btn.classList.contains('nav-bottom-btn')) {
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    }
  });

  // Scroll main content area back to top smoothly
  const main = document.getElementById('main-content');
  if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Attach click handlers to all navigation elements:
 *  - .nav-tab-btn    (desktop top tabs)
 *  - .nav-bottom-btn (mobile bottom nav)
 *  - .nav-goto-btn   (inline "go to page" shortcut buttons)
 *
 * When edit is triggered from Beranda's quick-action button,
 * we navigate to Transaksi first so the form is visible.
 */
function initNavigation() {
  // One delegated listener on the whole document covers all nav buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn) return;

    // Only handle nav-tab, nav-bottom, and nav-goto buttons — not filter buttons
    if (
      btn.classList.contains('nav-tab-btn') ||
      btn.classList.contains('nav-bottom-btn') ||
      btn.classList.contains('nav-goto-btn')
    ) {
      switchPage(btn.dataset.page);
    }
  });

  // Edit navigation is already handled inside initTransactionListActions,
  // which calls switchPage('transaksi') before loadTransactionForEdit.

  // Start on Beranda
  switchPage('beranda');
}

// =========================================================
// 12. BUDGET MODULE
// =========================================================

/** localStorage key for budgets (separate from transactions) */
const BUDGET_STORAGE_KEY = 'dompetku_budgets';

// ── localStorage helpers ──────────────────────────────────

/**
 * Load all budgets from localStorage.
 * @returns {Array<{id:string, category:string, limit:number}>}
 */
function loadBudgets() {
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save budgets array to localStorage.
 * @param {Array} budgets
 */
function saveBudgets(budgets) {
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
}

// ── Calculation helpers ───────────────────────────────────

/**
 * Return a "YYYY-MM" string for the current month (local time).
 * @returns {string}
 */
function getCurrentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Calculate how much has been spent in a category during the current month.
 * Uses only existing transaction data — no new storage.
 *
 * @param {string} category
 * @returns {number}
 */
function getSpentThisMonth(category) {
  const ym = getCurrentYearMonth();
  return loadTransactions()
    .filter(t =>
      t.type === 'pengeluaran' &&
      t.category === category &&
      t.date.startsWith(ym)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Determine progress bar colour class based on usage percentage.
 * < 70%  → blue
 * 70-99% → orange
 * ≥ 100% → red
 *
 * @param {number} pct - usage percentage (0-∞)
 * @returns {string} CSS class name
 */
function budgetBarColor(pct) {
  if (pct >= 100) return 'budget-bar-red';
  if (pct >= 70)  return 'budget-bar-orange';
  return 'budget-bar-blue';
}

// ── Rendering ─────────────────────────────────────────────

/**
 * Build HTML for a single budget card.
 * @param {{id:string, category:string, limit:number}} budget
 * @returns {string}
 */
function buildBudgetCard(budget) {
  const spent   = getSpentThisMonth(budget.category);
  const pct     = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
  const barPct  = Math.min(pct, 100);          // cap bar at 100%
  const sisa    = budget.limit - spent;
  const color   = budgetBarColor(pct);
  const catIcon = CATEGORY_ICONS[budget.category] || '📂';

  // Warning banner HTML
  let bannerHtml = '';
  if (pct >= 100) {
    bannerHtml = `
      <div class="budget-warning-banner exceeded" role="alert">
        <span aria-hidden="true">🚨</span>
        Budget <strong>${escapeHtml(budget.category)}</strong> sudah terlampaui! Pengeluaran melebihi limit.
      </div>`;
  } else if (pct >= 70) {
    bannerHtml = `
      <div class="budget-warning-banner warn" role="status">
        <span aria-hidden="true">⚠️</span>
        Budget <strong>${escapeHtml(budget.category)}</strong> hampir habis — tersisa <strong>${formatRupiah(sisa)}</strong>.
      </div>`;
  }

  return `
    <article
      class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      data-budget-id="${budget.id}"
      aria-label="Budget ${escapeHtml(budget.category)}: ${pct}% terpakai"
    >
      <!-- Header: icon + name + actions -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl leading-none" aria-hidden="true">${catIcon}</span>
          <span class="font-semibold text-sm text-gray-800">${escapeHtml(budget.category)}</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="btn-budget-edit p-1.5 rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            data-budget-action="edit"
            data-budget-id="${budget.id}"
            aria-label="Edit budget ${escapeHtml(budget.category)}"
          >
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.232 5.232l3.536 3.536M9 13l-4 1 1-4L16.768 2.768a2 2 0 012.828 2.828L9 13z"/>
            </svg>
          </button>
          <button
            class="btn-budget-delete p-1.5 rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-expense"
            data-budget-action="delete"
            data-budget-id="${budget.id}"
            aria-label="Hapus budget ${escapeHtml(budget.category)}"
          >
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="flex justify-between text-xs text-gray-500 mb-2">
        <span>Terpakai: <strong class="text-gray-700">${formatRupiah(spent)}</strong></span>
        <span>Limit: <strong class="text-gray-700">${formatRupiah(budget.limit)}</strong></span>
      </div>

      <!-- Progress bar -->
      <div class="budget-bar-track" aria-label="${pct}% terpakai">
        <div
          class="budget-bar-fill ${color}"
          style="width: ${barPct}%"
          role="progressbar"
          aria-valuenow="${pct}"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <!-- Percentage + sisa -->
      <div class="flex justify-between items-center mt-1.5">
        <span class="text-xs font-semibold ${pct >= 100 ? 'text-red-600' : pct >= 70 ? 'text-accent' : 'text-primary'}">${pct}% terpakai</span>
        <span class="text-xs text-gray-400">Sisa: <span class="${sisa < 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}">${sisa < 0 ? '-' : ''}${formatRupiah(Math.abs(sisa))}</span></span>
      </div>

      ${bannerHtml}
    </article>
  `;
}

/**
 * Render all budget cards and toggle the empty state.
 * Called from renderTransactions() and budget CRUD operations.
 */
function renderBudget() {
  const budgets  = loadBudgets();
  const listEl   = document.getElementById('budget-list');
  const emptyEl  = document.getElementById('budget-empty-state');

  if (!listEl) return; // page not in DOM yet (safety guard)

  if (budgets.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    emptyEl.classList.add('flex');
  } else {
    emptyEl.classList.add('hidden');
    emptyEl.classList.remove('flex');
    // Sort by category name for consistent order
    const sorted = [...budgets].sort((a, b) => a.category.localeCompare(b.category));
    listEl.innerHTML = sorted.map(buildBudgetCard).join('');
  }

  // Update the month label in the form header
  const labelEl = document.getElementById('budget-month-label');
  if (labelEl) {
    const d = new Date();
    labelEl.textContent = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }
}

// ── Smart Insight hook ────────────────────────────────────

/**
 * Generate budget-related insight items for the Smart Assistant panel.
 * Returns insight objects in the same shape as generateInsights().
 *
 * @returns {Array<{icon:string, text:string, type:string}>}
 */
function generateBudgetInsights() {
  const budgets = loadBudgets();
  const insights = [];

  budgets.forEach(budget => {
    const spent = getSpentThisMonth(budget.category);
    if (spent === 0) return; // nothing spent yet, no alert needed

    const pct = Math.round((spent / budget.limit) * 100);
    if (pct >= 100) {
      insights.push({
        type: 'warning',
        icon: '🚨',
        text: `Budget <strong>${budget.category}</strong> sudah <strong>terlampaui</strong>! Terpakai ${formatRupiah(spent)} dari limit ${formatRupiah(budget.limit)}.`,
      });
    } else if (pct >= 70) {
      insights.push({
        type: 'warning',
        icon: '📊',
        text: `Budget <strong>${budget.category}</strong> sudah terpakai <strong>${pct}%</strong> — tersisa ${formatRupiah(budget.limit - spent)}.`,
      });
    }
  });

  return insights;
}

// ── Form helpers ──────────────────────────────────────────

/** Cached budget form DOM refs */
const budgetFormEl      = document.getElementById('budget-form');
const budgetCategoryEl  = document.getElementById('budget-category');
const budgetLimitEl     = document.getElementById('budget-limit');
const budgetEditIdEl    = document.getElementById('budget-edit-id');
const budgetSubmitBtn   = document.getElementById('budget-submit-btn');
const budgetCancelBtn   = document.getElementById('budget-cancel-btn');
const budgetFormHeading = document.getElementById('budget-form-heading');

/** Reset budget form to "Add" mode */
function resetBudgetForm() {
  budgetFormEl.reset();
  budgetEditIdEl.value = '';
  budgetSubmitBtn.textContent = 'Simpan Budget';
  budgetCancelBtn.classList.add('hidden');
  budgetFormHeading.textContent = 'Atur Budget';
  clearBudgetErrors();
}

/** Show a budget validation error */
function showBudgetError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/** Clear all budget validation errors */
function clearBudgetErrors() {
  ['budget-category-error', 'budget-limit-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  budgetLimitEl.classList.remove('border-expense');
}

/**
 * Validate budget form.
 * @returns {boolean} true if valid
 */
function validateBudgetForm() {
  let valid = true;
  clearBudgetErrors();

  const limit    = parseFloat(budgetLimitEl.value);
  const category = budgetCategoryEl.value;
  const editId   = budgetEditIdEl.value;

  if (!budgetLimitEl.value || isNaN(limit) || limit <= 0) {
    showBudgetError('budget-limit-error');
    budgetLimitEl.classList.add('border-expense');
    valid = false;
  }

  // Uniqueness check: category must not already have a budget
  // (unless we are editing that same budget)
  const existing = loadBudgets().find(b => b.category === category && b.id !== editId);
  if (existing) {
    showBudgetError('budget-category-error');
    valid = false;
  }

  return valid;
}

/**
 * Handle budget form submission — add or update a budget.
 * @param {Event} e
 */
function handleBudgetSubmit(e) {
  e.preventDefault();
  if (!validateBudgetForm()) return;

  const budgets = loadBudgets();
  const isEdit  = budgetEditIdEl.value !== '';
  const data = {
    category: budgetCategoryEl.value,
    limit:    parseFloat(budgetLimitEl.value),
  };

  if (isEdit) {
    const idx = budgets.findIndex(b => b.id === budgetEditIdEl.value);
    if (idx !== -1) budgets[idx] = { ...budgets[idx], ...data };
  } else {
    budgets.push({ id: generateId(), ...data });
  }

  saveBudgets(budgets);
  resetBudgetForm();
  renderBudget();
  // Refresh insights on Beranda since budget state changed
  updateInsights(loadTransactions());
}

/**
 * Populate the budget form for editing.
 * @param {string} id
 */
function loadBudgetForEdit(id) {
  const budget = loadBudgets().find(b => b.id === id);
  if (!budget) return;

  budgetEditIdEl.value        = budget.id;
  budgetCategoryEl.value      = budget.category;
  budgetLimitEl.value         = budget.limit;
  budgetSubmitBtn.textContent = 'Update Budget';
  budgetCancelBtn.classList.remove('hidden');
  budgetFormHeading.textContent = 'Edit Budget';
  clearBudgetErrors();

  budgetFormEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  budgetLimitEl.focus();
}

// ── Delete with confirmation ──────────────────────────────

/** ID of the budget pending deletion */
let pendingDeleteBudgetId = null;

/**
 * Show the delete confirmation modal for a budget.
 * Reuses the shared confirm modal by temporarily changing its text.
 * @param {string} id
 */
function showBudgetDeleteModal(id) {
  pendingDeleteBudgetId = id;
  const budget = loadBudgets().find(b => b.id === id);

  // Reuse the existing modal — update its copy temporarily
  document.getElementById('modal-title').textContent =
    `Hapus Budget ${budget ? budget.category : ''}?`;
  document.getElementById('confirm-modal').querySelector('p').textContent =
    'Budget ini akan dihapus. Data transaksi tidak terpengaruh.';

  document.getElementById('confirm-modal').classList.remove('hidden');
  document.getElementById('confirm-delete-btn').focus();
}

/** Execute budget deletion (called by confirm modal) */
function executeBudgetDelete() {
  if (!pendingDeleteBudgetId) return;
  const budgets = loadBudgets().filter(b => b.id !== pendingDeleteBudgetId);
  saveBudgets(budgets);
  pendingDeleteBudgetId = null;
  renderBudget();
  updateInsights(loadTransactions());
}

// ── Event delegation for budget list ─────────────────────

/** Attach click delegation for budget card actions (edit / delete) */
function initBudgetListActions() {
  document.getElementById('budget-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-budget-action]');
    if (!btn) return;
    const { budgetAction, budgetId } = btn.dataset;
    if (budgetAction === 'edit')   loadBudgetForEdit(budgetId);
    if (budgetAction === 'delete') showBudgetDeleteModal(budgetId);
  });
}

// ── Wire confirm modal to support both txn & budget delete ──

/**
 * The shared confirm modal's "Ya, Hapus" button already calls executeDelete()
 * via the listener attached in init(). We need it to also handle budget deletes.
 * We replace the single listener with a dispatcher that checks which entity
 * is pending deletion.
 */
function patchConfirmDeleteBtn() {
  const btn = document.getElementById('confirm-delete-btn');
  // Remove the original listener by cloning the node (cleanest approach)
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  newBtn.addEventListener('click', () => {
    if (pendingDeleteBudgetId) {
      // Reset modal text back to transaction default
      document.getElementById('modal-title').textContent = 'Hapus Transaksi?';
      document.getElementById('confirm-modal').querySelector('p').textContent =
        'Transaksi ini akan dihapus permanen dan tidak dapat dikembalikan.';
      executeBudgetDelete();
    } else {
      executeDelete();
    }
    document.getElementById('confirm-modal').classList.add('hidden');
  });
}

// ── Init ─────────────────────────────────────────────────

/**
 * Initialise the Budget feature.
 * Called once from the main init() function.
 */
function initBudget() {
  budgetFormEl.addEventListener('submit', handleBudgetSubmit);
  budgetCancelBtn.addEventListener('click', resetBudgetForm);

  // Clear limit error on input
  budgetLimitEl.addEventListener('input', () => {
    if (parseFloat(budgetLimitEl.value) > 0) {
      document.getElementById('budget-limit-error').classList.add('hidden');
      budgetLimitEl.classList.remove('border-expense');
    }
  });

  // Clear category duplicate error when category changes
  budgetCategoryEl.addEventListener('change', () => {
    document.getElementById('budget-category-error').classList.add('hidden');
  });

  initBudgetListActions();
  patchConfirmDeleteBtn();
  renderBudget();
}

// =========================================================
// 13. STATISTIK MODULE
// =========================================================

/**
 * Palette for donut chart segments and legend swatches.
 * Using distinct hues + pattern hints in legend for accessibility
 * (not colour-only differentiation — legend also shows name + amount).
 */
const STAT_COLORS = {
  Makanan:      '#F97316', // orange
  Transportasi: '#2563EB', // blue
  Belanja:      '#8B5CF6', // violet
  Tagihan:      '#EAB308', // yellow
  Gaji:         '#16A34A', // green  (rarely expense, but included)
  Lainnya:      '#6B7280', // gray
};

/** Pattern labels for legend (screen-reader supplement) */
const STAT_PATTERNS = {
  Makanan:      '▲',
  Transportasi: '●',
  Belanja:      '◆',
  Tagihan:      '■',
  Gaji:         '★',
  Lainnya:      '○',
};

// ── Data helpers ──────────────────────────────────────────

/**
 * Build an array of the last N months as "YYYY-MM" strings,
 * ending with the current month, oldest first.
 * @param {number} n
 * @returns {string[]}
 */
function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(ym);
  }
  return months;
}

/**
 * Format a "YYYY-MM" string as a short month label, e.g. "Jan '25".
 * @param {string} ym
 * @returns {string}
 */
function formatMonthLabel(ym) {
  const [year, month] = ym.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('id-ID', { month: 'short' }) + " '" + String(year).slice(2);
}

/**
 * Aggregate totals per category for all-time pengeluaran.
 * @param {Array} transactions
 * @returns {Object} { Makanan: 0, ... }
 */
function aggregateExpenseByCategory(transactions) {
  const result = {};
  transactions
    // Exclude Nabung from the donut chart — shown as separate card
    .filter(t => t.type === 'pengeluaran' && t.category !== 'Nabung')
    .forEach(t => {
      result[t.category] = (result[t.category] || 0) + t.amount;
    });
  return result;
}

/**
 * Aggregate income/expense totals per month for the last 6 months.
 * @param {Array} transactions
 * @returns {Array<{ym, label, income, expense}>}
 */
function aggregateByMonth(transactions) {
  const months = getLastNMonths(6);
  return months.map(ym => {
    const income  = transactions
      .filter(t => t.type === 'pemasukan'   && t.date.startsWith(ym))
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'pengeluaran' && t.date.startsWith(ym))
      .reduce((s, t) => s + t.amount, 0);
    return { ym, label: formatMonthLabel(ym), income, expense };
  });
}

// ── SVG helpers ───────────────────────────────────────────

/**
 * Create an SVG element with the given tag and attributes.
 * @param {string} tag
 * @param {Object} attrs
 * @returns {SVGElement}
 */
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ── Donut chart ───────────────────────────────────────────

/**
 * Compute an SVG arc path string for a donut segment.
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {number} r  - outer radius
 * @param {number} startDeg - start angle in degrees (0 = top)
 * @param {number} endDeg   - end angle in degrees
 * @param {number} innerR   - inner radius (hole)
 * @returns {string} SVG path d attribute
 */
function donutArcPath(cx, cy, r, startDeg, endDeg, innerR) {
  const toRad = d => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const ix1 = cx + innerR * Math.cos(toRad(endDeg));
  const iy1 = cy + innerR * Math.sin(toRad(endDeg));
  const ix2 = cx + innerR * Math.cos(toRad(startDeg));
  const iy2 = cy + innerR * Math.sin(toRad(startDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    `L ${ix1} ${iy1}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2}`,
    'Z',
  ].join(' ');
}

/**
 * Render the donut chart and its legend.
 * @param {Object} expenseByCategory  e.g. { Makanan: 50000, ... }
 * @param {number} totalExpense
 */
function renderDonut(expenseByCategory, totalExpense) {
  const segmentsG  = document.getElementById('donut-segments');
  const legendUl   = document.getElementById('donut-legend');
  const srTable    = document.getElementById('donut-sr-table');
  const centerVal  = document.getElementById('donut-center-value');

  segmentsG.innerHTML = '';
  legendUl.innerHTML  = '';
  srTable.innerHTML   = '';

  // Update center text
  centerVal.textContent = formatRupiah(totalExpense);

  if (totalExpense === 0) {
    segmentsG.innerHTML = `<circle cx="90" cy="90" r="70" fill="#f3f4f6"/>`;
    legendUl.innerHTML  = `<li class="text-xs text-gray-400 italic">Belum ada pengeluaran</li>`;
    return;
  }

  // Sort categories by amount descending
  const entries = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a);

  let startDeg = 0;
  entries.forEach(([cat, amount]) => {
    const pct    = amount / totalExpense;
    const sweep  = pct * 360;
    const endDeg = startDeg + sweep;
    const color  = STAT_COLORS[cat] || '#9ca3af';
    const pctStr = Math.round(pct * 100) + '%';
    const pattern = STAT_PATTERNS[cat] || '○';

    // SVG segment — gap of 2° between slices for visual clarity
    const gapDeg = entries.length > 1 ? 1 : 0;
    const path = svgEl('path', {
      d:    donutArcPath(90, 90, 70, startDeg + gapDeg, endDeg - gapDeg, 54),
      fill: color,
      'aria-label': `${cat}: ${pctStr}`,
    });
    // Tooltip via SVG <title>
    const titleEl = svgEl('title');
    titleEl.textContent = `${pattern} ${cat}: ${formatRupiah(amount)} (${pctStr})`;
    path.appendChild(titleEl);
    segmentsG.appendChild(path);

    // Legend item
    const li = document.createElement('li');
    li.className = 'donut-legend-item';
    li.innerHTML = `
      <span class="donut-legend-swatch" style="background:${color}" aria-hidden="true"></span>
      <span class="donut-legend-label" title="${cat}">${pattern} ${cat}</span>
      <span class="donut-legend-values">
        <span class="donut-legend-amount">${formatRupiah(amount)}</span>
        <span class="donut-legend-pct">${pctStr}</span>
      </span>`;
    legendUl.appendChild(li);

    // SR table row
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${cat}</td><td>${formatRupiah(amount)}</td><td>${pctStr}</td>`;
    srTable.appendChild(tr);

    startDeg = endDeg;
  });
}

// ── Bar chart ─────────────────────────────────────────────

/**
 * Render the 6-month bar chart as inline SVG.
 * Uses a fixed viewBox; the SVG scales responsively via CSS.
 * @param {Array} monthData  from aggregateByMonth()
 */
function renderBarChart(monthData) {
  const svg     = document.getElementById('bar-svg');
  const srTable = document.getElementById('bar-sr-table');

  // Chart dimensions (viewBox coordinates)
  const W          = 560;
  const H          = 200;
  const padLeft    = 56;  // y-axis labels
  const padRight   = 12;
  const padTop     = 16;
  const padBottom  = 36;  // x-axis labels
  const chartW     = W - padLeft - padRight;
  const chartH     = H - padTop - padBottom;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('height', H);
  svg.innerHTML = '';
  srTable.innerHTML = '';

  const maxVal = Math.max(
    ...monthData.map(m => Math.max(m.income, m.expense)),
    1  // avoid division by zero
  );

  // Round max up to nearest nice number for y-axis
  const niceMax = Math.ceil(maxVal / 100000) * 100000 || 100000;

  const n        = monthData.length;
  const groupW   = chartW / n;
  const barW     = Math.min(groupW * 0.32, 28);
  const barGap   = 4;

  // ── Y-axis grid lines + labels ──
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const val = (niceMax / ySteps) * i;
    const y   = padTop + chartH - (val / niceMax) * chartH;

    // Grid line
    const line = svgEl('line', {
      x1: padLeft, y1: y, x2: W - padRight, y2: y,
      stroke: i === 0 ? '#d1d5db' : '#f3f4f6',
      'stroke-width': '1',
    });
    svg.appendChild(line);

    // Y-axis label (abbreviated: k = ribu, jt = juta)
    let label;
    if (val === 0) {
      label = '0';
    } else if (val >= 1_000_000) {
      label = (val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1) + 'jt';
    } else {
      label = (val / 1_000).toFixed(0) + 'k';
    }
    const txt = svgEl('text', {
      x: padLeft - 6, y: y + 4,
      'text-anchor': 'end',
      'font-size': '9',
      fill: '#9ca3af',
    });
    txt.textContent = label;
    svg.appendChild(txt);
  }

  // ── Bars + x-axis labels ──
  monthData.forEach((m, i) => {
    const groupX    = padLeft + i * groupW + groupW / 2;
    const incomeX   = groupX - barW - barGap / 2;
    const expenseX  = groupX + barGap / 2;

    const incomeH  = m.income  > 0 ? Math.max((m.income  / niceMax) * chartH, 3) : 0;
    const expenseH = m.expense > 0 ? Math.max((m.expense / niceMax) * chartH, 3) : 0;
    const incomeY  = padTop + chartH - incomeH;
    const expenseY = padTop + chartH - expenseH;

    // Income bar
    if (m.income > 0) {
      const bar = svgEl('rect', {
        x: incomeX, y: incomeY,
        width: barW, height: incomeH,
        fill: '#2563EB', rx: '3',
        class: 'bar-income',
      });
      const t = svgEl('title');
      t.textContent = `Pemasukan ${m.label}: ${formatRupiah(m.income)}`;
      bar.appendChild(t);
      svg.appendChild(bar);
    }

    // Expense bar
    if (m.expense > 0) {
      const bar = svgEl('rect', {
        x: expenseX, y: expenseY,
        width: barW, height: expenseH,
        fill: '#DC2626', rx: '3',
        class: 'bar-expense',
      });
      const t = svgEl('title');
      t.textContent = `Pengeluaran ${m.label}: ${formatRupiah(m.expense)}`;
      bar.appendChild(t);
      svg.appendChild(bar);
    }

    // X-axis label
    const xLabel = svgEl('text', {
      x: groupX, y: H - padBottom + 14,
      'text-anchor': 'middle',
      'font-size': '9',
      fill: '#9ca3af',
    });
    xLabel.textContent = m.label;
    svg.appendChild(xLabel);

    // SR table row
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${m.label}</td><td>${formatRupiah(m.income)}</td><td>${formatRupiah(m.expense)}</td>`;
    srTable.appendChild(tr);
  });
}

// ── Summary cards ─────────────────────────────────────────

/**
 * Render the two ratio summary cards for the current month.
 * @param {Array} transactions
 */
function renderStatSummaryCards(transactions) {
  const ym = getCurrentYearMonth();

  const incomeThisMonth = transactions
    .filter(t => t.type === 'pemasukan' && t.date.startsWith(ym))
    .reduce((s, t) => s + t.amount, 0);

  // Pengeluaran excludes Nabung for the expense ratio card
  const expenseThisMonth = transactions
    .filter(t => t.type === 'pengeluaran' && t.category !== 'Nabung' && t.date.startsWith(ym))
    .reduce((s, t) => s + t.amount, 0);

  // Nabung this month = actual savings deposited
  const nabungThisMonth = transactions
    .filter(t => t.type === 'pengeluaran' && t.category === 'Nabung' && t.date.startsWith(ym))
    .reduce((s, t) => s + t.amount, 0);

  const ratioEl     = document.getElementById('stat-expense-ratio');
  const ratioBar    = document.getElementById('stat-expense-ratio-bar');
  const savingsEl   = document.getElementById('stat-savings-rate');
  const savingsBar  = document.getElementById('stat-savings-bar');

  if (incomeThisMonth === 0) {
    ratioEl.textContent    = '—';
    savingsEl.textContent  = '—';
    ratioBar.style.width   = '0%';
    savingsBar.style.width = '0%';
    return;
  }

  // Rasio pengeluaran = pengeluaran (tanpa Nabung) / pemasukan
  const expenseRatio = Math.round((expenseThisMonth / incomeThisMonth) * 100);
  // Persentase tabungan = Nabung / pemasukan (not residual)
  const savingsRate  = Math.round((nabungThisMonth / incomeThisMonth) * 100);

  ratioEl.textContent  = expenseRatio + '%';
  ratioEl.style.color  = expenseRatio >= 100 ? '#DC2626' : expenseRatio >= 70 ? '#F97316' : '#1f2328';
  ratioBar.style.width = Math.min(expenseRatio, 100) + '%';
  ratioBar.className   = 'budget-bar-fill ' + (expenseRatio >= 100 ? 'budget-bar-red' : expenseRatio >= 70 ? 'budget-bar-orange' : 'budget-bar-blue');

  // Savings bar: always blue, no warning colours (as specified)
  savingsEl.textContent  = savingsRate + '%';
  savingsEl.style.color  = savingsRate >= 10 ? '#2563EB' : '#9ca3af';
  savingsBar.style.width = Math.min(savingsRate, 100) + '%';
  savingsBar.className   = 'budget-bar-fill budget-bar-blue';
}

// ── Master render ─────────────────────────────────────────

/**
 * Render all statistics sections.
 * Called from renderTransactions() whenever data changes.
 */
function renderStatistik() {
  const transactions = loadTransactions();

  const emptyEl   = document.getElementById('stats-empty');
  const contentEl = document.getElementById('stats-content');

  if (!emptyEl || !contentEl) return; // safety guard

  if (transactions.length === 0) {
    emptyEl.classList.remove('hidden');
    emptyEl.classList.add('flex');
    contentEl.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  emptyEl.classList.remove('flex');
  contentEl.classList.remove('hidden');

  // 1. Summary ratio cards
  renderStatSummaryCards(transactions);

  // 2. Donut chart
  const expByCategory = aggregateExpenseByCategory(transactions);
  const totalExp      = Object.values(expByCategory).reduce((s, v) => s + v, 0);
  renderDonut(expByCategory, totalExp);

  // 3. Bar chart
  const monthData = aggregateByMonth(transactions);
  renderBarChart(monthData);
}

// =========================================================
// 14. TOAST & EDIT MODAL
// =========================================================

/**
 * Show a short-lived toast notification at the bottom of the screen.
 * Automatically hides after ~2.5 s.
 * @param {string} message
 */
function showToast(message) {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toast-message');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;

  // Reset animation classes
  toast.classList.remove('hidden', 'animating-out');
  toast.classList.add('animating-in');

  // Auto-dismiss
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('animating-in');
    toast.classList.add('animating-out');
    // Hide after animation completes
    setTimeout(() => toast.classList.add('hidden'), 260);
  }, 2500);
}
showToast._timer = null; // static property for debounce

// ── Edit Modal ────────────────────────────────────────────

/**
 * Open the edit modal and pre-fill it with the given transaction's data.
 * This is the modal-based replacement for the old inline form edit flow.
 * @param {string} id - transaction ID
 */
function openEditModal(id) {
  const txn = loadTransactions().find(t => t.id === id);
  if (!txn) return;

  // Pre-fill modal fields
  document.getElementById('edit-modal-id').value    = txn.id;
  document.getElementById('edit-desc').value        = txn.description;
  document.getElementById('edit-amount').value      = txn.amount;
  document.getElementById('edit-type').value        = txn.type;
  document.getElementById('edit-category').value    = txn.category;
  document.getElementById('edit-date').value        = txn.date;

  // Apply Nabung type-lock in the edit modal
  applyNabungTypeLock(
    txn.category,
    document.getElementById('edit-type'),
    'edit-type-lock-note'
  );

  // Clear any previous validation errors
  clearEditModalErrors();

  // Show modal and focus first field
  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('edit-desc').focus();
}

/** Close the edit modal and clear its state. */
function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  document.getElementById('edit-modal-id').value = '';
  clearEditModalErrors();
}

/** Clear edit modal validation error messages. */
function clearEditModalErrors() {
  ['edit-desc-error', 'edit-amount-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const descEl   = document.getElementById('edit-desc');
  const amountEl = document.getElementById('edit-amount');
  if (descEl)   descEl.classList.remove('border-expense');
  if (amountEl) amountEl.classList.remove('border-expense');
}

/**
 * Handle the edit modal form submission.
 * Reuses loadTransactions / saveTransactions / renderTransactions
 * — no CRUD logic is duplicated here.
 * @param {Event} e
 */
function handleEditModalSubmit(e) {
  e.preventDefault();

  const idVal     = document.getElementById('edit-modal-id').value;
  const descVal   = document.getElementById('edit-desc').value.trim();
  const amountVal = parseFloat(document.getElementById('edit-amount').value);
  const typeVal   = document.getElementById('edit-type').value;
  const catVal    = document.getElementById('edit-category').value;
  const dateVal   = document.getElementById('edit-date').value;

  // Validate
  let valid = true;
  clearEditModalErrors();

  if (!descVal) {
    document.getElementById('edit-desc-error').classList.remove('hidden');
    document.getElementById('edit-desc').classList.add('border-expense');
    valid = false;
  }
  if (!document.getElementById('edit-amount').value || isNaN(amountVal) || amountVal <= 0) {
    document.getElementById('edit-amount-error').classList.remove('hidden');
    document.getElementById('edit-amount').classList.add('border-expense');
    valid = false;
  }
  if (!valid) return;

  // Update via existing storage functions
  const transactions = loadTransactions();
  const idx = transactions.findIndex(t => t.id === idVal);
  if (idx !== -1) {
    transactions[idx] = {
      ...transactions[idx],
      description: descVal,
      amount:      amountVal,
      type:        typeVal,
      category:    catVal,
      date:        dateVal || getTodayDate(),
    };
    saveTransactions(transactions);
  }

  closeEditModal();
  renderTransactions();
}

/**
 * Wire all event listeners for the edit modal:
 * form submit, close button, cancel button, backdrop click, Escape key.
 */
function initEditModal() {
  const modal      = document.getElementById('edit-modal');
  const form       = document.getElementById('edit-modal-form');
  const closeBtn   = document.getElementById('edit-modal-close');
  const cancelBtn  = document.getElementById('edit-modal-cancel');

  form.addEventListener('submit', handleEditModalSubmit);
  closeBtn.addEventListener('click', closeEditModal);
  cancelBtn.addEventListener('click', closeEditModal);

  // Backdrop click closes modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeEditModal();
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeEditModal();
    }
  });

  // Nabung type-lock in edit modal when category changes
  document.getElementById('edit-category').addEventListener('change', () => {
    applyNabungTypeLock(
      document.getElementById('edit-category').value,
      document.getElementById('edit-type'),
      'edit-type-lock-note'
    );
  });

  // Clear errors on input
  document.getElementById('edit-desc').addEventListener('input', () => {
    document.getElementById('edit-desc-error').classList.add('hidden');
    document.getElementById('edit-desc').classList.remove('border-expense');
  });
  document.getElementById('edit-amount').addEventListener('input', () => {
    document.getElementById('edit-amount-error').classList.add('hidden');
    document.getElementById('edit-amount').classList.remove('border-expense');
  });
}

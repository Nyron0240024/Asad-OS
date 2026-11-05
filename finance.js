/* =====================================
   ASAD OS FINANCE
===================================== */

(() => {
  "use strict";

  const DB = window.ASADDatabase;

  let records = [];
  let period = "all";
  let currencyFilter = "ALL";
  let search = "";
  let editingId = null;
  let formOpen = false;
  let selectedType = "income";

  const categories = {
    income: ["taxi", "salary", "business", "freelance", "other"],
    expense: [
      "fuel", "food", "home", "shopping",
      "transport", "debt", "car",
      "entertainment", "other"
    ]
  };

  const categoryLabels = {
    ru: {
      taxi: "Яндекс Такси",
      salary: "Зарплата",
      business: "Бизнес",
      freelance: "Фриланс",
      fuel: "Топливо",
      food: "Еда",
      home: "Дом",
      shopping: "Покупки",
      transport: "Транспорт",
      debt: "Долги",
      car: "Автомобиль",
      entertainment: "Развлечения",
      other: "Другое"
    },
    uz: {
      taxi: "Yandex Taksi",
      salary: "Maosh",
      business: "Biznes",
      freelance: "Frilans",
      fuel: "Yoqilg‘i",
      food: "Oziq-ovqat",
      home: "Uy",
      shopping: "Xaridlar",
      transport: "Transport",
      debt: "Qarzlar",
      car: "Avtomobil",
      entertainment: "Ko‘ngilochar",
      other: "Boshqa"
    }
  };

  const words = {
    ru: {
      title: "Мои финансы",
      subtitle: "Контролируй деньги и управляй расходами.",
      income: "Доход",
      expense: "Расход",
      totalIncome: "Общий доход",
      totalExpense: "Общие расходы",
      balance: "Баланс",
      add: "Добавить операцию",
      all: "Все операции",
      today: "Сегодня",
      week: "7 дней",
      month: "Этот месяц",
      year: "Этот год",
      allTime: "Всё время",
      amount: "Сумма",
      currency: "Валюта",
      category: "Категория",
      date: "Дата",
      description: "Описание",
      descriptionPlaceholder: "Например: утренняя смена",
      save: "Сохранить",
      cancel: "Отмена",
      search: "Поиск операций...",
      allCurrencies: "Все валюты",
      noRecords: "Операций пока нет",
      noRecordsHint: "Добавь первый доход или расход.",
      edit: "Редактировать",
      delete: "Удалить",
      confirmDelete: "Удалить эту операцию?",
      newTitle: "Новая операция",
      editTitle: "Редактирование операции",
      records: "операций",
      backup: "Резервная копия",
      backupHint: "Сохраняй и восстанавливай свои данные.",
      export: "Экспорт JSON",
      import: "Импорт JSON",
      saved: "Операция сохранена",
      deleted: "Операция удалена",
      error: "Ошибка",
      invalidAmount: "Введи корректную сумму.",
      currencyInfo: "Каждая валюта учитывается отдельно.",
      noResults: "Ничего не найдено",
      selectCategory: "Выбери категорию",
      incomeShort: "Доход",
      expenseShort: "Расход",
      close: "Закрыть",
      allMonth: "Месяц"
    },

    uz: {
      title: "Mening moliyam",
      subtitle: "Pul va xarajatlaringizni boshqaring.",
      income: "Daromad",
      expense: "Xarajat",
      totalIncome: "Jami daromad",
      totalExpense: "Jami xarajat",
      balance: "Balans",
      add: "Operatsiya qo‘shish",
      all: "Barcha operatsiyalar",
      today: "Bugun",
      week: "7 kun",
      month: "Shu oy",
      year: "Shu yil",
      allTime: "Barcha vaqt",
      amount: "Miqdor",
      currency: "Valyuta",
      category: "Kategoriya",
      date: "Sana",
      description: "Izoh",
      descriptionPlaceholder: "Masalan: ertalabki smena",
      save: "Saqlash",
      cancel: "Bekor qilish",
      search: "Operatsiyalarni qidirish...",
      allCurrencies: "Barcha valyutalar",
      noRecords: "Operatsiyalar yo‘q",
      noRecordsHint: "Birinchi daromad yoki xarajatingizni qo‘shing.",
      edit: "Tahrirlash",
      delete: "O‘chirish",
      confirmDelete: "Ushbu operatsiya o‘chirilsinmi?",
      newTitle: "Yangi operatsiya",
      editTitle: "Operatsiyani tahrirlash",
      records: "operatsiya",
      backup: "Zaxira nusxasi",
      backupHint: "Ma'lumotlaringizni saqlang va tiklang.",
      export: "JSON eksport",
      import: "JSON import",
      saved: "Operatsiya saqlandi",
      deleted: "Operatsiya o‘chirildi",
      error: "Xatolik",
      invalidAmount: "To‘g‘ri miqdor kiriting.",
      currencyInfo: "Har bir valyuta alohida hisoblanadi.",
      noResults: "Hech narsa topilmadi",
      selectCategory: "Kategoriyani tanlang",
      incomeShort: "Daromad",
      expenseShort: "Xarajat",
      close: "Yopish",
      allMonth: "Oy"
    }
  };

  function lang() {
    return localStorage.getItem("asad-os-language") === "uz"
      ? "uz" : "ru";
  }

  function t(key) {
    return words[lang()][key] || key;
  }

  function categoryName(key) {
    return categoryLabels[lang()][key] || key;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function today() {
    const d = new Date();

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatDate(value) {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }

  // =====================================
  // MONEY INPUT FORMATTING
  // =====================================

  function parseMoneyInput(value) {
    const normalized = String(value ?? "")
      .replace(/\s/g, "")
      .replace(/,/g, ".");

    return Number(normalized);
  }

  function formatMoneyInputValue(value, allowDecimal = false) {
    let raw = String(value ?? "")
      .replace(/\s/g, "")
      .replace(/[^\d.,]/g, "");

    const separatorIndex = raw.search(/[.,]/);

    let integerPart = separatorIndex >= 0
      ? raw.slice(0, separatorIndex)
      : raw;

    let decimalPart = separatorIndex >= 0
      ? raw.slice(separatorIndex + 1).replace(/\D/g, "").slice(0, 2)
      : null;

    integerPart = integerPart
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    if (allowDecimal && decimalPart !== null) {
      return integerPart + "." + decimalPart;
    }

    return integerPart;
  }

  function formatMoneyInput(input, allowDecimal = false) {
    if (!input) return;

    const oldValue = input.value;
    const cursor = input.selectionStart ?? oldValue.length;

    const digitsBeforeCursor = oldValue
      .slice(0, cursor)
      .replace(/\D/g, "").length;

    const formatted = formatMoneyInputValue(
      oldValue,
      allowDecimal
    );

    input.value = formatted;

    let position = 0;
    let digitCount = 0;

    while (
      position < formatted.length &&
      digitCount < digitsBeforeCursor
    ) {
      if (/\d/.test(formatted[position])) {
        digitCount++;
      }

      position++;
    }

    input.setSelectionRange(position, position);
  }

  function formatMoney(value, currency) {
    const amount = new Intl.NumberFormat(
      currency === "UZS" ? "ru-RU" : "en-US",
      {
        maximumFractionDigits: currency === "UZS" ? 0 : 2,
        minimumFractionDigits: currency === "UZS" ? 0 : 2
      }
    ).format(value);

    return currency === "UZS"
      ? amount + " UZS"
      : "$" + amount;
  }

  function displayAmount(uzs, usd) {
    const selected = localStorage.getItem("asad-os-currency") || "BOTH";

    if (selected === "UZS") return formatMoney(uzs, "UZS");
    if (selected === "USD") return formatMoney(usd, "USD");

    return `
      <span>${formatMoney(uzs, "UZS")}</span>
      <small>${formatMoney(usd, "USD")}</small>
    `;
  }

  function getPeriodRange() {
    const now = new Date();
    const current = today();

    if (period === "today") {
      return { from: current, to: current };
    }

    if (period === "week") {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);

      return {
        from: start.getFullYear() + "-" +
          String(start.getMonth() + 1).padStart(2, "0") + "-" +
          String(start.getDate()).padStart(2, "0"),
        to: current
      };
    }

    if (period === "month") {
      return {
        from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
        to: current
      };
    }

    if (period === "year") {
      return {
        from: `${now.getFullYear()}-01-01`,
        to: current
      };
    }

    return { from: null, to: null };
  }

  function getFiltered() {
    const range = getPeriodRange();

    return records.filter(item => {
      const matchesDate =
        (!range.from || item.date >= range.from) &&
        (!range.to || item.date <= range.to);

      const matchesCurrency =
        currencyFilter === "ALL" ||
        item.currency === currencyFilter;

      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        categoryName(item.category).toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query);

      return matchesDate && matchesCurrency && matchesSearch;
    });
  }

  function calculate(items) {
    const result = {
      UZS: { income: 0, expense: 0 },
      USD: { income: 0, expense: 0 }
    };

    items.forEach(item => {
      result[item.currency][item.type] += Number(item.amount);
    });

    result.UZS.balance =
      result.UZS.income - result.UZS.expense;

    result.USD.balance =
      result.USD.income - result.USD.expense;

    return result;
  }

  function renderSummary(items) {
    const totals = calculate(items);

    return `
      <div class="finance-summary">

        <div class="finance-stat-card income">
          <span>↗ ${t("totalIncome")}</span>
          <div class="finance-stat-value">
            ${displayAmount(totals.UZS.income, totals.USD.income)}
          </div>
        </div>

        <div class="finance-stat-card expense">
          <span>↘ ${t("totalExpense")}</span>
          <div class="finance-stat-value">
            ${displayAmount(totals.UZS.expense, totals.USD.expense)}
          </div>
        </div>

        <div class="finance-stat-card balance">
          <span>◈ ${t("balance")}</span>
          <div class="finance-stat-value">
            ${displayAmount(totals.UZS.balance, totals.USD.balance)}
          </div>
        </div>

      </div>
    `;
  }

  function renderCategories(type, selected) {
    return categories[type].map(key => `
      <option value="${key}" ${selected === key ? "selected" : ""}>
        ${categoryName(key)}
      </option>
    `).join("");
  }

  function renderForm() {
    if (!formOpen) return "";

    const existing = editingId
      ? records.find(item => item.id === editingId)
      : null;

    const type = existing?.type || selectedType;
    const currency = existing?.currency || "UZS";

    return `
      <div class="finance-form-overlay" data-action="overlay">

        <div class="finance-form-modal">

          <div class="finance-form-heading">
            <div>
              <h3>${existing ? t("editTitle") : t("newTitle")}</h3>
              <p>${t("currencyInfo")}</p>
            </div>

            <button class="finance-close" type="button" data-action="close">×</button>
          </div>

          <form id="transactionForm">

            <div class="finance-type-switch">

              <button type="button"
                class="finance-type-btn ${type === "income" ? "income-selected" : ""}"
                data-type="income">
                ↗ ${t("income")}
              </button>

              <button type="button"
                class="finance-type-btn ${type === "expense" ? "expense-selected" : ""}"
                data-type="expense">
                ↘ ${t("expense")}
              </button>

            </div>

            <input type="hidden" id="transactionType" value="${type}">

            <div class="finance-form-grid">

              <label class="finance-field full">
                <span>${t("amount")}</span>
                <input
                  type="text"
                  inputmode="decimal"
                  id="transactionAmount"
                  required
                  autocomplete="off"
                  placeholder="150 000"
                  value="${existing
                    ? formatMoneyInputValue(existing.amount, currency === "USD")
                    : ""}"
                >
              </label>

              <label class="finance-field">
                <span>${t("currency")}</span>
                <select id="transactionCurrency">
                  <option value="UZS" ${currency !== "USD" ? "selected" : ""}>UZS — So‘m</option>
                  <option value="USD" ${currency === "USD" ? "selected" : ""}>USD — Dollar</option>
                </select>
              </label>

              <label class="finance-field">
                <span>${t("category")}</span>
                <select id="transactionCategory" required>
                  ${renderCategories(type, existing?.category)}
                </select>
              </label>

              <label class="finance-field full">
                <span>${t("date")}</span>
                <input type="date" id="transactionDate" required
                  value="${existing?.date || today()}">
              </label>

              <label class="finance-field full">
                <span>${t("description")}</span>
                <input
                  type="text"
                  id="transactionDescription"
                  maxlength="150"
                  placeholder="${t("descriptionPlaceholder")}"
                  value="${escapeHTML(existing?.description || "")}"
                >
              </label>

            </div>

            <div class="finance-form-actions">
              <button type="button" class="finance-cancel" data-action="close">
                ${t("cancel")}
              </button>

              <button type="submit" class="finance-save">
                ${t("save")}
              </button>
            </div>

          </form>
        </div>
      </div>
    `;
  }

  function renderTable(items) {
    if (!items.length) {
      return `
        <div class="finance-empty">
          <div class="empty-icon large">◈</div>
          <h3>${search || period !== "all" || currencyFilter !== "ALL"
            ? t("noResults") : t("noRecords")}</h3>
          <p>${t("noRecordsHint")}</p>
        </div>
      `;
    }

    return `
      <div class="finance-table-wrap">
        <table class="finance-table">
          <thead>
            <tr>
              <th>${t("category")}</th>
              <th>${t("date")}</th>
              <th>${t("description")}</th>
              <th>${t("amount")}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${items.map(item => `
              <tr>
                <td>
                  <div class="finance-category-cell">
                    <span class="transaction-icon ${item.type}">
                      ${item.type === "income" ? "↗" : "↘"}
                    </span>
                    <strong>${escapeHTML(categoryName(item.category))}</strong>
                  </div>
                </td>

                <td class="finance-date">${formatDate(item.date)}</td>

                <td class="finance-description">
                  ${escapeHTML(item.description || "—")}
                </td>

                <td class="finance-amount ${item.type}">
                  ${item.type === "income" ? "+" : "−"}
                  ${formatMoney(item.amount, item.currency)}
                </td>

                <td>
                  <div class="finance-row-actions">
                    <button data-action="edit" data-id="${item.id}" title="${t("edit")}">✎</button>
                    <button data-action="delete" data-id="${item.id}" title="${t("delete")}">×</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function render() {
    const panel = document.getElementById("modulePanel");
    if (!panel) return;

    const items = getFiltered();

    panel.className = "panel finance-workspace";

    panel.innerHTML = `
      <div class="finance-toolbar">
        <div>
          <h3>${t("all")}</h3>
          <p>${items.length} ${t("records")}</p>
        </div>

        <button class="finance-add-button" data-action="add">
          + ${t("add")}
        </button>
      </div>

      ${renderSummary(items)}

      <div class="finance-filters">

        <div class="finance-periods">
          ${["all", "today", "week", "month", "year"].map(key => `
            <button class="finance-filter ${period === key ? "active" : ""}"
              data-period="${key}">
              ${t(key === "all" ? "allTime" : key)}
            </button>
          `).join("")}
        </div>

        <div class="finance-filter-bottom">
          <input type="search" id="financeSearch"
            placeholder="${t("search")}"
            value="${escapeHTML(search)}">

          <select id="financeCurrencyFilter">
            <option value="ALL">${t("allCurrencies")}</option>
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
          </select>
        </div>

      </div>

      ${renderTable(items)}

      <div class="finance-backup">
        <div>
          <strong>${t("backup")}</strong>
          <p>${t("backupHint")}</p>
        </div>

        <div class="finance-backup-actions">
          <button data-action="export">↓ ${t("export")}</button>

          <label class="finance-import-button">
            ↑ ${t("import")}
            <input type="file" id="financeImport"
              accept=".json,application/json" hidden>
          </label>
        </div>
      </div>

      ${renderForm()}
    `;

    document.getElementById("financeCurrencyFilter").value =
      currencyFilter;
  }

  async function refresh() {
    records = await DB.getTransactions();
    render();
  }

  function openForm(id = null) {
    editingId = id === null ? null : Number(id);

    selectedType = editingId
      ? records.find(item => item.id === editingId)?.type || "income"
      : "income";

    formOpen = true;
    render();
  }

  function closeForm() {
    formOpen = false;
    editingId = null;
    render();
  }

  async function saveForm(form) {
    const id = Number(
      form.querySelector("#transactionId")?.value ||
      editingId ||
      0
    );

    const currency =
      form.querySelector("#transactionCurrency").value;

    const data = {
      type: form.querySelector("#transactionType").value,
      amount: parseMoneyInput(
        form.querySelector("#transactionAmount").value
      ),
      currency,
      category: form.querySelector("#transactionCategory").value,
      date: form.querySelector("#transactionDate").value,
      description: form.querySelector("#transactionDescription").value.trim()
    };

    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      window.showToast(t("invalidAmount"), "error");
      return;
    }

    try {
      if (id) {
        await DB.updateTransaction(id, data);
      } else {
        await DB.addTransaction(data);
      }

      formOpen = false;
      editingId = null;

      await refresh();
      window.updateDashboard();

      window.showToast(t("saved"), "success");

    } catch (error) {
      console.error(error);
      window.showToast(t("error") + ": " + error.message, "error");
    }
  }

  async function exportBackup() {
    try {
      const backup = await DB.exportData();

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `asad-os-backup-${today()}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      window.showToast("Backup exported", "success");

    } catch (error) {
      console.error(error);
      window.showToast(t("error"), "error");
    }
  }

  async function importBackup(file) {
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Backup file is too large.");
      }

      const content = await file.text();
      const backup = JSON.parse(content);

      const replace = confirm(
        "OK — заменить все текущие данные.\n" +
        "Отмена — объединить данные без замены."
      );

      if (!confirm(
        "Восстановить резервную копию? Перед заменой рекомендуется экспортировать текущие данные."
      )) return;

      await DB.importData(
        backup,
        replace ? "replace" : "merge"
      );

      await refresh();
      window.updateDashboard();

      window.showToast("Backup restored", "success");

    } catch (error) {
      console.error(error);
      window.showToast(t("error") + ": " + error.message, "error");
    }
  }

  document.addEventListener("click", async event => {
    const page = document.getElementById("otherPage");

    if (!page || !page.contains(event.target)) return;

    const typeButton = event.target.closest("[data-type]");

    if (typeButton) {
      selectedType = typeButton.dataset.type;

      const form = document.getElementById("transactionForm");
      const category = document.getElementById("transactionCategory");

      if (form && category) {
        form.querySelector("#transactionType").value = selectedType;

        form.querySelectorAll("[data-type]").forEach(button => {
          button.classList.remove(
            "income-selected",
            "expense-selected"
          );
        });

        typeButton.classList.add(
          selectedType === "income"
            ? "income-selected"
            : "expense-selected"
        );

        category.innerHTML = renderCategories(selectedType, "");
      }

      return;
    }

    const periodButton = event.target.closest("[data-period]");

    if (periodButton) {
      period = periodButton.dataset.period;
      render();
      return;
    }

    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) return;

    const action = actionButton.dataset.action;

    if (action === "add") {
      openForm();
    }

    if (action === "close") {
      closeForm();
    }

    if (action === "overlay" && event.target === actionButton) {
      closeForm();
    }

    if (action === "edit") {
      openForm(actionButton.dataset.id);
    }

    if (action === "delete") {
      const id = Number(actionButton.dataset.id);

      if (!confirm(t("confirmDelete"))) return;

      try {
        await DB.deleteTransaction(id);
        await refresh();
        window.updateDashboard();

        window.showToast(t("deleted"), "success");

      } catch (error) {
        window.showToast(t("error"), "error");
      }
    }

    if (action === "export") {
      await exportBackup();
    }
  });

  document.addEventListener("submit", event => {
    if (event.target.id !== "transactionForm") return;

    event.preventDefault();
    saveForm(event.target);
  });

  document.addEventListener("input", event => {
    const input = event.target;

    if (input.id === "transactionAmount") {
      const currency =
        document.getElementById("transactionCurrency")?.value || "UZS";

      formatMoneyInput(input, currency === "USD");
      return;
    }

    if (input.id !== "financeSearch") return;

    search = input.value.trim();

    const position = input.selectionStart;

    render();

    const searchInput = document.getElementById("financeSearch");

    searchInput.focus();
    searchInput.setSelectionRange(position, position);
  });

  document.addEventListener("change", async event => {
    if (event.target.id === "transactionCurrency") {
      const amountInput =
        document.getElementById("transactionAmount");

      if (amountInput) {
        formatMoneyInput(
          amountInput,
          event.target.value === "USD"
        );
      }
    }

    if (event.target.id === "financeCurrencyFilter") {
      currencyFilter = event.target.value;
      render();
    }

    if (event.target.id === "financeImport") {
      await importBackup(event.target.files[0]);
      event.target.value = "";
    }
  });

  window.ASADFinance = {
    render,
    refresh,
    openForm
  };

})();
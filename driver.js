/* =========================================
   ASAD OS — DRIVER MANAGER V2
========================================= */

(() => {
  "use strict";

  const DB = window.ASADDatabase;

  let shifts = [];
  let period = "month";
  let currencyFilter = "ALL";
  let search = "";
  let editingId = null;
  let formOpen = false;

  const translations = {
    ru: {
      title: "Мои рабочие смены",
      subtitle: "Контроль доходов, пробега и расходов.",
      add: "Добавить смену",
      income: "Выручка",
      fuel: "Пропан",
      other: "Другие расходы",
      net: "Чистая прибыль",
      distance: "Пробег",
      orders: "Заказы",
      average: "Доход на 1 км",
      all: "Все смены",
      today: "Сегодня",
      week: "7 дней",
      month: "Этот месяц",
      allTime: "Всё время",
      date: "Дата смены",
      amount: "Выручка за смену",
      currency: "Валюта",
      km: "Пройдено километров",
      orderCount: "Количество заказов",
      fuelCost: "Расходы на пропан",
      otherCost: "Дополнительные расходы",
      start: "Начало работы",
      end: "Конец работы",
      notes: "Заметка",
      notePlaceholder: "Например: утренняя смена",
      save: "Сохранить смену",
      cancel: "Отмена",
      edit: "Изменить",
      delete: "Удалить",
      confirmDelete: "Удалить смену вместе со связанными финансовыми операциями?",
      newTitle: "Новая рабочая смена",
      editTitle: "Редактирование смены",
      noRecords: "Пока нет рабочих смен",
      noRecordsHint: "Добавь свою первую смену в Яндекс Такси.",
      search: "Поиск по заметкам...",
      allCurrencies: "Все валюты",
      records: "смен",
      error: "Ошибка",
      saved: "Смена сохранена",
      deleted: "Смена удалена",
      invalid: "Проверь введённые данные.",
      currencyInfo: "Операции автоматически попадут в Finance.",
      incomePerOrder: "Доход / заказ",
      noValue: "—",
      netHint: "После вычета всех расходов",
      startEnd: "Время работы",
      total: "Итого за период"
    },

    uz: {
      title: "Ish smenalarim",
      subtitle: "Daromad, masofa va xarajatlarni nazorat qiling.",
      add: "Smena qo‘shish",
      income: "Tushum",
      fuel: "Propan",
      other: "Boshqa xarajatlar",
      net: "Sof foyda",
      distance: "Masofa",
      orders: "Buyurtmalar",
      average: "1 km uchun daromad",
      all: "Barcha smenalar",
      today: "Bugun",
      week: "7 kun",
      month: "Shu oy",
      allTime: "Barcha vaqt",
      date: "Smena sanasi",
      amount: "Smena tushumi",
      currency: "Valyuta",
      km: "Bosib o‘tilgan km",
      orderCount: "Buyurtmalar soni",
      fuelCost: "Propan xarajati",
      otherCost: "Qo‘shimcha xarajatlar",
      start: "Ish boshlanishi",
      end: "Ish tugashi",
      notes: "Izoh",
      notePlaceholder: "Masalan: ertalabki smena",
      save: "Smenani saqlash",
      cancel: "Bekor qilish",
      edit: "Tahrirlash",
      delete: "O‘chirish",
      confirmDelete: "Smena va unga bog‘langan moliyaviy operatsiyalar o‘chirilsinmi?",
      newTitle: "Yangi ish smenasi",
      editTitle: "Smenani tahrirlash",
      noRecords: "Hozircha smenalar yo‘q",
      noRecordsHint: "Birinchi Yandex Taksi smenangizni qo‘shing.",
      search: "Izoh bo‘yicha qidirish...",
      allCurrencies: "Barcha valyutalar",
      records: "smena",
      error: "Xatolik",
      saved: "Smena saqlandi",
      deleted: "Smena o‘chirildi",
      invalid: "Ma'lumotlarni tekshiring.",
      currencyInfo: "Operatsiyalar avtomatik ravishda Finance bo‘limiga tushadi.",
      incomePerOrder: "Daromad / buyurtma",
      noValue: "—",
      netHint: "Barcha xarajatlardan keyin",
      startEnd: "Ish vaqti",
      total: "Davr bo‘yicha jami"
    }
  };

  const categories = {
    ru: {
      taxi: "Яндекс Такси",
      fuel: "Пропан",
      car: "Автомобиль"
    },
    uz: {
      taxi: "Yandex Taksi",
      fuel: "Propan",
      car: "Avtomobil"
    }
  };

  const $ = id => document.getElementById(id);

  function t(key) {
    const language = localStorage.getItem("asad-os-language") === "uz"
      ? "uz"
      : "ru";

    return translations[language][key] || key;
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

  // =========================================
  // MONEY INPUT FORMATTING
  // =========================================

  function parseMoneyInput(value) {
    const normalized = String(value ?? "")
      .replace(/\s/g, "")
      .replace(/,/g, ".");

    if (!normalized || normalized === ".") {
      return 0;
    }

    return Number(normalized);
  }

  function formatMoneyInputValue(value, allowDecimal = false) {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    let number = String(value)
      .replace(/\s/g, "")
      .replace(/,/g, ".");

    const parts = number.split(".");
    let integerPart = parts[0].replace(/\D/g, "");
    let decimalPart = (parts[1] || "").replace(/\D/g, "");

    if (!integerPart) {
      integerPart = "0";
    }

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    if (!allowDecimal) {
      return integerPart;
    }

    decimalPart = decimalPart.slice(0, 2);

    if (number.includes(".")) {
      return integerPart + "." + decimalPart;
    }

    return integerPart;
  }

  function formatMoneyInput(input, allowDecimal = false) {
    if (!input) return;

    const oldValue = input.value;
    const oldPosition = input.selectionStart ?? oldValue.length;

    const beforeCursor = oldValue.slice(0, oldPosition);
    const digitsBeforeCursor = beforeCursor.replace(/[^\d]/g, "").length;

    const formatted = formatMoneyInputValue(oldValue, allowDecimal);

    input.value = formatted;

    let newPosition = 0;
    let digitsCount = 0;

    while (
      newPosition < formatted.length &&
      digitsCount < digitsBeforeCursor
    ) {
      if (/\d/.test(formatted[newPosition])) {
        digitsCount++;
      }

      newPosition++;
    }

    if (oldValue.includes(".") && allowDecimal) {
      const decimalPosition = formatted.indexOf(".");

      if (
        decimalPosition !== -1 &&
        oldPosition > oldValue.indexOf(".")
      ) {
        newPosition = Math.max(newPosition, decimalPosition + 1);
      }
    }

    try {
      input.setSelectionRange(newPosition, newPosition);
    } catch (error) {
      // Некоторые браузеры могут не поддерживать установку курсора.
    }
  }

  function prepareMoneyInput(input) {
    if (!input) return;

    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.spellcheck = false;
  }

  function today() {
    const d = new Date();

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function money(value, currency) {
    const number = new Intl.NumberFormat(
      currency === "UZS" ? "ru-RU" : "en-US",
      {
        maximumFractionDigits: currency === "UZS" ? 0 : 2,
        minimumFractionDigits: currency === "UZS" ? 0 : 2
      }
    ).format(value);

    return currency === "UZS"
      ? number + " UZS"
      : "$" + number;
  }

  function showMoney(uzs, usd) {
    const currency = localStorage.getItem("asad-os-currency") || "BOTH";

    if (currency === "UZS") {
      return money(uzs, "UZS");
    }

    if (currency === "USD") {
      return money(usd, "USD");
    }

    return `
      <span>${money(uzs, "UZS")}</span>
      <small>${money(usd, "USD")}</small>
    `;
  }

  function formatDate(value) {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }

  function getRange() {
    const now = new Date();

    if (period === "today") {
      return {
        from: today(),
        to: today()
      };
    }

    if (period === "week") {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);

      return {
        from: [
          start.getFullYear(),
          String(start.getMonth() + 1).padStart(2, "0"),
          String(start.getDate()).padStart(2, "0")
        ].join("-"),
        to: today()
      };
    }

    if (period === "month") {
      return {
        from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
        to: today()
      };
    }

    return {
      from: null,
      to: null
    };
  }

  function filtered() {
    const range = getRange();

    return shifts.filter(shift => {
      const dateMatch =
        (!range.from || shift.date >= range.from) &&
        (!range.to || shift.date <= range.to);

      const currencyMatch =
        currencyFilter === "ALL" ||
        shift.currency === currencyFilter;

      const searchMatch =
        !search ||
        (shift.notes || "").toLowerCase().includes(search);

      return dateMatch && currencyMatch && searchMatch;
    });
  }

  function calculate(items) {
    const result = {
      UZS: {
        income: 0,
        fuel: 0,
        other: 0,
        net: 0
      },
      USD: {
        income: 0,
        fuel: 0,
        other: 0,
        net: 0
      },
      km: 0,
      orders: 0
    };

    items.forEach(shift => {
      const c = shift.currency;

      result[c].income += Number(shift.income);
      result[c].fuel += Number(shift.fuelCost || 0);
      result[c].other += Number(shift.otherCost || 0);

      result.km += Number(shift.km || 0);
      result.orders += Number(shift.orders || 0);
    });

    ["UZS", "USD"].forEach(c => {
      result[c].net =
        result[c].income -
        result[c].fuel -
        result[c].other;
    });

    return result;
  }

  function renderSummary(items) {
    const sum = calculate(items);

    return `
      <div class="driver-summary-grid">

        <div class="driver-stat-card">
          <span>↗ ${t("income")}</span>
          <strong>${showMoney(sum.UZS.income, sum.USD.income)}</strong>
        </div>

        <div class="driver-stat-card">
          <span>⛽ ${t("fuel")}</span>
          <strong>${showMoney(sum.UZS.fuel, sum.USD.fuel)}</strong>
        </div>

        <div class="driver-stat-card">
          <span>⚙ ${t("other")}</span>
          <strong>${showMoney(sum.UZS.other, sum.USD.other)}</strong>
        </div>

        <div class="driver-stat-card highlight">
          <span>◈ ${t("net")}</span>
          <strong>${showMoney(sum.UZS.net, sum.USD.net)}</strong>
        </div>

      </div>

      <div class="driver-metrics">

        <div>
          <span>${t("distance")}</span>
          <strong>${sum.km.toLocaleString("ru-RU")} km</strong>
        </div>

        <div>
          <span>${t("orders")}</span>
          <strong>${sum.orders}</strong>
        </div>

        <div>
          <span>${t("records")}</span>
          <strong>${items.length}</strong>
        </div>

      </div>

      <div class="driver-insight">
        <span>${t("total")}</span>

        <div>
          <strong>${t("average")}: ${
            sum.km
              ? showMoney(
                  sum.UZS.income / sum.km,
                  sum.USD.income / sum.km
                )
              : t("noValue")
          }</strong>

          <strong>${t("incomePerOrder")}: ${
            sum.orders
              ? showMoney(
                  sum.UZS.income / sum.orders,
                  sum.USD.income / sum.orders
                )
              : t("noValue")
          }</strong>
        </div>
      </div>
    `;
  }

  function renderForm() {
    if (!formOpen) return "";

    const old = editingId === null
      ? null
      : shifts.find(item => item.id === editingId);

    const isUSD = old?.currency === "USD";

    return `
      <div class="finance-form-overlay" data-driver-action="overlay">

        <div class="finance-form-modal driver-form">

          <div class="finance-form-heading">
            <div>
              <h3>${old ? t("editTitle") : t("newTitle")}</h3>
              <p>${t("currencyInfo")}</p>
            </div>

            <button type="button" class="finance-close"
              data-driver-action="close">×</button>
          </div>

          <form id="driverForm">

            <div class="finance-form-grid">

              <label class="finance-field full">
                <span>${t("date")}</span>
                <input type="date" id="driverDate" required
                  value="${old?.date || today()}">
              </label>

              <label class="finance-field full">
                <span>${t("amount")}</span>
                <input type="text" inputmode="decimal"
                  id="driverIncome" required
                  autocomplete="off"
                  placeholder="250 000"
                  value="${old ? formatMoneyInputValue(old.income, isUSD) : ""}">
              </label>

              <label class="finance-field">
                <span>${t("currency")}</span>
                <select id="driverCurrency">
                  <option value="UZS" ${!isUSD ? "selected" : ""}>UZS — So‘m</option>
                  <option value="USD" ${isUSD ? "selected" : ""}>USD — Dollar</option>
                </select>
              </label>

              <label class="finance-field">
                <span>${t("km")}</span>
                <input type="number" id="driverKm"
                  min="0" step="0.1"
                  value="${old?.km ?? 0}">
              </label>

              <label class="finance-field">
                <span>${t("orderCount")}</span>
                <input type="number" id="driverOrders"
                  min="0" step="1"
                  value="${old?.orders ?? 0}">
              </label>

              <label class="finance-field">
                <span>${t("fuelCost")}</span>
                <input type="text" inputmode="decimal"
                  id="driverFuel"
                  autocomplete="off"
                  value="${formatMoneyInputValue(old?.fuelCost ?? 0, isUSD)}">
              </label>

              <label class="finance-field full">
                <span>${t("otherCost")}</span>
                <input type="text" inputmode="decimal"
                  id="driverOther"
                  autocomplete="off"
                  value="${formatMoneyInputValue(old?.otherCost ?? 0, isUSD)}">
              </label>

              <label class="finance-field">
                <span>${t("start")}</span>
                <input type="time" id="driverStart"
                  value="${old?.startTime || ""}">
              </label>

              <label class="finance-field">
                <span>${t("end")}</span>
                <input type="time" id="driverEnd"
                  value="${old?.endTime || ""}">
              </label>

              <label class="finance-field full">
                <span>${t("notes")}</span>
                <input type="text" id="driverNotes"
                  maxlength="150"
                  placeholder="${t("notePlaceholder")}"
                  value="${escapeHTML(old?.notes || "")}">
              </label>

            </div>

            <div class="driver-live-profit">
              <span>${t("net")}</span>
              <strong id="driverLiveProfit">0</strong>
              <small>${t("netHint")}</small>
            </div>

            <div class="finance-form-actions">
              <button type="button" class="finance-cancel"
                data-driver-action="close">${t("cancel")}</button>

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
          <div class="empty-icon large">▣</div>
          <h3>${t("noRecords")}</h3>
          <p>${t("noRecordsHint")}</p>
        </div>
      `;
    }

    return `
      <div class="finance-table-wrap">
        <table class="finance-table driver-table">
          <thead>
            <tr>
              <th>${t("date")}</th>
              <th>${t("income")}</th>
              <th>${t("fuel")}</th>
              <th>${t("distance")}</th>
              <th>${t("orders")}</th>
              <th>${t("net")}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${items.map(item => {
              const net =
                Number(item.income) -
                Number(item.fuelCost || 0) -
                Number(item.otherCost || 0);

              return `
                <tr>
                  <td>
                    <strong>${formatDate(item.date)}</strong>
                    <small class="driver-row-note">
                      ${escapeHTML(item.notes || "")}
                    </small>
                  </td>

                  <td class="finance-amount income">
                    ${money(item.income, item.currency)}
                  </td>

                  <td class="finance-amount expense">
                    ${money(item.fuelCost || 0, item.currency)}
                  </td>

                  <td>${Number(item.km || 0)} km</td>
                  <td>${Number(item.orders || 0)}</td>

                  <td class="finance-amount ${net >= 0 ? "income" : "expense"}">
                    ${money(net, item.currency)}
                  </td>

                  <td>
                    <div class="finance-row-actions">
                      <button type="button"
                        data-driver-action="edit"
                        data-id="${item.id}">✎</button>

                      <button type="button"
                        data-driver-action="delete"
                        data-id="${item.id}">×</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function updateLiveProfit() {
    const income = parseMoneyInput($("driverIncome")?.value || 0);
    const fuel = parseMoneyInput($("driverFuel")?.value || 0);
    const other = parseMoneyInput($("driverOther")?.value || 0);
    const currency = $("driverCurrency")?.value || "UZS";

    const element = $("driverLiveProfit");

    if (!element) return;

    const net = income - fuel - other;

    element.textContent = money(net, currency);
    element.className = net >= 0 ? "positive" : "negative";
  }

  function render() {
    const panel = $("modulePanel");

    if (!panel) return;

    const items = filtered();

    panel.className = "panel driver-workspace";

    panel.innerHTML = `
      <div class="driver-toolbar">
        <div>
          <h3>${t("title")}</h3>
          <p>${t("subtitle")}</p>
        </div>

        <button class="finance-add-button"
          data-driver-action="add">
          + ${t("add")}
        </button>
      </div>

      ${renderSummary(items)}

      <div class="finance-filters">
        <div class="finance-periods">
          ${["all", "today", "week", "month"].map(key => `
            <button class="finance-filter ${period === key ? "active" : ""}"
              data-driver-period="${key}">
              ${t(key === "all" ? "allTime" : key)}
            </button>
          `).join("")}
        </div>

        <div class="finance-filter-bottom">
          <input id="driverSearch" type="search"
            placeholder="${t("search")}"
            value="${escapeHTML(search)}">

          <select id="driverCurrencyFilter">
            <option value="ALL">${t("allCurrencies")}</option>
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      ${renderTable(items)}
      ${renderForm()}
    `;

    $("driverCurrencyFilter").value = currencyFilter;

    // Настраиваем денежные поля после отображения формы.
    prepareMoneyInput($("driverIncome"));
    prepareMoneyInput($("driverFuel"));
    prepareMoneyInput($("driverOther"));

    updateLiveProfit();
  }

  async function refresh() {
    shifts = await DB.getTrips();
    render();
  }

  function openForm(id = null) {
    editingId = id === null ? null : Number(id);
    formOpen = true;
    render();
  }

  function closeForm() {
    formOpen = false;
    editingId = null;
    render();
  }

  async function saveShift(form) {
    const data = {
      date: $("driverDate").value,
      income: parseMoneyInput($("driverIncome").value),
      currency: $("driverCurrency").value,
      km: Number($("driverKm").value || 0),
      orders: Number($("driverOrders").value || 0),
      fuelCost: parseMoneyInput($("driverFuel").value || 0),
      otherCost: parseMoneyInput($("driverOther").value || 0),
      startTime: $("driverStart").value,
      endTime: $("driverEnd").value,
      notes: $("driverNotes").value.trim()
    };

    try {
      if (
        !data.date ||
        !Number.isFinite(data.income) ||
        data.income <= 0 ||
        !Number.isFinite(data.km) ||
        data.km < 0 ||
        !Number.isInteger(data.orders) ||
        data.orders < 0 ||
        !Number.isFinite(data.fuelCost) ||
        data.fuelCost < 0 ||
        !Number.isFinite(data.otherCost) ||
        data.otherCost < 0
      ) {
        throw new Error(t("invalid"));
      }

      if (editingId !== null) {
        await DB.updateDriverShift(editingId, data);
      } else {
        await DB.addDriverShift(data);
      }

      formOpen = false;
      editingId = null;

      await refresh();
      await window.updateDashboard();

      window.showToast(t("saved"), "success");

    } catch (error) {
      console.error(error);
      window.showToast(t("error") + ": " + error.message, "error");
    }
  }

  document.addEventListener("click", async event => {
    const panel = $("otherPage");

    if (!panel || !panel.contains(event.target)) return;

    const periodButton = event.target.closest("[data-driver-period]");

    if (periodButton) {
      period = periodButton.dataset.driverPeriod;
      render();
      return;
    }

    const button = event.target.closest("[data-driver-action]");

    if (!button) return;

    const action = button.dataset.driverAction;

    if (action === "add") {
      openForm();
    }

    if (action === "close") {
      closeForm();
    }

    if (action === "overlay" && event.target === button) {
      closeForm();
    }

    if (action === "edit") {
      openForm(button.dataset.id);
    }

    if (action === "delete") {
      if (!confirm(t("confirmDelete"))) return;

      try {
        await DB.deleteDriverShift(button.dataset.id);

        await refresh();
        await window.updateDashboard();

        window.showToast(t("deleted"), "success");

      } catch (error) {
        console.error(error);
        window.showToast(t("error") + ": " + error.message, "error");
      }
    }
  });

  document.addEventListener("submit", event => {
    if (event.target.id !== "driverForm") return;

    event.preventDefault();
    saveShift(event.target);
  });

  document.addEventListener("input", event => {
    if (event.target.id === "driverSearch") {
      search = event.target.value.trim().toLowerCase();

      const position = event.target.selectionStart;

      render();

      $("driverSearch").focus();
      $("driverSearch").setSelectionRange(position, position);
    }

    if ([
      "driverIncome",
      "driverFuel",
      "driverOther"
    ].includes(event.target.id)) {
      const currency = $("driverCurrency")?.value || "UZS";

      formatMoneyInput(
        event.target,
        currency === "USD"
      );

      updateLiveProfit();
    }
  });

  document.addEventListener("change", event => {
    if (event.target.id === "driverCurrencyFilter") {
      currencyFilter = event.target.value;
      render();
    }

    if (event.target.id === "driverCurrency") {
      const isUSD = event.target.value === "USD";

      formatMoneyInput($("driverIncome"), isUSD);
      formatMoneyInput($("driverFuel"), isUSD);
      formatMoneyInput($("driverOther"), isUSD);

      updateLiveProfit();
    }
  });

  window.ASADDriver = {
    render,
    refresh,
    openForm
  };

})();
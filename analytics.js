(() => {
  "use strict";

  const DB = window.ASADDatabase;

  const state = {
    transactions: [],
    garage: [],
    period: "30",
    currency: "BOTH"
  };

  const language = () =>
    localStorage.getItem("asad-os-language") || "ru";

  const ru = {
    title: "Аналитика",
    subtitle: "Полная картина твоих финансов и результатов",
    income: "Доходы",
    expenses: "Расходы",
    balance: "Чистый результат",
    operations: "Операции",
    chart: "Динамика доходов и расходов",
    categories: "Структура расходов",
    recent: "Последние операции",
    taxi: "Доход от такси",
    fuel: "Расходы на топливо",
    car: "Автомобиль",
    services: "Обслуживание автомобиля",
    serviceCount: "Записей обслуживания",
    serviceAmount: "Сумма обслуживания",
    noData: "Нет данных за этот период",
    noOperations: "Операций пока нет",
    today: "Сегодня",
    days7: "7 дней",
    days30: "30 дней",
    days90: "90 дней",
    year: "12 месяцев",
    all: "Всё время",
    total: "Итого",
    date: "Дата",
    category: "Категория",
    type: "Тип",
    amount: "Сумма",
    description: "Описание",
    incomeType: "Доход",
    expenseType: "Расход",
    other: "Другое",
    work: "Работа",
    food: "Еда",
    home: "Дом",
    shopping: "Покупки",
    debt: "Долги",
    transport: "Транспорт",
    personal: "Личное",
    study: "Учёба",
    health: "Здоровье",
    finance: "Финансы",
    savings: "Накопления",
    taxiLabel: "Яндекс Такси",
    fuelLabel: "Топливо",
    carLabel: "Автомобиль",
    emptyChart: "Недостаточно данных для графика",
    bestDay: "Лучший день по доходу",
    average: "Средний доход за день",
    transactionCount: "Количество операций",
    loadingError: "Не удалось загрузить аналитику"
  };

  const uz = {
    title: "Tahlil",
    subtitle: "Moliyaviy holating va natijalaring",
    income: "Daromad",
    expenses: "Xarajatlar",
    balance: "Sof natija",
    operations: "Operatsiyalar",
    chart: "Daromad va xarajatlar dinamikasi",
    categories: "Xarajatlar tarkibi",
    recent: "Oxirgi operatsiyalar",
    taxi: "Taksidan daromad",
    fuel: "Yoqilg‘i xarajatlari",
    car: "Avtomobil",
    services: "Avtomobil xizmati",
    serviceCount: "Xizmat yozuvlari",
    serviceAmount: "Xizmat summasi",
    noData: "Bu davr uchun ma'lumot yo‘q",
    noOperations: "Hozircha operatsiyalar yo‘q",
    today: "Bugun",
    days7: "7 kun",
    days30: "30 kun",
    days90: "90 kun",
    year: "12 oy",
    all: "Barcha vaqt",
    total: "Jami",
    date: "Sana",
    category: "Kategoriya",
    type: "Turi",
    amount: "Summa",
    description: "Tavsif",
    incomeType: "Daromad",
    expenseType: "Xarajat",
    other: "Boshqa",
    work: "Ish",
    food: "Oziq-ovqat",
    home: "Uy",
    shopping: "Xaridlar",
    debt: "Qarzlar",
    transport: "Transport",
    personal: "Shaxsiy",
    study: "O‘qish",
    health: "Salomatlik",
    finance: "Moliya",
    savings: "Jamg‘arma",
    taxiLabel: "Yandex Taksi",
    fuelLabel: "Yoqilg‘i",
    carLabel: "Avtomobil",
    emptyChart: "Grafik uchun ma'lumot yetarli emas",
    bestDay: "Eng yaxshi daromad kuni",
    average: "Kunlik o‘rtacha daromad",
    transactionCount: "Operatsiyalar soni",
    loadingError: "Tahlilni yuklab bo‘lmadi"
  };

  const t = key => (language() === "uz" ? uz : ru)[key] || key;

  const categoryNames = {
    taxi: "taxiLabel",
    fuel: "fuelLabel",
    car: "carLabel",
    food: "food",
    home: "home",
    shopping: "shopping",
    debt: "debt",
    transport: "transport",
    work: "work",
    personal: "personal",
    study: "study",
    health: "health",
    finance: "finance",
    savings: "savings",
    other: "other"
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function localDate(date = new Date()) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function parseDate(value) {
    if (!value) return null;

    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addDays(date, count) {
    const result = new Date(date);
    result.setDate(result.getDate() + count);
    return result;
  }

  function formatDate(value) {
    const date = parseDate(value);
    if (!date) return "—";

    return date.toLocaleDateString(
      language() === "uz" ? "uz-UZ" : "ru-RU",
      { day: "2-digit", month: "short" }
    );
  }

  function money(value, currency) {
    const number = Number(value) || 0;

    if (currency === "UZS") {
      return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 0
      }).format(number) + " UZS";
    }

    return "$" + new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2
    }).format(number);
  }

  function moneyPair(uzs, usd) {
    if (state.currency === "UZS") return money(uzs, "UZS");
    if (state.currency === "USD") return money(usd, "USD");

    return `
      <span>${money(uzs, "UZS")}</span>
      <small>${money(usd, "USD")}</small>
    `;
  }

  function currencyValues(items, type = null) {
    const result = { UZS: 0, USD: 0 };

    items.forEach(item => {
      if (type && item.type !== type) return;

      const currency = item.currency;
      if (!result.hasOwnProperty(currency)) return;

      result[currency] += Number(item.amount) || 0;
    });

    return result;
  }

  function getPeriodStart() {
    const today = new Date();

    if (state.period === "all") return null;

    if (state.period === "year") {
      return new Date(today.getFullYear(), today.getMonth() - 11, 1);
    }

    const days = Number(state.period);
    return addDays(today, -(days - 1));
  }

  function getFilteredTransactions() {
    const start = getPeriodStart();
    const end = localDate();

    return state.transactions.filter(item => {
      if (!item.date || item.date > end) return false;

      if (start && item.date < localDate(start)) return false;

      return (
        item.type === "income" ||
        item.type === "expense"
      );
    });
  }

  function getChartData(items) {
    const monthly = state.period === "year" ||
      state.period === "all" ||
      state.period === "90";

    const groups = {};

    items.forEach(item => {
      const date = parseDate(item.date);
      if (!date) return;

      const key = monthly
        ? item.date.slice(0, 7)
        : item.date;

      if (!groups[key]) {
        groups[key] = {
          key,
          incomeUZS: 0,
          expenseUZS: 0,
          incomeUSD: 0,
          expenseUSD: 0
        };
      }

      const suffix = item.currency === "USD" ? "USD" : "UZS";
      const field = `${item.type}${suffix}`;

      groups[key][field] += Number(item.amount) || 0;
    });

    if (monthly) {
      const result = [];
      const today = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          today.getFullYear(),
          today.getMonth() - i,
          1
        );

        const key = localDate(date).slice(0, 7);

        result.push(groups[key] || {
          key,
          incomeUZS: 0,
          expenseUZS: 0,
          incomeUSD: 0,
          expenseUSD: 0
        });
      }

      return result;
    }

    const result = [];
    const today = new Date();
    const count = state.period === "7" ? 7 : 30;

    for (let i = count - 1; i >= 0; i--) {
      const date = addDays(today, -i);
      const key = localDate(date);

      result.push(groups[key] || {
        key,
        incomeUZS: 0,
        expenseUZS: 0,
        incomeUSD: 0,
        expenseUSD: 0
      });
    }

    return result;
  }

  function renderChart(items) {
    if (state.currency === "BOTH") {
      state.currency = "UZS";
      const uzsChart = renderChart(items);

      state.currency = "USD";
      const usdChart = renderChart(items);

      state.currency = "BOTH";

      return `
        <div class="analytics-dual">
          <section>
            <h4>UZS</h4>
            ${uzsChart}
          </section>
          <section>
            <h4>USD</h4>
            ${usdChart}
          </section>
        </div>
      `;
    }

    const data = getChartData(items);

    const values = data.map(item => {
      const income = state.currency === "USD"
        ? item.incomeUSD
        : item.incomeUZS;

      const expense = state.currency === "USD"
        ? item.expenseUSD
        : item.expenseUZS;

      return { ...item, income, expense };
    });

    const max = Math.max(
      1,
      ...values.flatMap(item => [item.income, item.expense])
    );

    const isDaily = state.period === "7" || state.period === "30";

    return `
      <div class="analytics-chart">
        <div class="analytics-chart-legend">
          <span><i class="legend-income"></i>${t("income")}</span>
          <span><i class="legend-expense"></i>${t("expenses")}</span>
        </div>

        <div class="analytics-bars">
          ${values.map((item, index) => {
            const incomeHeight = item.income / max * 100;
            const expenseHeight = item.expense / max * 100;

            const label = item.key.length === 7
              ? new Date(
                  Number(item.key.slice(0, 4)),
                  Number(item.key.slice(5, 7)) - 1,
                  1
                ).toLocaleDateString(
                  language() === "uz" ? "uz-UZ" : "ru-RU",
                  { month: "short" }
                )
              : formatDate(item.key);

            // Показываем подписи через 5 дней на графике за 30 дней
            const showLabel = !isDaily ||
              state.period === "7" ||
              index % 5 === 0 ||
              index === values.length - 1;

            return `
              <div class="analytics-bar-group"
                title="${escapeHTML(label)}">
                <div class="analytics-bar-pair">
                  <div class="analytics-bar income-bar"
                    style="height:${incomeHeight}%"></div>
                  <div class="analytics-bar expense-bar"
                    style="height:${expenseHeight}%"></div>
                </div>

                <span class="${showLabel ? "" : "analytics-hidden-label"}">
                  ${showLabel ? escapeHTML(label) : ""}
                </span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderCategories(items) {
    if (state.currency === "BOTH") {
      state.currency = "UZS";
      const uzsCategories = renderCategories(items);

      state.currency = "USD";
      const usdCategories = renderCategories(items);

      state.currency = "BOTH";

      return `
        <div class="analytics-dual">
          <section>
            <h4>UZS</h4>
            ${uzsCategories}
          </section>
          <section>
            <h4>USD</h4>
            ${usdCategories}
          </section>
        </div>
      `;
    }

    const expenses = items.filter(item => item.type === "expense");

    const totals = {};

    expenses.forEach(item => {
      const category = item.category || "other";

      if (!totals[category]) {
        totals[category] = { UZS: 0, USD: 0 };
      }

      if (totals[category][item.currency] !== undefined) {
        totals[category][item.currency] += Number(item.amount) || 0;
      }
    });

    const rows = Object.entries(totals).map(([category, amounts]) => {
      const value = state.currency === "USD"
        ? amounts.USD
        : amounts.UZS;

      return { category, value, amounts };
    }).filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (!rows.length) {
      return `<div class="analytics-no-data">${t("noData")}</div>`;
    }

    const total = rows.reduce((sum, item) => sum + item.value, 0);

    return `
      <div class="analytics-category-list">
        ${rows.map(item => {
          const percent = item.value / total * 100;

          return `
            <div class="analytics-category">
              <div class="analytics-category-top">
                <strong>${t(categoryNames[item.category] || "other")}</strong>
                <span>${money(item.value, state.currency === "USD" ? "USD" : "UZS")}</span>
              </div>

              <div class="analytics-progress-track">
                <div class="analytics-progress-fill"
                  style="width:${percent}%"></div>
              </div>

              <small>${percent.toFixed(1)}%</small>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderRecent(items) {
    const recent = [...items]
      .sort((a, b) => {
        const dateCompare = (b.date || "").localeCompare(a.date || "");
        if (dateCompare !== 0) return dateCompare;

        return (b.createdAt || "").localeCompare(a.createdAt || "");
      })
      .slice(0, 8);

    if (!recent.length) {
      return `<div class="analytics-no-data">${t("noOperations")}</div>`;
    }

    return `
      <div class="analytics-table-wrap">
        <table class="analytics-table">
          <thead>
            <tr>
              <th>${t("date")}</th>
              <th>${t("category")}</th>
              <th>${t("description")}</th>
              <th>${t("amount")}</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map(item => {
              const income = item.type === "income";
              const category = t(categoryNames[item.category] || "other");

              return `
                <tr>
                  <td>${formatDate(item.date)}</td>
                  <td>${category}</td>
                  <td>${escapeHTML(item.description || "—")}</td>
                  <td class="${income ? "analytics-positive" : "analytics-negative"}">
                    ${income ? "+" : "−"}${money(item.amount, item.currency)}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function render() {
    const panel = document.getElementById("modulePanel");
    if (!panel) return;

    const items = getFilteredTransactions();

    const incomes = currencyValues(items, "income");
    const expenses = currencyValues(items, "expense");

    const balance = {
      UZS: incomes.UZS - expenses.UZS,
      USD: incomes.USD - expenses.USD
    };

    const taxiIncome = currencyValues(
      items.filter(item =>
        item.category === "taxi" && item.type === "income"
      )
    );

    const fuelExpenses = currencyValues(
      items.filter(item =>
        item.category === "fuel" && item.type === "expense"
      )
    );

    const carExpenses = currencyValues(
      items.filter(item =>
        item.category === "car" && item.type === "expense"
      )
    );

    // Garage records are shown as a count only.
    // Their costs are already included in Finance transactions.
    const garageServices = state.garage.filter(item =>
      item.type === "service"
    );

    const averageIncome = {
      UZS: incomes.UZS / Math.max(1, new Set(
        items.filter(item => item.type === "income").map(item => item.date)
      ).size),
      USD: incomes.USD / Math.max(1, new Set(
        items.filter(item => item.type === "income").map(item => item.date)
      ).size)
    };

    const periods = [
      ["7", "days7"],
      ["30", "days30"],
      ["90", "days90"],
      ["year", "year"],
      ["all", "all"]
    ];

    panel.innerHTML = `
      <div class="analytics-page">

        <div class="analytics-heading">
          <div>
            <h2>${t("title")}</h2>
            <p>${t("subtitle")}</p>
          </div>

          <div class="analytics-currency">
            ${["BOTH", "UZS", "USD"].map(currency => `
              <button
                data-analytics-currency="${currency}"
                class="${state.currency === currency ? "active" : ""}">
                ${currency}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="analytics-periods">
          ${periods.map(([value, label]) => `
            <button
              data-analytics-period="${value}"
              class="${state.period === value ? "active" : ""}">
              ${t(label)}
            </button>
          `).join("")}
        </div>

        <div class="analytics-kpis">
          <div class="analytics-kpi">
            <span>${t("income")}</span>
            <strong class="analytics-positive">
              ${moneyPair(incomes.UZS, incomes.USD)}
            </strong>
          </div>

          <div class="analytics-kpi">
            <span>${t("expenses")}</span>
            <strong class="analytics-negative">
              ${moneyPair(expenses.UZS, expenses.USD)}
            </strong>
          </div>

          <div class="analytics-kpi">
            <span>${t("balance")}</span>
            <strong class="${balance.UZS >= 0 && balance.USD >= 0
              ? "analytics-positive" : "analytics-negative"}">
              ${moneyPair(balance.UZS, balance.USD)}
            </strong>
          </div>

          <div class="analytics-kpi">
            <span>${t("operations")}</span>
            <strong>${items.length}</strong>
          </div>
        </div>

        <div class="analytics-grid">

          <section class="analytics-card analytics-chart-card">
            <div class="analytics-card-heading">
              <h3>${t("chart")}</h3>
            </div>
            ${renderChart(items)}
          </section>

          <section class="analytics-card">
            <div class="analytics-card-heading">
              <h3>${t("categories")}</h3>
            </div>
            ${renderCategories(items)}
          </section>

        </div>

        <section class="analytics-card analytics-work-card">
          <div class="analytics-card-heading">
            <h3>${t("taxi")}</h3>
          </div>

          <div class="analytics-work-grid">
            <div>
              <span>${t("taxi")}</span>
              <strong>${moneyPair(taxiIncome.UZS, taxiIncome.USD)}</strong>
            </div>

            <div>
              <span>${t("fuel")}</span>
              <strong>${moneyPair(fuelExpenses.UZS, fuelExpenses.USD)}</strong>
            </div>

            <div>
              <span>${t("car")}</span>
              <strong>${moneyPair(carExpenses.UZS, carExpenses.USD)}</strong>
            </div>

            <div>
              <span>${t("services")}</span>
              <strong>${garageServices.length}</strong>
              <small>${t("serviceCount")}</small>
            </div>
          </div>
        </section>

        <section class="analytics-card">
          <div class="analytics-card-heading">
            <h3>${t("recent")}</h3>
          </div>
          ${renderRecent(items)}
        </section>

      </div>
    `;

    panel.querySelectorAll("[data-analytics-period]").forEach(button => {
      button.addEventListener("click", () => {
        state.period = button.dataset.analyticsPeriod;
        render();
      });
    });

    panel.querySelectorAll("[data-analytics-currency]").forEach(button => {
      button.addEventListener("click", () => {
        state.currency = button.dataset.analyticsCurrency;
        render();
      });
    });
  }

  async function refresh() {
    try {
      state.transactions = await DB.getAll("transactions") || [];
      state.garage = await DB.getAll("garage") || [];
      render();
    } catch (error) {
      console.error("Analytics loading error:", error);

      const panel = document.getElementById("modulePanel");

      if (panel) {
        panel.innerHTML = `
          <div class="analytics-no-data">
            ${t("loadingError")}: ${escapeHTML(error.message)}
          </div>
        `;
      }
    }
  }

  window.ASADAnalytics = { refresh };
})();

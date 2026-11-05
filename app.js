/* =========================================
   ASAD OS — APPLICATION CORE V2
========================================= */

(() => {
  "use strict";

  const DB = window.ASADDatabase;

  const STORAGE = {
    theme: "asad-os-theme",
    language: "asad-os-language",
    currency: "asad-os-currency"
  };

  const $ = id => document.getElementById(id);

  let language = localStorage.getItem(STORAGE.language) || "ru";
  let theme = localStorage.getItem(STORAGE.theme) || "light";
  let currency = localStorage.getItem(STORAGE.currency) || "BOTH";

  let currentPage = "dashboard";

  const translations = {
    ru: {
      dashboard: "Главная",
      finance: "Финансы",
      driver: "Такси",
      garage: "Автомобиль",
      goals: "Цели и привычки",
      creator: "Creator Studio",
      planner: "Планировщик",
      analytics: "Аналитика",
      settings: "Настройки",
      workspace: "WORKSPACE",
      system: "SYSTEM",
      hello: "Привет",
      welcomeDescription: "Управляй своей жизнью. Двигайся к своим целям.",
      incomeToday: "Доход сегодня",
      expensesToday: "Расходы сегодня",
      tasksToday: "Задачи сегодня",
      goalsProgress: "Мои цели",
      incomeHint: "Доход за сегодняшний день",
      expensesHint: "Расходы за сегодняшний день",
      tasksHint: "Модуль появится позже",
      goalsHint: "Модуль появится позже",
      quickActions: "Быстрые действия",
      quickDescription: "Твои основные инструменты",
      addIncome: "Добавить операцию",
      addTrip: "Записать смену",
      addTask: "Создать задачу",
      carService: "Обслуживание авто",
      recentActivity: "Последняя активность",
      activityDescription: "Твои последние операции",
      noActivity: "Пока нет активности",
      viewAll: "Все →",
      footerText: "Создано для продуктивной жизни.",
      financeDescription: "Управляй деньгами, доходами и расходами.",
      driverDescription: "Контролируй заработок, поездки и топливо.",
      garageDescription: "Следи за состоянием своего Tracker 2.",
      goalsDescription: "Создавай цели и отслеживай прогресс.",
      creatorDescription: "Управляй стримами, видео и каналом.",
      plannerDescription: "Организуй свой день и задачи.",
      analyticsDescription: "Анализируй свою жизнь и результаты.",
      settingsDescription: "Настраивай ASAD OS под себя.",
      settingsTitle: "Настройки приложения",
      languageSetting: "Язык интерфейса",
      currencySetting: "Основная валюта",
      themeSetting: "Оформление",
      darkTheme: "Тёмная тема",
      lightTheme: "Светлая тема",
      saveNote: "Настройки сохраняются автоматически.",
      moduleEmptyTitle: "Раздел готовится",
      moduleEmptyDescription: "Функции этого раздела появятся в следующих обновлениях.",
      comingSoon: "СКОРО В СЛЕДУЮЩЕМ ОБНОВЛЕНИИ"
    },

    uz: {
      dashboard: "Bosh sahifa",
      finance: "Moliya",
      driver: "Taksi",
      garage: "Avtomobilim",
      goals: "Maqsadlar va odatlar",
      creator: "Creator Studio",
      planner: "Rejalashtiruvchi",
      analytics: "Tahlil",
      settings: "Sozlamalar",
      workspace: "ISH MAYDONI",
      system: "TIZIM",
      hello: "Salom",
      welcomeDescription: "Hayotingizni boshqaring. Maqsadlaringiz sari intiling.",
      incomeToday: "Bugungi daromad",
      expensesToday: "Bugungi xarajatlar",
      tasksToday: "Bugungi vazifalar",
      goalsProgress: "Maqsadlarim",
      incomeHint: "Bugungi daromad",
      expensesHint: "Bugungi xarajatlar",
      tasksHint: "Keyingi yangilanishda",
      goalsHint: "Keyingi yangilanishda",
      quickActions: "Tezkor amallar",
      quickDescription: "Asosiy vositalaringiz",
      addIncome: "Operatsiya qo‘shish",
      addTrip: "Smena yozish",
      addTask: "Vazifa yaratish",
      carService: "Avtomobil xizmati",
      recentActivity: "Oxirgi faollik",
      activityDescription: "Oxirgi operatsiyalaringiz",
      noActivity: "Hozircha faollik yo‘q",
      viewAll: "Barchasi →",
      footerText: "Samarali hayot uchun yaratilgan.",
      financeDescription: "Pul, daromad va xarajatlaringizni boshqaring.",
      driverDescription: "Daromad, safar va yoqilg‘ini nazorat qiling.",
      garageDescription: "Tracker 2 avtomobilingiz holatini kuzating.",
      goalsDescription: "Maqsadlar yarating va natijalarni kuzating.",
      creatorDescription: "Strim, video va kanalingizni boshqaring.",
      plannerDescription: "Kun va vazifalaringizni rejalashtiring.",
      analyticsDescription: "Hayotingiz va natijalaringizni tahlil qiling.",
      settingsDescription: "ASAD OS dasturini o‘zingizga moslang.",
      settingsTitle: "Dastur sozlamalari",
      languageSetting: "Interfeys tili",
      currencySetting: "Asosiy valyuta",
      themeSetting: "Dizayn",
      darkTheme: "Qorong‘i mavzu",
      lightTheme: "Yorug‘ mavzu",
      saveNote: "Sozlamalar avtomatik saqlanadi.",
      moduleEmptyTitle: "Bo‘lim tayyorlanmoqda",
      moduleEmptyDescription: "Ushbu bo‘lim funksiyalari keyingi yangilanishlarda qo‘shiladi.",
      comingSoon: "KEYINGI YANGILANISHLARDA"
    }
  };

  const modules = {
    finance: { icon: "◈", description: "financeDescription" },
    driver: { icon: "▣", description: "driverDescription" },
    garage: { icon: "⚙", description: "garageDescription" },
    goals: { icon: "◎", description: "goalsDescription" },
    creator: { icon: "▷", description: "creatorDescription" },
    planner: { icon: "▤", description: "plannerDescription" },
    analytics: { icon: "▥", description: "analyticsDescription" },
    settings: { icon: "⚙", description: "settingsDescription" }
  };

  function tr(key) {
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

  // TOAST

  window.showToast = function(message, type = "success") {
    const container = $("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-hide");
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  // THEME

  function applyTheme() {
    document.body.classList.toggle("dark-theme", theme === "dark");

    $("themeButton").textContent = theme === "dark" ? "☾" : "☀";

    localStorage.setItem(STORAGE.theme, theme);
  }

  $("themeButton").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";

    applyTheme();

    if (currentPage === "settings") renderSettings();
  });

  // CURRENCY

  function applyCurrency() {
    $("currencyButton").textContent = currency;

    localStorage.setItem(STORAGE.currency, currency);

    renderCurrentPage();
    updateDashboard();
  }

  $("currencyButton").addEventListener("click", () => {
    const options = ["BOTH", "UZS", "USD"];

    currency = options[
      (options.indexOf(currency) + 1) % options.length
    ];

    applyCurrency();
  });

  // LANGUAGE

  function applyLanguage() {
    document.documentElement.lang = language;

    localStorage.setItem(STORAGE.language, language);

    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = tr(element.dataset.i18n);
    });

    $("languageButton").textContent = language.toUpperCase();

    updateDate();
    renderCurrentPage();
    updateDashboard();
  }

  $("languageButton").addEventListener("click", () => {
    language = language === "ru" ? "uz" : "ru";
    applyLanguage();
  });

  // DATE

  function updateDate() {
    const now = new Date();

    $("currentDay").textContent =
      new Intl.DateTimeFormat(language === "uz" ? "uz-UZ" : "ru-RU", {
        weekday: "long"
      }).format(now);

    $("currentDate").textContent =
      new Intl.DateTimeFormat(language === "uz" ? "uz-UZ" : "ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(now);
  }

  // MONEY

  function money(value, curr) {
    const formatted = new Intl.NumberFormat(
      curr === "UZS" ? "ru-RU" : "en-US",
      {
        maximumFractionDigits: curr === "UZS" ? 0 : 2
      }
    ).format(value);

    return curr === "UZS" ? formatted + " UZS" : "$" + formatted;
  }

  function showMoney(uzs, usd) {
    if (currency === "UZS") return money(uzs, "UZS");
    if (currency === "USD") return money(usd, "USD");

    return `${money(uzs, "UZS")} / ${money(usd, "USD")}`;
  }

  function localToday() {
    const d = new Date();

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  // DASHBOARD REFRESH

  async function refreshDashboard() {
    try {
      if (window.ASADDashboard && typeof window.ASADDashboard.refresh === "function") {
        await window.ASADDashboard.refresh();
      } else {
        await updateDashboard();
      }
    } catch (error) {
      console.error("Smart Dashboard:", error);
      await updateDashboard();
    }
  }

  // NAVIGATION

  function closeSidebar() {
    $("sidebar").classList.remove("open");
    $("sidebarOverlay").classList.remove("visible");
  }

  function navigate(page) {
    if (page !== "dashboard" && !modules[page]) return;

    currentPage = page;

    document.querySelectorAll(".nav-item[data-page]").forEach(button => {
      button.classList.toggle("active", button.dataset.page === page);
    });

    renderCurrentPage();
    closeSidebar();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function renderCurrentPage() {
    const dashboard = $("dashboardPage");
    const other = $("otherPage");

    dashboard.classList.toggle("hidden", currentPage !== "dashboard");
    other.classList.toggle("hidden", currentPage === "dashboard");

    // SMART DASHBOARD
    if (currentPage === "dashboard") {
      $("pageTitle").textContent = tr("dashboard");
      $("breadcrumbPage").textContent = tr("dashboard");

      await refreshDashboard();
      return;
    }

    const module = modules[currentPage];

    $("pageTitle").textContent = tr(currentPage);
    $("breadcrumbPage").textContent = tr(currentPage);
    $("moduleTitle").textContent = tr(currentPage);
    $("moduleIcon").textContent = module.icon;
    $("moduleDescription").textContent = tr(module.description);

    const panel = $("modulePanel");

    panel.className = "panel module-panel";

    try {
      if (currentPage === "finance") {
        await window.ASADFinance.refresh();
        return;
      }

      if (currentPage === "driver") {
        await window.ASADDriver.refresh();
        return;
      }

      if (currentPage === "planner") {
        await window.ASADPlanner.refresh();
        return;
      }

      if (currentPage === "goals") {
        await window.ASADGoals.refresh();
        return;
      }

      if (currentPage === "garage") {
        await window.ASADGarage.refresh();
        return;
      }

      if (currentPage === "analytics") {
        await window.ASADAnalytics.refresh();
        return;
      }

      if (currentPage === "creator") {
        await window.ASADCreator.refresh();
        return;
      }

      if (currentPage === "settings") {
  renderSettings();
  await window.ASADSettings.refresh();
  return;
}

      panel.innerHTML = `
        <div class="empty-icon large">${module.icon}</div>
        <h3>${tr("moduleEmptyTitle")}</h3>
        <p>${tr("moduleEmptyDescription")}</p>
        <span class="coming-soon">${tr("comingSoon")}</span>
      `;

    } catch (error) {
      console.error(error);

      panel.innerHTML = `
        <div class="empty-icon large">!</div>
        <h3>Module error</h3>
        <p>${escapeHTML(error.message)}</p>
      `;
    }
  }

  // NAVIGATION EVENTS

document.addEventListener("click", event => {
  const button = event.target.closest(".nav-item[data-page]");

  if (button) {
    navigate(button.dataset.page);
  }
});

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-goto]");

    if (button) navigate(button.dataset.goto);
  });

  // MOBILE MENU

  $("menuButton").addEventListener("click", () => {
    $("sidebar").classList.add("open");
    $("sidebarOverlay").classList.add("visible");
  });

  $("closeSidebar").addEventListener("click", closeSidebar);
  $("sidebarOverlay").addEventListener("click", closeSidebar);

  // SETTINGS

  function renderSettings() {
    $("modulePanel").className = "panel module-panel";

    $("modulePanel").innerHTML = `
      <div class="settings-wrapper">

        <h3>${tr("settingsTitle")}</h3>

        <p class="settings-note">${tr("saveNote")}</p>

        <div class="setting-row">
          <span>${tr("languageSetting")}</span>

          <select id="settingsLanguage">
            <option value="ru">Русский</option>
            <option value="uz">O‘zbekcha</option>
          </select>
        </div>

        <div class="setting-row">
          <span>${tr("currencySetting")}</span>

          <select id="settingsCurrency">
            <option value="BOTH">UZS + USD</option>
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div class="setting-row">
          <span>${tr("themeSetting")}</span>

          <select id="settingsTheme">
            <option value="light">${tr("lightTheme")}</option>
            <option value="dark">${tr("darkTheme")}</option>
          </select>
        </div>

      </div>
    `;

    $("settingsLanguage").value = language;
    $("settingsCurrency").value = currency;
    $("settingsTheme").value = theme;

    $("settingsLanguage").addEventListener("change", event => {
      language = event.target.value;
      applyLanguage();
    });

    $("settingsCurrency").addEventListener("change", event => {
      currency = event.target.value;
      applyCurrency();
    });

    $("settingsTheme").addEventListener("change", event => {
      theme = event.target.value;
      applyTheme();
      renderSettings();
    });
  }

  // OLD DASHBOARD FALLBACK

  window.updateDashboard = async function() {
    try {
      const records = await DB.getTransactions();

      const daily = records.filter(item => item.date === localToday());

      const totals = {
        UZS: { income: 0, expense: 0 },
        USD: { income: 0, expense: 0 }
      };

      daily.forEach(item => {
        if (!totals[item.currency] || !totals[item.currency][item.type]) return;

        totals[item.currency][item.type] += Number(item.amount);
      });

      $("dashboardIncome").textContent = showMoney(
        totals.UZS.income,
        totals.USD.income
      );

      $("dashboardExpense").textContent = showMoney(
        totals.UZS.expense,
        totals.USD.expense
      );

      const recent = records.slice(0, 4);

      const activity = $("dashboardActivity");

      if (!recent.length) {
        activity.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">◷</div>
            <strong>${tr("noActivity")}</strong>
          </div>
        `;
      } else {
        const categoryLabels = {
          taxi: language === "uz" ? "Yandex Taksi" : "Яндекс Такси",
          fuel: language === "uz" ? "Yoqilg‘i" : "Топливо",
          car: language === "uz" ? "Avtomobil" : "Автомобиль",
          food: language === "uz" ? "Oziq-ovqat" : "Еда",
          home: language === "uz" ? "Uy" : "Дом",
          shopping: language === "uz" ? "Xaridlar" : "Покупки",
          debt: language === "uz" ? "Qarzlar" : "Долги",
          other: language === "uz" ? "Boshqa" : "Другое"
        };

        activity.innerHTML = recent.map(item => `
          <div class="activity-item">

            <span class="transaction-icon ${item.type}">
              ${item.type === "income" ? "↗" : "↘"}
            </span>

            <div class="activity-info">
              <strong>${escapeHTML(
                categoryLabels[item.category] || item.category
              )}</strong>
              <small>${escapeHTML(item.date)}</small>
            </div>

            <span class="activity-amount ${item.type}">
              ${item.type === "income" ? "+" : "−"}
              ${money(item.amount, item.currency)}
            </span>

          </div>
        `).join("");
      }

    } catch (error) {
      console.error("Dashboard:", error);
    }
  };

  // INITIALIZATION

  async function initialize() {
    if (!["ru", "uz"].includes(language)) language = "ru";
    if (!["light", "dark"].includes(theme)) theme = "light";
    if (!["BOTH", "UZS", "USD"].includes(currency)) currency = "BOTH";

    applyTheme();

    $("languageButton").textContent = language.toUpperCase();
    $("currencyButton").textContent = currency;

    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = tr(element.dataset.i18n);
    });

    updateDate();

    try {
      await DB.open();

      // Запускаем Smart Dashboard после открытия базы данных
      await refreshDashboard();

      console.log("ASAD OS V2 initialized successfully.");

    } catch (error) {
      console.error(error);
      window.showToast("Database error: " + error.message, "error");
    }
  }

  initialize();

})();
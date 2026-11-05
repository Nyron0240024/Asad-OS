
(() => {
  "use strict";

  const DB = window.ASADDatabase;
  const $ = selector => document.querySelector(selector);

  const today = () => {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  };

  const language = () =>
    localStorage.getItem("asad-os-language") || "ru";

  const currencyMode = () =>
    localStorage.getItem("asad-os-currency") || "BOTH";

  function formatNumber(value) {
    return new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function formatMoney(uzs, usd) {
    const mode = currencyMode();

    if (mode === "UZS") return `${formatNumber(uzs)} UZS`;
    if (mode === "USD") return `$${formatNumber(usd)}`;

    return `
      <span>${formatNumber(uzs)} UZS</span>
      <small>$${formatNumber(usd)}</small>
    `;
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

  function dateLabel(value) {
    if (!value) return "—";

    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    return date.toLocaleDateString(
      language() === "uz" ? "uz-UZ" : "ru-RU",
      { day: "numeric", month: "short" }
    );
  }

  function getText(ru, uz) {
    return language() === "uz" ? uz : ru;
  }

  function sumByCurrency(items, type) {
    const result = { UZS: 0, USD: 0 };

    items.forEach(item => {
      if (item.type !== type) return;

      const currency = item.currency === "USD" ? "USD" : "UZS";
      result[currency] += Number(item.amount) || 0;
    });

    return result;
  }

  function getTaskStats(tasks) {
    const date = today();

    const todaysTasks = tasks.filter(task =>
      task.date === date ||
      task.deadline === date
    );

    const completed = todaysTasks.filter(task =>
      task.status === "completed" ||
      task.status === "done"
    ).length;

    return {
      total: todaysTasks.length,
      completed,
      pending: todaysTasks.length - completed,
      all: tasks
    };
  }

  function getGoalProgress(goals) {
    const active = goals.filter(goal =>
      goal.type === "goal" &&
      goal.status !== "completed"
    );

    const completed = goals.filter(goal =>
      goal.type === "goal" &&
      goal.status === "completed"
    );

    const all = [...active, ...completed];

    if (!all.length) return 0;

    const percentages = all.map(goal => {
      const current = Number(goal.current) || 0;
      const target = Number(goal.target) || 0;

      if (!target) return 0;

      // Поддержка обычных целей и целей на уменьшение.
      if (goal.direction === "decrease") {
        const start = Number(goal.startValue);
        if (!Number.isFinite(start) || start <= target) {
          return goal.status === "completed" ? 100 : 0;
        }

        return Math.max(
          0,
          Math.min(100, (start - current) / (start - target) * 100)
        );
      }

      return Math.max(0, Math.min(100, current / target * 100));
    });

    return Math.round(
      percentages.reduce((a, b) => a + b, 0) / percentages.length
    );
  }

  function renderActivity(transactions) {
    const host = $("#dashboardActivity");
    if (!host) return;

    const recent = [...transactions]
      .sort((a, b) => {
        const dateCompare = (b.date || "").localeCompare(a.date || "");
        if (dateCompare) return dateCompare;
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      })
      .slice(0, 5);

    if (!recent.length) {
      host.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">◷</div>
          <strong>${getText("Пока нет активности", "Hozircha faollik yo‘q")}</strong>
        </div>
      `;
      return;
    }

    host.innerHTML = recent.map(item => {
      const income = item.type === "income";
      const amount = formatMoney(
        item.currency === "USD" ? 0 : item.amount,
        item.currency === "USD" ? item.amount : 0
      );

      return `
        <div class="dashboard-activity-item">
          <div class="dashboard-activity-icon ${income ? "income" : "expense"}">
            ${income ? "↗" : "↘"}
          </div>

          <div class="dashboard-activity-info">
            <strong>${escapeHTML(item.description || (
              income
                ? getText("Доход", "Daromad")
                : getText("Расход", "Xarajat")
            ))}</strong>
            <small>${dateLabel(item.date)}</small>
          </div>

          <strong class="${income ? "dashboard-positive" : "dashboard-negative"}">
            ${income ? "+" : "−"}${amount}
          </strong>
        </div>
      `;
    }).join("");
  }

  function renderUpcoming(tasks) {
    const dashboard = $("#dashboardPage");
    if (!dashboard) return;

    let host = $("#dashboardUpcoming");

    if (!host) {
      const grid = dashboard.querySelector(".dashboard-grid");
      if (!grid) return;

      const panel = document.createElement("div");
      panel.className = "panel dashboard-upcoming-panel";
      panel.innerHTML = `
        <div class="panel-heading">
          <div>
            <h3>${getText("Ближайшие задачи", "Yaqin vazifalar")}</h3>
            <p>${getText("Твои следующие дела", "Keyingi vazifalaring")}</p>
          </div>
          <button class="text-button" data-goto="planner">
            ${getText("Открыть →", "Ochish →")}
          </button>
        </div>
        <div id="dashboardUpcoming"></div>
      `;

      grid.insertAdjacentElement("afterend", panel);
      host = $("#dashboardUpcoming");
    }

    const date = today();

    const upcoming = tasks
      .filter(task =>
        task.status !== "completed" &&
        task.status !== "done" &&
        task.date &&
        task.date >= date
      )
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare) return dateCompare;
        return (a.time || "").localeCompare(b.time || "");
      })
      .slice(0, 5);

    if (!upcoming.length) {
      host.innerHTML = `
        <div class="dashboard-upcoming-empty">
          ${getText("Нет предстоящих задач", "Yaqin vazifalar yo‘q")}
        </div>
      `;
      return;
    }

    host.innerHTML = upcoming.map(task => `
      <div class="dashboard-upcoming-item">
        <span class="dashboard-upcoming-date">${dateLabel(task.date)}</span>
        <div>
          <strong>${escapeHTML(task.title)}</strong>
          <small>${escapeHTML(task.time || "")}</small>
        </div>
      </div>
    `).join("");
  }

  function updateStats(transactions, tasks, goals) {
    const date = today();

    const todaysTransactions = transactions.filter(item =>
      item.date === date
    );

    const income = sumByCurrency(todaysTransactions, "income");
    const expense = sumByCurrency(todaysTransactions, "expense");

    const incomeElement = $("#dashboardIncome");
    const expenseElement = $("#dashboardExpense");

    if (incomeElement) {
      incomeElement.innerHTML = formatMoney(income.UZS, income.USD);
    }

    if (expenseElement) {
      expenseElement.innerHTML = formatMoney(expense.UZS, expense.USD);
    }

    const taskStats = getTaskStats(tasks);
    const cards = document.querySelectorAll(
      "#dashboardPage .stats-grid .stat-card"
    );

    if (cards[2]) {
      cards[2].querySelector("h3").textContent =
        `${taskStats.completed}/${taskStats.total}`;

      const description = cards[2].querySelector("p");
      if (description) {
        description.textContent = getText(
          `${taskStats.pending} осталось выполнить`,
          `${taskStats.pending} ta bajarilishi kerak`
        );
      }
    }

    const progress = getGoalProgress(goals);

    if (cards[3]) {
      cards[3].querySelector("h3").textContent = `${progress}%`;

      const description = cards[3].querySelector("p");
      if (description) {
        description.textContent = getText(
          `${goals.filter(g => g.type === "goal").length} активных и завершённых целей`,
          `${goals.filter(g => g.type === "goal").length} ta maqsad`
        );
      }
    }
  }

  function updateDate() {
    const now = new Date();

    const day = $("#currentDay");
    const date = $("#currentDate");

    if (day) {
      day.textContent = now.toLocaleDateString(
        language() === "uz" ? "uz-UZ" : "ru-RU",
        { weekday: "long" }
      );
    }

    if (date) {
      date.textContent = now.toLocaleDateString(
        language() === "uz" ? "uz-UZ" : "ru-RU",
        { day: "numeric", month: "long", year: "numeric" }
      );
    }
  }

  async function refresh() {
    try {
      const [transactions, tasks, goals] = await Promise.all([
        DB.getAll("transactions"),
        DB.getAll("tasks"),
        DB.getAll("goals")
      ]);

      const safeTransactions = transactions || [];
      const safeTasks = tasks || [];
      const safeGoals = goals || [];

      updateDate();
      updateStats(safeTransactions, safeTasks, safeGoals);
      renderActivity(safeTransactions);
      renderUpcoming(safeTasks);

    } catch (error) {
      console.error("Smart Dashboard error:", error);
    }
  }

  window.ASADDashboard = { refresh };
})();

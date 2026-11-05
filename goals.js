/* =========================================
   ASAD OS — GOALS & HABITS V1
========================================= */

(() => {
  "use strict";

  const DB = window.ASADDatabase;
  const $ = id => document.getElementById(id);

  let records = [];
  let activeTab = "goals";
  let editingId = null;
  let formOpen = false;

  const words = {
    ru: {
      title: "Цели и привычки",
      subtitle: "Маленькие ежедневные действия создают большие результаты.",
      goals: "Мои цели",
      habits: "Мои привычки",
      addGoal: "Создать цель",
      addHabit: "Добавить привычку",
      goalName: "Название цели",
      habitName: "Название привычки",
      description: "Описание",
      target: "Желаемый результат",
      current: "Текущий прогресс",
      unit: "Единица измерения",
      deadline: "Крайний срок",
      date: "Дата создания",
      save: "Сохранить",
      cancel: "Отмена",
      edit: "Изменить",
      delete: "Удалить",
      complete: "Завершить",
      completed: "Завершена",
      active: "Активна",
      progress: "Прогресс",
      daysLeft: "Осталось дней",
      overdue: "Срок истёк",
      noDeadline: "Без срока",
      noGoals: "Пока нет целей",
      noGoalsHint: "Создай свою первую цель и начни двигаться вперёд.",
      noHabits: "Пока нет привычек",
      noHabitsHint: "Добавь привычку, которую хочешь выполнять каждый день.",
      today: "Сегодня",
      done: "Выполнено",
      notDone: "Не выполнено",
      streak: "Дней подряд",
      bestStreak: "Лучшая серия",
      totalHabits: "Всего привычек",
      completedToday: "Выполнено сегодня",
      totalGoals: "Всего целей",
      completedGoals: "Достигнуто целей",
      confirmDelete: "Удалить эту запись?",
      goalSaved: "Цель сохранена",
      habitSaved: "Привычка сохранена",
      deleted: "Запись удалена",
      error: "Ошибка",
      invalid: "Проверь введённые данные.",
      editGoal: "Редактирование цели",
      newGoal: "Новая цель",
      editHabit: "Редактирование привычки",
      newHabit: "Новая привычка",
      increase: "+1 прогресс",
      goalProgress: "Изменить прогресс",
      week: "Последние 7 дней",
      emptyUnit: "Например: км, кг, сум, часов",
      exampleGoal: "Например: Сбросить вес до 85 кг",
      exampleHabit: "Например: Читать 20 минут",
      all: "Все",
      percent: "выполнено"
    },

    uz: {
      title: "Maqsadlar va odatlar",
      subtitle: "Kichik kundalik harakatlar katta natijalar yaratadi.",
      goals: "Maqsadlarim",
      habits: "Odatlarim",
      addGoal: "Maqsad yaratish",
      addHabit: "Odat qo‘shish",
      goalName: "Maqsad nomi",
      habitName: "Odat nomi",
      description: "Tavsif",
      target: "Maqsadli natija",
      current: "Joriy natija",
      unit: "O‘lchov birligi",
      deadline: "Oxirgi muddat",
      date: "Yaratilgan sana",
      save: "Saqlash",
      cancel: "Bekor qilish",
      edit: "Tahrirlash",
      delete: "O‘chirish",
      complete: "Yakunlash",
      completed: "Yakunlangan",
      active: "Faol",
      progress: "Jarayon",
      daysLeft: "Qolgan kun",
      overdue: "Muddat tugagan",
      noDeadline: "Muddatsiz",
      noGoals: "Hozircha maqsadlar yo‘q",
      noGoalsHint: "Birinchi maqsadingizni yarating.",
      noHabits: "Hozircha odatlar yo‘q",
      noHabitsHint: "Har kuni bajarishni istagan odatingizni qo‘shing.",
      today: "Bugun",
      done: "Bajarildi",
      notDone: "Bajarilmadi",
      streak: "Ketma-ket kunlar",
      bestStreak: "Eng yaxshi seriya",
      totalHabits: "Jami odatlar",
      completedToday: "Bugun bajarildi",
      totalGoals: "Jami maqsadlar",
      completedGoals: "Erishilgan maqsadlar",
      confirmDelete: "Ushbu yozuv o‘chirilsinmi?",
      goalSaved: "Maqsad saqlandi",
      habitSaved: "Odat saqlandi",
      deleted: "Yozuv o‘chirildi",
      error: "Xatolik",
      invalid: "Ma'lumotlarni tekshiring.",
      editGoal: "Maqsadni tahrirlash",
      newGoal: "Yangi maqsad",
      editHabit: "Odatni tahrirlash",
      newHabit: "Yangi odat",
      increase: "+1 natija",
      goalProgress: "Natijani o‘zgartirish",
      week: "Oxirgi 7 kun",
      emptyUnit: "Masalan: km, kg, so‘m, soat",
      exampleGoal: "Masalan: Vaznni 85 kg gacha tushirish",
      exampleHabit: "Masalan: 20 daqiqa kitob o‘qish",
      all: "Barchasi",
      percent: "bajarildi"
    }
  };

  function lang() {
    return localStorage.getItem("asad-os-language") === "uz"
      ? "uz" : "ru";
  }

  function t(key) {
    return words[lang()][key] || key;
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

  function shiftDate(date, days) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatDate(value) {
    if (!value) return t("noDeadline");

    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }

  function getGoals() {
    return records.filter(item => item.type === "goal");
  }

  function getHabits() {
    return records.filter(item => item.type === "habit");
  }

  function getStreak(habit) {
    const dates = [...new Set(habit.completedDates || [])].sort();

    if (!dates.length) return 0;

    let current = today();

    if (!dates.includes(current)) {
      current = shiftDate(current, -1);

      if (!dates.includes(current)) return 0;
    }

    let streak = 0;

    while (dates.includes(current)) {
      streak++;
      current = shiftDate(current, -1);
    }

    return streak;
  }

  function getBestStreak(habit) {
    const dates = [...new Set(habit.completedDates || [])].sort();

    let best = 0;
    let current = 0;
    let previous = null;

    dates.forEach(date => {
      if (previous && shiftDate(previous, 1) === date) {
        current++;
      } else {
        current = 1;
      }

      best = Math.max(best, current);
      previous = date;
    });

    return best;
  }

  function getGoalStatus(goal) {
    if (goal.status === "completed") {
      return {
        completed: true,
        percent: 100
      };
    }

    const target = Number(goal.target) || 0;
    const current = Number(goal.current) || 0;

    const percent = target > 0
      ? Math.min(100, Math.max(0, current / target * 100))
      : 0;

    return {
      completed: false,
      percent: Math.round(percent)
    };
  }

  function daysUntil(date) {
    if (!date) return null;

    const a = new Date(today() + "T00:00:00");
    const b = new Date(date + "T00:00:00");

    return Math.ceil((b - a) / 86400000);
  }

  function renderStats() {
    const goals = getGoals();
    const habits = getHabits();

    const completedGoals = goals.filter(
      item => item.status === "completed"
    ).length;

    const completedHabits = habits.filter(
      item => (item.completedDates || []).includes(today())
    ).length;

    return `
      <div class="goals-stats">

        <div class="goals-stat-card">
          <span>◎ ${t("totalGoals")}</span>
          <strong>${goals.length}</strong>
        </div>

        <div class="goals-stat-card">
          <span>✓ ${t("completedGoals")}</span>
          <strong>${completedGoals}</strong>
        </div>

        <div class="goals-stat-card">
          <span>◷ ${t("totalHabits")}</span>
          <strong>${habits.length}</strong>
        </div>

        <div class="goals-stat-card">
          <span>⚡ ${t("completedToday")}</span>
          <strong>${completedHabits}/${habits.length}</strong>
        </div>

      </div>
    `;
  }

  function renderGoalCard(goal) {
    const status = getGoalStatus(goal);
    const days = daysUntil(goal.deadline);

    const deadlineText = !goal.deadline
      ? t("noDeadline")
      : days < 0
        ? t("overdue")
        : `${t("daysLeft")}: ${days}`;

    return `
      <article class="goal-card">

        <div class="goal-card-top">
          <div class="goal-card-title">
            <h3>${escapeHTML(goal.title)}</h3>
            <span class="goal-status ${status.completed ? "completed" : "active"}">
              ${status.completed ? t("completed") : t("active")}
            </span>
          </div>

          <div class="goal-actions">
            <button data-goal-action="edit"
              data-id="${goal.id}" title="${t("edit")}">✎</button>
            <button data-goal-action="delete"
              data-id="${goal.id}" title="${t("delete")}">×</button>
          </div>
        </div>

        ${goal.description ? `
          <p class="goal-description">${escapeHTML(goal.description)}</p>
        ` : ""}

        <div class="goal-progress-info">
          <span>${t("progress")}</span>
          <strong>${status.percent}%</strong>
        </div>

        <div class="goal-progress-track">
          <div class="goal-progress-fill"
            style="width:${status.percent}%"></div>
        </div>

        <div class="goal-numbers">
          <span>
            ${Number(goal.current).toLocaleString("ru-RU")}
            / ${Number(goal.target).toLocaleString("ru-RU")}
            ${escapeHTML(goal.unit || "")}
          </span>
          <span>${deadlineText}</span>
        </div>

        ${!status.completed ? `
          <div class="goal-card-footer">
            <button class="goal-increase-button"
              data-goal-action="increase"
              data-id="${goal.id}">
              +1 ${escapeHTML(goal.unit || "")}
            </button>

            <button class="goal-complete-button"
              data-goal-action="complete"
              data-id="${goal.id}">
              ${t("complete")}
            </button>
          </div>
        ` : ""}
      </article>
    `;
  }

  function renderWeek(habit) {
    const dates = [];

    for (let i = 6; i >= 0; i--) {
      dates.push(shiftDate(today(), -i));
    }

    const completed = habit.completedDates || [];

    return `
      <div class="habit-week">
        ${dates.map(date => {
          const isDone = completed.includes(date);
          const dayName = new Intl.DateTimeFormat(
            lang() === "uz" ? "uz-UZ" : "ru-RU",
            { weekday: "short" }
          ).format(new Date(date + "T12:00:00"));

          return `
            <div class="habit-day">
              <small>${dayName}</small>
              <span class="${isDone ? "done" : ""}">
                ${isDone ? "✓" : "·"}
              </span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderHabitCard(habit) {
    const doneToday = (habit.completedDates || []).includes(today());

    return `
      <article class="habit-card">

        <div class="habit-card-top">

          <div class="habit-card-title">
            <span class="habit-symbol">✦</span>
            <div>
              <h3>${escapeHTML(habit.title)}</h3>
              ${habit.description ? `
                <p>${escapeHTML(habit.description)}</p>
              ` : ""}
            </div>
          </div>

          <div class="goal-actions">
            <button data-goal-action="edit"
              data-id="${habit.id}" title="${t("edit")}">✎</button>
            <button data-goal-action="delete"
              data-id="${habit.id}" title="${t("delete")}">×</button>
          </div>

        </div>

        <div class="habit-stats">
          <div>
            <strong>🔥 ${getStreak(habit)}</strong>
            <small>${t("streak")}</small>
          </div>

          <div>
            <strong>🏆 ${getBestStreak(habit)}</strong>
            <small>${t("bestStreak")}</small>
          </div>
        </div>

        ${renderWeek(habit)}

        <button class="habit-check-button ${doneToday ? "checked" : ""}"
          data-goal-action="toggle-habit"
          data-id="${habit.id}">
          ${doneToday ? "✓ " + t("done") : "+ " + t("today")}
        </button>

      </article>
    `;
  }

  function renderForm() {
    if (!formOpen) return "";

    const old = editingId === null
      ? null
      : records.find(item => item.id === editingId);

    const type = old?.type || activeTab;

    if (type === "goal") {
      return `
        <div class="finance-form-overlay"
          data-goal-action="overlay">

          <div class="finance-form-modal">

            <div class="finance-form-heading">
              <div>
                <h3>${old ? t("editGoal") : t("newGoal")}</h3>
              </div>

              <button class="finance-close"
                data-goal-action="close">×</button>
            </div>

            <form id="goalForm">

              <div class="finance-form-grid">

                <label class="finance-field full">
                  <span>${t("goalName")}</span>
                  <input id="goalTitle" maxlength="100"
                    value="${escapeHTML(old?.title || "")}"
                    placeholder="${t("exampleGoal")}" required>
                </label>

                <label class="finance-field full">
                  <span>${t("description")}</span>
                  <textarea id="goalDescription"
                    maxlength="250" rows="2">${escapeHTML(old?.description || "")}</textarea>
                </label>

                <label class="finance-field">
                  <span>${t("target")}</span>
                  <input type="number" id="goalTarget"
                    min="0.01" step="any"
                    value="${old?.target ?? ""}" required>
                </label>

                <label class="finance-field">
                  <span>${t("current")}</span>
                  <input type="number" id="goalCurrent"
                    min="0" step="any"
                    value="${old?.current ?? 0}" required>
                </label>

                <label class="finance-field">
                  <span>${t("unit")}</span>
                  <input id="goalUnit" maxlength="20"
                    value="${escapeHTML(old?.unit || "")}"
                    placeholder="${t("emptyUnit")}">
                </label>

                <label class="finance-field">
                  <span>${t("deadline")}</span>
                  <input type="date" id="goalDeadline"
                    value="${old?.deadline || ""}">
                </label>

              </div>

              <div class="finance-form-actions">
                <button type="button" class="finance-cancel"
                  data-goal-action="close">${t("cancel")}</button>

                <button type="submit" class="finance-save">
                  ${t("save")}
                </button>
              </div>

            </form>
          </div>
        </div>
      `;
    }

    return `
      <div class="finance-form-overlay"
        data-goal-action="overlay">

        <div class="finance-form-modal">

          <div class="finance-form-heading">
            <div>
              <h3>${old ? t("editHabit") : t("newHabit")}</h3>
            </div>

            <button class="finance-close"
              data-goal-action="close">×</button>
          </div>

          <form id="habitForm">

            <div class="finance-form-grid">

              <label class="finance-field full">
                <span>${t("habitName")}</span>
                <input id="habitTitle" maxlength="100"
                  value="${escapeHTML(old?.title || "")}"
                  placeholder="${t("exampleHabit")}" required>
              </label>

              <label class="finance-field full">
                <span>${t("description")}</span>
                <textarea id="habitDescription"
                  maxlength="250" rows="3">${escapeHTML(old?.description || "")}</textarea>
              </label>

            </div>

            <div class="finance-form-actions">
              <button type="button" class="finance-cancel"
                data-goal-action="close">${t("cancel")}</button>

              <button type="submit" class="finance-save">
                ${t("save")}
              </button>
            </div>

          </form>
        </div>
      </div>
    `;
  }

  function render() {
    const panel = $("modulePanel");
    if (!panel) return;

    const goals = getGoals();
    const habits = getHabits();

    panel.className = "panel goals-workspace";

    panel.innerHTML = `
      <div class="goals-toolbar">
        <div>
          <h3>${t("title")}</h3>
          <p>${t("subtitle")}</p>
        </div>
      </div>

      ${renderStats()}

      <div class="goals-tabs">
        <button class="${activeTab === "goals" ? "active" : ""}"
          data-goal-tab="goals">◎ ${t("goals")}</button>

        <button class="${activeTab === "habits" ? "active" : ""}"
          data-goal-tab="habits">✦ ${t("habits")}</button>
      </div>

      <div class="goals-section-heading">
        <h3>${activeTab === "goals" ? t("goals") : t("habits")}</h3>

        <button class="finance-add-button"
          data-goal-action="add">
          + ${activeTab === "goals" ? t("addGoal") : t("addHabit")}
        </button>
      </div>

      ${activeTab === "goals"
        ? goals.length
          ? `<div class="goals-grid">${goals.map(renderGoalCard).join("")}</div>`
          : `<div class="finance-empty">
               <div class="empty-icon large">◎</div>
               <h3>${t("noGoals")}</h3>
               <p>${t("noGoalsHint")}</p>
             </div>`
        : habits.length
          ? `<div class="habits-grid">${habits.map(renderHabitCard).join("")}</div>`
          : `<div class="finance-empty">
               <div class="empty-icon large">✦</div>
               <h3>${t("noHabits")}</h3>
               <p>${t("noHabitsHint")}</p>
             </div>`
      }

      ${renderForm()}
    `;
  }

  async function refresh() {
    records = await DB.getAll("goals");
    render();
  }

  function openForm(id = null) {
    editingId = id === null ? null : Number(id);
    formOpen = true;
    render();
  }

  function closeForm() {
    editingId = null;
    formOpen = false;
    render();
  }

  async function saveGoal() {
    const data = {
      title: $("goalTitle").value.trim(),
      description: $("goalDescription").value.trim(),
      target: Number($("goalTarget").value),
      current: Number($("goalCurrent").value),
      unit: $("goalUnit").value.trim(),
      deadline: $("goalDeadline").value,
      updatedAt: new Date().toISOString()
    };

    try {
      if (
        !data.title ||
        !Number.isFinite(data.target) ||
        data.target <= 0 ||
        !Number.isFinite(data.current) ||
        data.current < 0
      ) {
        throw new Error(t("invalid"));
      }

      if (editingId !== null) {
        const old = records.find(item => item.id === editingId);

        await DB.put("goals", {
          ...old,
          ...data,
          id: editingId
        });
      } else {
        await DB.add("goals", {
          ...data,
          type: "goal",
          status: data.current >= data.target ? "completed" : "active",
          createdAt: new Date().toISOString()
        });
      }

      closeForm();
      await refresh();
      window.showToast(t("goalSaved"), "success");

    } catch (error) {
      console.error(error);
      window.showToast(t("error") + ": " + error.message, "error");
    }
  }

  async function saveHabit() {
    const data = {
      title: $("habitTitle").value.trim(),
      description: $("habitDescription").value.trim(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (!data.title) {
        throw new Error(t("invalid"));
      }

      if (editingId !== null) {
        const old = records.find(item => item.id === editingId);

        await DB.put("goals", {
          ...old,
          ...data,
          id: editingId
        });
      } else {
        await DB.add("goals", {
          ...data,
          type: "habit",
          completedDates: [],
          createdAt: new Date().toISOString()
        });
      }

      closeForm();
      await refresh();
      window.showToast(t("habitSaved"), "success");

    } catch (error) {
      console.error(error);
      window.showToast(t("error") + ": " + error.message, "error");
    }
  }

    async function handleAction(button, event) {
    const action = button.dataset.goalAction;
    const id = Number(button.dataset.id);

    if (action === "add") {
      openForm();
      return;
    }

    if (action === "close") {
      closeForm();
      return;
    }

    if (action === "overlay" && event.target === button) {
      closeForm();
      return;
    }

    if (action === "edit") {
      openForm(id);
      return;
    }

    if (action === "delete") {
      if (!confirm(t("confirmDelete"))) return;

      await DB.remove("goals", id);
      await refresh();
      window.showToast(t("deleted"), "success");
      return;
    }

    if (action === "complete") {
      const goal = records.find(item => item.id === id);
      if (!goal) return;

      await DB.put("goals", {
        ...goal,
        current: Number(goal.target),
        status: "completed",
        completedAt: new Date().toISOString()
      });

      await refresh();
      return;
    }

    if (action === "increase") {
      const goal = records.find(item => item.id === id);
      if (!goal) return;

      const current = Number(goal.current || 0) + 1;
      const completed = current >= Number(goal.target);

      await DB.put("goals", {
        ...goal,
        current,
        status: completed ? "completed" : "active",
        ...(completed ? { completedAt: new Date().toISOString() } : {})
      });

      await refresh();
      return;
    }

    if (action === "toggle-habit") {
      const habit = records.find(item => item.id === id);
      if (!habit) return;

      const dates = [...(habit.completedDates || [])];
      const index = dates.indexOf(today());

      if (index >= 0) {
        dates.splice(index, 1);
      } else {
        dates.push(today());
      }

      await DB.put("goals", {
        ...habit,
        completedDates: dates,
        updatedAt: new Date().toISOString()
      });

      await refresh();
    }
  }

  document.addEventListener("click", async event => {
    const page = $("otherPage");

    if (!page || !page.contains(event.target)) return;

    const tab = event.target.closest("[data-goal-tab]");

    if (tab) {
      activeTab = tab.dataset.goalTab;
      formOpen = false;
      editingId = null;
      render();
      return;
    }

    const button = event.target.closest("[data-goal-action]");
    if (!button) return;

    try {
           await handleAction(button, event);
    } catch (error) {
      console.error(error);
      window.showToast(t("error") + ": " + error.message, "error");
    }
  });

  document.addEventListener("submit", event => {
    if (event.target.id === "goalForm") {
      event.preventDefault();
      saveGoal();
    }

    if (event.target.id === "habitForm") {
      event.preventDefault();
      saveHabit();
    }
  });

  window.ASADGoals = {
    render,
    refresh
  };

})();
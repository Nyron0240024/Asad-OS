(() => {
  "use strict";

  const DB = () => window.ASADDatabase;
  const ROOT_ID = "modulePanel";

  const state = {
    tasks: [],
    filter: "today",
    search: "",
    editingId: null,
    language: localStorage.getItem("asad-planner-language") || "ru"
  };

  const translations = {
    ru: {
      title: "Планировщик",
      subtitle: "Все твои задачи и планы в одном месте",
      add: "Добавить задачу",
      today: "Сегодня",
      upcoming: "Предстоящие",
      overdue: "Просроченные",
      all: "Все задачи",
      completed: "Выполненные",
      search: "Поиск задач...",
      total: "Всего задач",
      done: "Выполнено",
      pending: "Ожидают",
      late: "Просрочено",
      newTask: "Новая задача",
      editTask: "Редактировать задачу",
      taskTitle: "Название задачи",
      description: "Описание",
      date: "Дата",
      time: "Время",
      category: "Категория",
      priority: "Приоритет",
      status: "Статус",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      edit: "Изменить",
      markDone: "Выполнить",
      undo: "Вернуть",
      noTasks: "Задач пока нет",
      noTasksDesc: "Добавь первую задачу, чтобы ничего не забыть.",
      titleRequired: "Введи название задачи.",
      confirmDelete: "Удалить эту задачу?",
      todayLabel: "Сегодня",
      tomorrow: "Завтра",
      overdueLabel: "Просрочено",
      priorityLow: "Низкий",
      priorityMedium: "Средний",
      priorityHigh: "Высокий",
      statusPending: "Ожидает",
      statusProgress: "В процессе",
      statusDone: "Выполнено",
      work: "Работа",
      study: "Учёба",
      personal: "Личное",
      health: "Здоровье",
      car: "Автомобиль",
      finance: "Финансы",
      home: "Дом",
      other: "Другое",
      allCategories: "Все категории",
      week: "На этой неделе",
      overdueText: "Задача просрочена",
      dueToday: "На сегодня",
      emptySearch: "По запросу ничего не найдено",
      saved: "Задача сохранена",
      error: "Не удалось выполнить операцию"
    },
    uz: {
      title: "Rejalashtiruvchi",
      subtitle: "Barcha vazifa va rejalaring bir joyda",
      add: "Vazifa qo‘shish",
      today: "Bugun",
      upcoming: "Kelgusi",
      overdue: "Muddati o‘tgan",
      all: "Barcha vazifalar",
      completed: "Bajarilgan",
      search: "Vazifalarni qidirish...",
      total: "Jami vazifalar",
      done: "Bajarilgan",
      pending: "Kutilmoqda",
      late: "Muddati o‘tgan",
      newTask: "Yangi vazifa",
      editTask: "Vazifani tahrirlash",
      taskTitle: "Vazifa nomi",
      description: "Tavsif",
      date: "Sana",
      time: "Vaqt",
      category: "Kategoriya",
      priority: "Muhimlik",
      status: "Holati",
      save: "Saqlash",
      cancel: "Bekor qilish",
      delete: "O‘chirish",
      edit: "Tahrirlash",
      markDone: "Bajarildi",
      undo: "Qaytarish",
      noTasks: "Hozircha vazifalar yo‘q",
      noTasksDesc: "Birinchi vazifangni qo‘sh.",
      titleRequired: "Vazifa nomini kiriting.",
      confirmDelete: "Bu vazifa o‘chirilsinmi?",
      todayLabel: "Bugun",
      tomorrow: "Ertaga",
      overdueLabel: "Muddati o‘tgan",
      priorityLow: "Past",
      priorityMedium: "O‘rtacha",
      priorityHigh: "Yuqori",
      statusPending: "Kutilmoqda",
      statusProgress: "Jarayonda",
      statusDone: "Bajarilgan",
      work: "Ish",
      study: "O‘qish",
      personal: "Shaxsiy",
      health: "Salomatlik",
      car: "Avtomobil",
      finance: "Moliya",
      home: "Uy",
      other: "Boshqa",
      allCategories: "Barcha kategoriyalar",
      week: "Shu hafta",
      overdueText: "Vazifa muddati o‘tgan",
      dueToday: "Bugun",
      emptySearch: "Hech narsa topilmadi",
      saved: "Vazifa saqlandi",
      error: "Amalni bajarib bo‘lmadi"
    }
  };

  const t = key => translations[state.language][key] || key;

  const categories = [
    "work", "study", "personal", "health",
    "car", "finance", "home", "other"
  ];

  const priorities = ["low", "medium", "high"];
  const statuses = ["pending", "progress", "done"];

  function root() {
    return document.getElementById(ROOT_ID);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function localDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateObject(value) {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function isOverdue(task) {
    return task.status !== "done" &&
      task.date &&
      task.date < localDate();
  }

  function formatDate(value) {
    const date = dateObject(value);
    if (!date) return "—";

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (localDate(date) === localDate(today)) return t("todayLabel");
    if (localDate(date) === localDate(tomorrow)) return t("tomorrow");

    return date.toLocaleDateString(
      state.language === "uz" ? "uz-UZ" : "ru-RU",
      { day: "numeric", month: "short", year: "numeric" }
    );
  }

  function categoryName(category) {
    return t(category || "other");
  }

  function priorityName(priority) {
    return t(`priority${priority === "high" ? "High" :
      priority === "low" ? "Low" : "Medium"}`);
  }

  function statusName(status) {
    return t(`status${status === "done" ? "Done" :
      status === "progress" ? "Progress" : "Pending"}`);
  }

  async function loadTasks() {
    state.tasks = await DB().getAll("tasks") || [];
    state.tasks = state.tasks.filter(task => task && task.type !== "deleted");
  }

  function getFilteredTasks() {
    let tasks = [...state.tasks];
    const today = localDate();

    if (state.filter === "today") {
      tasks = tasks.filter(task =>
        task.date === today && task.status !== "done"
      );
    }

    if (state.filter === "upcoming") {
      tasks = tasks.filter(task =>
        task.date > today && task.status !== "done"
      );
    }

    if (state.filter === "overdue") {
      tasks = tasks.filter(isOverdue);
    }

    if (state.filter === "completed") {
      tasks = tasks.filter(task => task.status === "done");
    }

    if (state.search.trim()) {
      const query = state.search.toLowerCase().trim();

      tasks = tasks.filter(task =>
        `${task.title || ""} ${task.description || ""} ${task.category || ""}`
          .toLowerCase()
          .includes(query)
      );
    }

    return tasks.sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;

      const dateA = a.date || "9999-99-99";
      const dateB = b.date || "9999-99-99";

      if (dateA !== dateB) return dateA.localeCompare(dateB);

      return (a.time || "99:99").localeCompare(b.time || "99:99");
    });
  }

  function render() {
    const el = root();
    if (!el) {
      console.error(`ASAD OS: element #${ROOT_ID} not found`);
      return;
    }

    const activeTasks = state.tasks.filter(task => task.status !== "done");
    const completedTasks = state.tasks.filter(task => task.status === "done");
    const overdueTasks = activeTasks.filter(isOverdue);

    const counts = {
      total: state.tasks.length,
      done: completedTasks.length,
      pending: activeTasks.length,
      late: overdueTasks.length
    };

    const filters = [
      ["today", "today"],
      ["upcoming", "upcoming"],
      ["overdue", "overdue"],
      ["all", "all"],
      ["completed", "completed"]
    ];

    const tasks = getFilteredTasks();

    el.innerHTML = `
      <div class="planner-page">

        <div class="planner-header">
          <div>
            <div class="planner-title-row">
              <h2>${t("title")}</h2>
              <button class="planner-language" data-action="language">
                ${state.language === "ru" ? "RU" : "UZ"}
              </button>
            </div>
            <p>${t("subtitle")}</p>
          </div>

          <button class="planner-add-btn" data-action="add">
            <span>＋</span> ${t("add")}
          </button>
        </div>

        <div class="planner-stats">
          <div class="planner-stat">
            <span>${t("total")}</span>
            <strong>${counts.total}</strong>
          </div>
          <div class="planner-stat">
            <span>${t("done")}</span>
            <strong class="planner-green">${counts.done}</strong>
          </div>
          <div class="planner-stat">
            <span>${t("pending")}</span>
            <strong>${counts.pending}</strong>
          </div>
          <div class="planner-stat">
            <span>${t("late")}</span>
            <strong class="planner-red">${counts.late}</strong>
          </div>
        </div>

        <div class="planner-toolbar">
          <div class="planner-filters">
            ${filters.map(([key, label]) => `
              <button
                class="planner-filter ${state.filter === key ? "active" : ""}"
                data-filter="${key}">
                ${t(label)}
                ${key === "overdue" && counts.late
                  ? `<span class="planner-filter-count">${counts.late}</span>`
                  : ""}
              </button>
            `).join("")}
          </div>

          <input
            class="planner-search"
            type="search"
            placeholder="${t("search")}"
            value="${escapeHTML(state.search)}"
            data-search
          />
        </div>

        <div class="planner-task-list">
          ${tasks.length ? tasks.map(renderTask).join("") : `
            <div class="planner-empty">
              <div class="planner-empty-icon">✓</div>
              <h3>${state.search ? t("emptySearch") : t("noTasks")}</h3>
              <p>${t("noTasksDesc")}</p>
            </div>
          `}
        </div>

        <div id="planner-modal-root"></div>
      </div>
    `;

    attachEvents();
  }

  function renderTask(task) {
    const overdue = isOverdue(task);
    const done = task.status === "done";

    return `
      <div class="planner-task ${done ? "is-done" : ""} ${overdue ? "is-overdue" : ""}">
        <button
          class="planner-check ${done ? "checked" : ""}"
          data-action="toggle"
          data-id="${escapeHTML(task.id)}"
          title="${done ? t("undo") : t("markDone")}">
          ${done ? "✓" : ""}
        </button>

        <div class="planner-task-main">
          <div class="planner-task-top">
            <h3>${escapeHTML(task.title)}</h3>
            <span class="planner-priority priority-${escapeHTML(task.priority || "medium")}">
              ${priorityName(task.priority)}
            </span>
          </div>

          ${task.description ? `
            <p class="planner-task-description">
              ${escapeHTML(task.description)}
            </p>
          ` : ""}

          <div class="planner-task-meta">
            <span>▦ ${categoryName(task.category)}</span>
            <span class="${overdue ? "planner-red" : ""}">
              ◷ ${formatDate(task.date)}
              ${task.time ? ` · ${escapeHTML(task.time)}` : ""}
            </span>
            <span>${statusName(task.status)}</span>
            ${overdue ? `<span class="planner-red">${t("overdueText")}</span>` : ""}
          </div>
        </div>

        <div class="planner-task-actions">
          <button data-action="edit" data-id="${escapeHTML(task.id)}" title="${t("edit")}">✎</button>
          <button data-action="delete" data-id="${escapeHTML(task.id)}" title="${t("delete")}">×</button>
        </div>
      </div>
    `;
  }

 
function showModal(task = null) {
  state.editingId = task ? task.id : null;

  const modalRoot = document.getElementById("planner-modal-root");
  if (!modalRoot) return;

  const isEdit = Boolean(task);

  modalRoot.innerHTML = `
    <div class="planner-modal-backdrop">
      <div class="planner-modal" data-modal-content>

        <div class="planner-modal-header">
          <h3>${isEdit ? t("editTask") : t("newTask")}</h3>
          <button type="button" data-modal-close>×</button>
        </div>

        <form id="planner-task-form">

          <label>
            ${t("taskTitle")} *
            <input
              name="title"
              type="text"
              maxlength="120"
              required
              value="${escapeHTML(task?.title || "")}"
              placeholder="${t("taskTitle")}"
            />
          </label>

          <label>
            ${t("description")}
            <textarea
              name="description"
              rows="3"
              maxlength="1000"
              placeholder="${t("description")}"
            >${escapeHTML(task?.description || "")}</textarea>
          </label>

          <div class="planner-form-grid">

            <label>
              ${t("date")}
              <input
                name="date"
                type="date"
                value="${escapeHTML(task?.date || localDate())}"
              />
            </label>

            <label>
              ${t("time")}
              <input
                name="time"
                type="time"
                value="${escapeHTML(task?.time || "")}"
              />
            </label>

            <label>
              ${t("category")}
              <select name="category">
                ${categories.map(category => `
                  <option value="${category}"
                    ${task?.category === category ? "selected" : ""}>
                    ${categoryName(category)}
                  </option>
                `).join("")}
              </select>
            </label>

            <label>
              ${t("priority")}
              <select name="priority">
                ${priorities.map(priority => `
                  <option value="${priority}"
                    ${(task?.priority || "medium") === priority ? "selected" : ""}>
                    ${priorityName(priority)}
                  </option>
                `).join("")}
              </select>
            </label>

            <label class="planner-status-field">
              ${t("status")}
              <select name="status">
                ${statuses.map(status => `
                  <option value="${status}"
                    ${(task?.status || "pending") === status ? "selected" : ""}>
                    ${statusName(status)}
                  </option>
                `).join("")}
              </select>
            </label>

          </div>

          <div class="planner-modal-actions">
            <button type="button" class="planner-cancel" data-modal-close>
              ${t("cancel")}
            </button>

            <button type="submit" class="planner-save">
              ${t("save")}
            </button>
          </div>

        </form>
      </div>
    </div>
  `;

  const backdrop = modalRoot.querySelector(".planner-modal-backdrop");
  const modal = modalRoot.querySelector(".planner-modal");
  const form = modalRoot.querySelector("#planner-task-form");

  // Закрытие по крестику и кнопке отмены
  modalRoot.querySelectorAll("[data-modal-close]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      modalRoot.innerHTML = "";
      state.editingId = null;
    });
  });

  // Закрытие при клике за пределами окна
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) {
      modalRoot.innerHTML = "";
      state.editingId = null;
    }
  });

  // Клики внутри окна не закрывают его
  modal.addEventListener("click", event => {
    event.stopPropagation();
  });

  // Сохранение задачи
  form.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopPropagation();

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;

    try {
      await saveTask(form);
      modalRoot.innerHTML = "";
      state.editingId = null;
    } catch (error) {
      console.error("Planner save error:", error);
      alert(t("error"));
      submitButton.disabled = false;
    }
  });

  form.querySelector('input[name="title"]')?.focus();
}


  async function saveTask(form) {
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();

    if (!title) {
      alert(t("titleRequired"));
      return;
    }

    const oldTask = state.editingId
      ? state.tasks.find(task => String(task.id) === String(state.editingId))
      : null;

    const task = {
      ...(oldTask || {}),
      id: oldTask?.id || (
        window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
      ),
      type: "task",
      title,
      description: String(formData.get("description") || "").trim(),
      date: String(formData.get("date") || ""),
      time: String(formData.get("time") || ""),
      category: String(formData.get("category") || "other"),
      priority: String(formData.get("priority") || "medium"),
      status: String(formData.get("status") || "pending"),
      updatedAt: new Date().toISOString(),
      createdAt: oldTask?.createdAt || new Date().toISOString()
    };

    if (oldTask) {
      await DB().put("tasks", task);
    } else {
      await DB().add("tasks", task);
    }

    state.editingId = null;
    await refresh();
  }

  async function toggleTask(id) {
    const task = state.tasks.find(item => String(item.id) === String(id));
    if (!task) return;

    const updated = {
      ...task,
      status: task.status === "done" ? "pending" : "done",
      completedAt: task.status === "done" ? null : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await DB().put("tasks", updated);
    await refresh();
  }

  async function deleteTask(id) {
    if (!confirm(t("confirmDelete"))) return;

    await DB().remove("tasks", id);
    await refresh();
  }

 
function attachEvents() {
  const el = root();
  if (!el) return;

  // Фильтры задач
  el.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      state.filter = button.dataset.filter;
      render();
    });
  });

  // Поиск
  el.querySelector("[data-search]")?.addEventListener("input", event => {
    event.stopPropagation();

    state.search = event.target.value;
    const cursor = event.target.selectionStart;

    render();

    const input = root()?.querySelector("[data-search]");
    if (input) {
      input.focus();
      input.setSelectionRange(cursor, cursor);
    }
  });

  // Все действия Planner
  el.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", async event => {
      event.preventDefault();

      // Не позволяем Finance и другим модулям
      // перехватывать нажатия Planner
      event.stopPropagation();
      event.stopImmediatePropagation();

      const action = button.dataset.action;
      const id = button.dataset.id;

      try {
        if (action === "add") {
          showModal();
          return;
        }

        if (action === "edit") {
          const task = state.tasks.find(
            item => String(item.id) === String(id)
          );

          if (task) showModal(task);
          return;
        }

        if (action === "delete") {
          await deleteTask(id);
          return;
        }

        if (action === "toggle") {
          await toggleTask(id);
          return;
        }

        if (action === "language") {
          state.language = state.language === "ru" ? "uz" : "ru";

          localStorage.setItem(
            "asad-planner-language",
            state.language
          );

          render();
          return;
        }

        if (action === "close-modal") {
          const backdrop = button.closest(
            ".planner-modal-backdrop"
          );

          if (
            event.target === button ||
            event.target === backdrop
          ) {
            document.getElementById(
              "planner-modal-root"
            ).innerHTML = "";

            state.editingId = null;
          }
        }

      } catch (error) {
        console.error("Planner action error:", error);
        alert(t("error"));
      }
    });
  });

  // Сохранение задачи
  const form = el.querySelector("#planner-task-form");

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopPropagation();

    const submitButton = form.querySelector(
      '[type="submit"]'
    );

    submitButton.disabled = true;

    try {
      await saveTask(form);
    } catch (error) {
      console.error("Planner save error:", error);
      alert(t("error"));
      submitButton.disabled = false;
    }
  });

  // Клики внутри окна не закрывают модальное окно
  const modal = el.querySelector("[data-modal-content]");

  modal?.addEventListener("click", event => {
    event.stopPropagation();
  });
}


  async function refresh() {
    try {
      await loadTasks();
      render();
    } catch (error) {
      console.error("Planner loading error:", error);
      const el = root();
      if (el) {
        el.innerHTML = `
          <div class="planner-empty">
            <h3>Planner error</h3>
            <p>Не удалось загрузить задачи. Проверь database.js и консоль браузера.</p>
          </div>
        `;
      }
    }
  }

  window.ASADPlanner = { refresh };
})();
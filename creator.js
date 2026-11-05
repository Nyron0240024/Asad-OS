
(() => {
  "use strict";

  const STORAGE_KEY = "asad-os-creator-v1";

  const state = {
    streams: [],
    ideas: [],
    goal: 2000,
    modal: null,
    editingId: null,
    tab: "overview"
  };

  const lang = () =>
    localStorage.getItem("asad-os-language") || "ru";

  const currency = () =>
    localStorage.getItem("asad-os-currency") || "BOTH";

  const translations = {
    ru: {
      title: "Creator Studio",
      subtitle: "Управляй стримами, контентом и развитием канала",
      overview: "Обзор",
      streams: "Стримы",
      ideas: "Контент-план",
      followers: "Подписчики",
      totalStreams: "Всего стримов",
      totalViews: "Всего просмотров",
      gained: "Новые подписчики",
      donations: "Донаты",
      goal: "Цель подписчиков",
      goalProgress: "Прогресс цели",
      setGoal: "Изменить цель",
      addStream: "Добавить стрим",
      addIdea: "Добавить идею",
      recentStreams: "Последние стримы",
      recentIdeas: "Идеи для контента",
      noStreams: "Стримов пока нет",
      noIdeas: "Идей пока нет",
      streamTitle: "Название стрима",
      date: "Дата",
      duration: "Продолжительность (минуты)",
      views: "Просмотры",
      followersGained: "Новые подписчики",
      platform: "Платформа",
      donationUZS: "Донаты (UZS)",
      donationUSD: "Донаты (USD)",
      notes: "Заметки",
      save: "Сохранить",
      cancel: "Отмена",
      edit: "Изменить",
      delete: "Удалить",
      close: "Закрыть",
      ideaTitle: "Название идеи",
      format: "Формат",
      plannedDate: "Дата публикации",
      status: "Статус",
      planned: "Запланировано",
      done: "Опубликовано",
      markDone: "Опубликовано",
      markPlanned: "Вернуть в план",
      video: "Видео",
      short: "Shorts / Reels",
      stream: "Стрим",
      clip: "Клип",
      post: "Пост",
      youtube: "YouTube",
      tiktok: "TikTok",
      twitch: "Twitch",
      other: "Другое",
      allTime: "За всё время",
      averageDuration: "Средняя длительность",
      minutes: "мин.",
      hours: "ч.",
      confirmDelete: "Удалить запись?",
      enterTitle: "Введи название",
      goalSaved: "Цель обновлена",
      streamSaved: "Стрим сохранён",
      ideaSaved: "Идея сохранена",
      noDate: "Без даты",
      today: "Сегодня",
      viewsLabel: "просмотров",
      followersLabel: "подписчиков",
      totalDonations: "Всего донатов",
      contentCount: "Всего идей",
      published: "Опубликовано",
      plannedCount: "В плане",
      empty: "Пока пусто",
      addFirst: "Добавь первую запись",
      deleteIdea: "Удалить идею",
      deleteStream: "Удалить стрим"
    },
    uz: {
      title: "Creator Studio",
      subtitle: "Strim, kontent va kanal rivojini boshqar",
      overview: "Umumiy",
      streams: "Strimlar",
      ideas: "Kontent reja",
      followers: "Obunachilar",
      totalStreams: "Jami strimlar",
      totalViews: "Jami ko‘rishlar",
      gained: "Yangi obunachilar",
      donations: "Donatlar",
      goal: "Obunachilar maqsadi",
      goalProgress: "Maqsad bajarilishi",
      setGoal: "Maqsadni o‘zgartirish",
      addStream: "Strim qo‘shish",
      addIdea: "G‘oya qo‘shish",
      recentStreams: "Oxirgi strimlar",
      recentIdeas: "Kontent g‘oyalari",
      noStreams: "Hozircha strimlar yo‘q",
      noIdeas: "Hozircha g‘oyalar yo‘q",
      streamTitle: "Strim nomi",
      date: "Sana",
      duration: "Davomiyligi (daqiqa)",
      views: "Ko‘rishlar",
      followersGained: "Yangi obunachilar",
      platform: "Platforma",
      donationUZS: "Donatlar (UZS)",
      donationUSD: "Donatlar (USD)",
      notes: "Izohlar",
      save: "Saqlash",
      cancel: "Bekor qilish",
      edit: "Tahrirlash",
      delete: "O‘chirish",
      close: "Yopish",
      ideaTitle: "G‘oya nomi",
      format: "Format",
      plannedDate: "Reja sanasi",
      status: "Holati",
      planned: "Rejalashtirilgan",
      done: "E'lon qilindi",
      markDone: "E'lon qilindi",
      markPlanned: "Rejaga qaytarish",
      video: "Video",
      short: "Shorts / Reels",
      stream: "Strim",
      clip: "Klip",
      post: "Post",
      youtube: "YouTube",
      tiktok: "TikTok",
      twitch: "Twitch",
      other: "Boshqa",
      allTime: "Barcha vaqt",
      averageDuration: "O‘rtacha davomiylik",
      minutes: "daq.",
      hours: "soat",
      confirmDelete: "Yozuv o‘chirilsinmi?",
      enterTitle: "Nomini kiriting",
      goalSaved: "Maqsad yangilandi",
      streamSaved: "Strim saqlandi",
      ideaSaved: "G‘oya saqlandi",
      noDate: "Sanasiz",
      today: "Bugun",
      viewsLabel: "ko‘rish",
      followersLabel: "obunachi",
      totalDonations: "Jami donatlar",
      contentCount: "Jami g‘oyalar",
      published: "E'lon qilingan",
      plannedCount: "Rejada",
      empty: "Hozircha bo‘sh",
      addFirst: "Birinchi yozuvni qo‘sh",
      deleteIdea: "G‘oyani o‘chirish",
      deleteStream: "Strimni o‘chirish"
    }
  };

  const t = key => translations[lang()][key] || key;

  const $ = id => document.getElementById(id);

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function localDate() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatDate(value) {
    if (!value) return t("noDate");

    const parts = value.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    return date.toLocaleDateString(
      lang() === "uz" ? "uz-UZ" : "ru-RU",
      { day: "numeric", month: "short", year: "numeric" }
    );
  }

  function number(value) {
    return new Intl.NumberFormat(
      lang() === "uz" ? "uz-UZ" : "ru-RU"
    ).format(Number(value) || 0);
  }

  function formatDuration(minutes) {
    const value = Number(minutes) || 0;
    const hours = Math.floor(value / 60);
    const rest = value % 60;

    if (hours && rest) return `${hours} ${t("hours")} ${rest} ${t("minutes")}`;
    if (hours) return `${hours} ${t("hours")}`;
    return `${rest} ${t("minutes")}`;
  }

  function formatMoney(uzs, usd) {
    const mode = currency();

    const a = number(uzs) + " UZS";
    const b = "$" + number(usd);

    if (mode === "UZS") return a;
    if (mode === "USD") return b;
    return `${a} / ${b}`;
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      streams: state.streams,
      ideas: state.ideas,
      goal: state.goal
    }));
  }

  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

      state.streams = Array.isArray(saved.streams) ? saved.streams : [];
      state.ideas = Array.isArray(saved.ideas) ? saved.ideas : [];
      state.goal = Math.max(1, Number(saved.goal) || 2000);
    } catch (error) {
      console.error("Creator data error:", error);
    }
  }

  function id() {
    return window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `creator-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function totals() {
    return state.streams.reduce((result, item) => {
      result.views += Number(item.views) || 0;
      result.followers += Number(item.followers) || 0;
      result.duration += Number(item.duration) || 0;
      result.uzs += Number(item.donationUZS) || 0;
      result.usd += Number(item.donationUSD) || 0;
      return result;
    }, {
      views: 0,
      followers: 0,
      duration: 0,
      uzs: 0,
      usd: 0
    });
  }

  function render() {
    const panel = $("modulePanel");
    if (!panel) return;

    const data = totals();
    const published = state.ideas.filter(item => item.status === "done").length;
    const planned = state.ideas.length - published;
    const progress = Math.min(100, data.followers / state.goal * 100);

    const tabs = [
      ["overview", "overview"],
      ["streams", "streams"],
      ["ideas", "ideas"]
    ];

    panel.innerHTML = `
      <div class="creator-page">

        <div class="creator-heading">
          <div>
            <h2>${t("title")}</h2>
            <p>${t("subtitle")}</p>
          </div>
          <span class="creator-live-dot">● ${t("allTime")}</span>
        </div>

        <div class="creator-tabs">
          ${tabs.map(([value, label]) => `
            <button
              data-creator-tab="${value}"
              class="${state.tab === value ? "active" : ""}">
              ${t(label)}
            </button>
          `).join("")}
        </div>

        ${state.tab === "overview" ? renderOverview(data, progress, published, planned) : ""}
        ${state.tab === "streams" ? renderStreams() : ""}
        ${state.tab === "ideas" ? renderIdeas(published, planned) : ""}

        <div id="creator-modal-root"></div>
      </div>
    `;

    attachEvents();
  }

  function renderOverview(data, progress, published, planned) {
    const recent = [...state.streams]
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 4);

    const recentIdeas = [...state.ideas]
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))
      .slice(0, 4);

    return `
      <div class="creator-stats">
        <div class="creator-stat">
          <span>${t("totalStreams")}</span>
          <strong>${number(state.streams.length)}</strong>
          <small>${formatDuration(data.duration)}</small>
        </div>

        <div class="creator-stat">
          <span>${t("totalViews")}</span>
          <strong>${number(data.views)}</strong>
          <small>${t("allTime")}</small>
        </div>

        <div class="creator-stat">
          <span>${t("gained")}</span>
          <strong>${number(data.followers)}</strong>
          <small>${t("followersLabel")}</small>
        </div>

        <div class="creator-stat">
          <span>${t("donations")}</span>
          <strong class="creator-money">
            ${formatMoney(data.uzs, data.usd)}
          </strong>
          <small>${t("totalDonations")}</small>
        </div>
      </div>

      <section class="creator-card creator-goal-card">
        <div class="creator-card-heading">
          <div>
            <h3>${t("goal")}</h3>
            <p>${t("goalProgress")}</p>
          </div>
          <button class="creator-outline-btn" data-creator-action="goal">
            ${t("setGoal")}
          </button>
        </div>

        <div class="creator-goal-numbers">
          <strong>${number(data.followers)}</strong>
          <span>/ ${number(state.goal)}</span>
          <b>${progress.toFixed(1)}%</b>
        </div>

        <div class="creator-progress">
          <div style="width:${progress}%"></div>
        </div>
      </section>

      <div class="creator-columns">
        <section class="creator-card">
          <div class="creator-card-heading">
            <h3>${t("recentStreams")}</h3>
            <button class="creator-text-btn" data-creator-tab="streams">Все →</button>
          </div>

          ${recent.length ? recent.map(stream => `
            <div class="creator-list-item">
              <div class="creator-list-icon">▶</div>
              <div class="creator-list-main">
                <strong>${escapeHTML(stream.title)}</strong>
                <small>${formatDate(stream.date)} · ${formatDuration(stream.duration)}</small>
              </div>
              <span>${number(stream.views)} ${t("viewsLabel")}</span>
            </div>
          `).join("") : `<div class="creator-empty">${t("noStreams")}</div>`}
        </section>

        <section class="creator-card">
          <div class="creator-card-heading">
            <h3>${t("recentIdeas")}</h3>
            <button class="creator-text-btn" data-creator-tab="ideas">Все →</button>
          </div>

          ${recentIdeas.length ? recentIdeas.map(idea => `
            <div class="creator-list-item">
              <div class="creator-list-icon">✦</div>
              <div class="creator-list-main">
                <strong>${escapeHTML(idea.title)}</strong>
                <small>${t(idea.format)} · ${formatDate(idea.date)}</small>
              </div>
              <span class="${idea.status === "done" ? "creator-done" : ""}">
                ${t(idea.status === "done" ? "done" : "planned")}
              </span>
            </div>
          `).join("") : `<div class="creator-empty">${t("noIdeas")}</div>`}
        </section>
      </div>

      <div class="creator-quick-actions">
        <button class="creator-primary-btn" data-creator-action="add-stream">
          ＋ ${t("addStream")}
        </button>
        <button class="creator-secondary-btn" data-creator-action="add-idea">
          ＋ ${t("addIdea")}
        </button>
      </div>
    `;
  }

  function renderStreams() {
    const items = [...state.streams].sort((a, b) =>
      (b.date || "").localeCompare(a.date || "")
    );

    return `
      <div class="creator-section-heading">
        <div>
          <h3>${t("streams")}</h3>
          <p>${number(items.length)} · ${t("totalStreams")}</p>
        </div>
        <button class="creator-primary-btn" data-creator-action="add-stream">
          ＋ ${t("addStream")}
        </button>
      </div>

      ${items.length ? `
        <div class="creator-stream-list">
          ${items.map(item => `
            <article class="creator-stream-item">
              <div class="creator-stream-top">
                <div>
                  <h3>${escapeHTML(item.title)}</h3>
                  <p>${formatDate(item.date)} · ${escapeHTML(item.platform || "other")}</p>
                </div>
                <div class="creator-item-actions">
                  <button data-creator-action="edit-stream" data-id="${escapeHTML(item.id)}">✎</button>
                  <button data-creator-action="delete-stream" data-id="${escapeHTML(item.id)}">×</button>
                </div>
              </div>

              <div class="creator-stream-metrics">
                <div><span>${t("duration")}</span><strong>${formatDuration(item.duration)}</strong></div>
                <div><span>${t("views")}</span><strong>${number(item.views)}</strong></div>
                <div><span>${t("followersGained")}</span><strong>${number(item.followers)}</strong></div>
                <div><span>${t("donations")}</span><strong>${formatMoney(item.donationUZS, item.donationUSD)}</strong></div>
              </div>

              ${item.notes ? `<p class="creator-notes">${escapeHTML(item.notes)}</p>` : ""}
            </article>
          `).join("")}
        </div>
      ` : `<div class="creator-empty large">${t("noStreams")}<br>${t("addFirst")}</div>`}
    `;
  }

  function renderIdeas(published, planned) {
    const items = [...state.ideas].sort((a, b) =>
      (a.date || "9999").localeCompare(b.date || "9999")
    );

    return `
      <div class="creator-section-heading">
        <div>
          <h3>${t("ideas")}</h3>
          <p>${t("published")}: ${published} · ${t("plannedCount")}: ${planned}</p>
        </div>
        <button class="creator-primary-btn" data-creator-action="add-idea">
          ＋ ${t("addIdea")}
        </button>
      </div>

      ${items.length ? `
        <div class="creator-idea-list">
          ${items.map(item => `
            <article class="creator-idea-item ${item.status === "done" ? "is-published" : ""}">
              <div class="creator-idea-check">
                <button
                  data-creator-action="toggle-idea"
                  data-id="${escapeHTML(item.id)}">
                  ${item.status === "done" ? "✓" : ""}
                </button>
              </div>

              <div class="creator-idea-main">
                <strong>${escapeHTML(item.title)}</strong>
                <small>${t(item.format)} · ${formatDate(item.date)}</small>
              </div>

              <span class="creator-idea-status">
                ${t(item.status === "done" ? "done" : "planned")}
              </span>

              <div class="creator-item-actions">
                <button data-creator-action="edit-idea" data-id="${escapeHTML(item.id)}">✎</button>
                <button data-creator-action="delete-idea" data-id="${escapeHTML(item.id)}">×</button>
              </div>
            </article>
          `).join("")}
        </div>
      ` : `<div class="creator-empty large">${t("noIdeas")}<br>${t("addFirst")}</div>`}
    `;
  }

  function showModal(type, item = null) {
    state.modal = type;
    state.editingId = item?.id || null;

    const host = $("creator-modal-root");
    if (!host) return;

    const editing = Boolean(item);

    let body = "";

    if (type === "stream") {
      body = `
        <label>${t("streamTitle")} *
          <input name="title" required maxlength="120"
            value="${escapeHTML(item?.title || "")}">
        </label>

        <div class="creator-form-grid">
          <label>${t("date")}
            <input name="date" type="date"
              value="${escapeHTML(item?.date || localDate())}">
          </label>

          <label>${t("platform")}
            <select name="platform">
              ${["youtube", "tiktok", "twitch", "other"].map(value => `
                <option value="${value}" ${item?.platform === value ? "selected" : ""}>
                  ${t(value)}
                </option>
              `).join("")}
            </select>
          </label>

          <label>${t("duration")}
            <input name="duration" type="number" min="0"
              value="${Number(item?.duration) || 0}">
          </label>

          <label>${t("views")}
            <input name="views" type="number" min="0"
              value="${Number(item?.views) || 0}">
          </label>

          <label>${t("followersGained")}
            <input name="followers" type="number" min="0"
              value="${Number(item?.followers) || 0}">
          </label>

          <label>${t("donationUZS")}
            <input name="donationUZS" type="number" min="0" step="1"
              value="${Number(item?.donationUZS) || 0}">
          </label>

          <label>${t("donationUSD")}
            <input name="donationUSD" type="number" min="0" step="0.01"
              value="${Number(item?.donationUSD) || 0}">
          </label>
        </div>

        <label>${t("notes")}
          <textarea name="notes" rows="3">${escapeHTML(item?.notes || "")}</textarea>
        </label>
      `;
    }

    if (type === "idea") {
      body = `
        <label>${t("ideaTitle")} *
          <input name="title" required maxlength="150"
            value="${escapeHTML(item?.title || "")}">
        </label>

        <div class="creator-form-grid">
          <label>${t("format")}
            <select name="format">
              ${["video", "short", "stream", "clip", "post"].map(value => `
                <option value="${value}" ${item?.format === value ? "selected" : ""}>
                  ${t(value)}
                </option>
              `).join("")}
            </select>
          </label>

          <label>${t("plannedDate")}
            <input name="date" type="date"
              value="${escapeHTML(item?.date || localDate())}">
          </label>
        </div>
      `;
    }

    if (type === "goal") {
      body = `
        <label>${t("goal")}
          <input name="goal" type="number" min="1" required
            value="${state.goal}">
        </label>
      `;
    }

    host.innerHTML = `
      <div class="creator-modal-backdrop">
        <div class="creator-modal">
          <div class="creator-modal-header">
            <h3>${type === "stream" ? t("addStream") :
              type === "idea" ? t("addIdea") : t("setGoal")}</h3>
            <button type="button" data-creator-close>×</button>
          </div>

          <form id="creator-form">
            ${body}

            <div class="creator-modal-actions">
              <button type="button" class="creator-secondary-btn" data-creator-close>
                ${t("cancel")}
              </button>
              <button type="submit" class="creator-primary-btn">
                ${t("save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    host.querySelectorAll("[data-creator-close]").forEach(button => {
      button.addEventListener("click", closeModal);
    });

    host.querySelector(".creator-modal-backdrop").addEventListener("click", event => {
      if (event.target.classList.contains("creator-modal-backdrop")) {
        closeModal();
      }
    });

    host.querySelector(".creator-modal").addEventListener("click", event => {
      event.stopPropagation();
    });

    host.querySelector("#creator-form").addEventListener("submit", saveModal);

    host.querySelector('input[name="title"], input[name="goal"]')?.focus();
  }

  function closeModal() {
    const host = $("creator-modal-root");
    if (host) host.innerHTML = "";

    state.modal = null;
    state.editingId = null;
  }

  function saveModal(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    if (state.modal === "goal") {
      const goal = Number(data.get("goal"));

      if (!goal || goal < 1) return;

      state.goal = goal;
      saveData();
      closeModal();
      render();
      window.showToast?.(t("goalSaved"));
      return;
    }

    const title = String(data.get("title") || "").trim();
    if (!title) {
      alert(t("enterTitle"));
      return;
    }

    const old = state.modal === "stream"
      ? state.streams.find(item => item.id === state.editingId)
      : state.ideas.find(item => item.id === state.editingId);

    if (state.modal === "stream") {
      const item = {
        ...(old || {}),
        id: old?.id || id(),
        title,
        date: String(data.get("date") || ""),
        platform: String(data.get("platform") || "other"),
        duration: Math.max(0, Number(data.get("duration")) || 0),
        views: Math.max(0, Number(data.get("views")) || 0),
        followers: Math.max(0, Number(data.get("followers")) || 0),
        donationUZS: Math.max(0, Number(data.get("donationUZS")) || 0),
        donationUSD: Math.max(0, Number(data.get("donationUSD")) || 0),
        notes: String(data.get("notes") || "").trim(),
        updatedAt: new Date().toISOString()
      };

      if (old) {
        state.streams = state.streams.map(stream =>
          stream.id === old.id ? item : stream
        );
      } else {
        state.streams.push(item);
      }

      window.showToast?.(t("streamSaved"));
    }

    if (state.modal === "idea") {
      const item = {
        ...(old || {}),
        id: old?.id || id(),
        title,
        format: String(data.get("format") || "video"),
        date: String(data.get("date") || ""),
        status: old?.status || "planned",
        updatedAt: new Date().toISOString()
      };

      if (old) {
        state.ideas = state.ideas.map(idea =>
          idea.id === old.id ? item : idea
        );
      } else {
        state.ideas.push(item);
      }

      window.showToast?.(t("ideaSaved"));
    }

    saveData();
    closeModal();
    render();
  }

  function attachEvents() {
    const panel = $("modulePanel");
    if (!panel) return;

    panel.querySelectorAll("[data-creator-tab]").forEach(button => {
      button.addEventListener("click", () => {
        state.tab = button.dataset.creatorTab;
        render();
      });
    });

    panel.querySelectorAll("[data-creator-action]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.creatorAction;
        const itemId = button.dataset.id;

        if (action === "add-stream") showModal("stream");
        if (action === "add-idea") showModal("idea");
        if (action === "goal") showModal("goal");

        if (action === "edit-stream") {
          const item = state.streams.find(x => x.id === itemId);
          if (item) showModal("stream", item);
        }

        if (action === "edit-idea") {
          const item = state.ideas.find(x => x.id === itemId);
          if (item) showModal("idea", item);
        }

        if (action === "delete-stream") {
          if (!confirm(t("confirmDelete"))) return;
          state.streams = state.streams.filter(x => x.id !== itemId);
          saveData();
          render();
        }

        if (action === "delete-idea") {
          if (!confirm(t("confirmDelete"))) return;
          state.ideas = state.ideas.filter(x => x.id !== itemId);
          saveData();
          render();
        }

        if (action === "toggle-idea") {
          state.ideas = state.ideas.map(item =>
            item.id === itemId
              ? { ...item, status: item.status === "done" ? "planned" : "done" }
              : item
          );

          saveData();
          render();
        }
      });
    });
  }

  async function refresh() {
    loadData();
    render();
  }

  window.ASADCreator = { refresh };
})();

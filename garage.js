/* =========================================
   ASAD OS — GARAGE MANAGER V1
========================================= */

(() => {
  "use strict";

  const DB = window.ASADDatabase;
  const $ = id => document.getElementById(id);

  let services = [];
  let vehicle = null;
  let editingId = null;
  let formOpen = false;

  const categories = {
    oil: {
      ru: "Масло и фильтры",
      uz: "Moy va filtrlar",
      icon: "🛢️"
    },
    brakes: {
      ru: "Тормоза и колодки",
      uz: "Tormoz va kolodkalar",
      icon: "🛑"
    },
    tires: {
      ru: "Шины и колёса",
      uz: "Shina va g‘ildiraklar",
      icon: "🛞"
    },
    battery: {
      ru: "Аккумулятор",
      uz: "Akkumulyator",
      icon: "🔋"
    },
    engine: {
      ru: "Двигатель и коробка",
      uz: "Dvigatel va uzatma",
      icon: "⚙️"
    },
    suspension: {
      ru: "Подвеска",
      uz: "Osma tizimi",
      icon: "🔧"
    },
    gas: {
      ru: "Газовое оборудование",
      uz: "Gaz uskunasi",
      icon: "⛽"
    },
    other: {
      ru: "Прочее",
      uz: "Boshqa",
      icon: "🧰"
    }
  };

  const words = {
    ru: {
      title: "Мой автомобиль",
      subtitle: "Контроль состояния, обслуживания и расходов.",
      vehicle: "Мой автомобиль",
      brand: "Марка",
      model: "Модель",
      year: "Год выпуска",
      mileage: "Текущий пробег",
      fuelType: "Тип топлива",
      saveVehicle: "Сохранить автомобиль",
      services: "История обслуживания",
      add: "Добавить обслуживание",
      date: "Дата",
      category: "Категория",
      serviceName: "Название работы",
      amount: "Стоимость",
      currency: "Валюта",
      notes: "Заметка",
      reminderDate: "Напомнить по дате",
      reminderKm: "Напомнить на пробеге",
      noReminder: "Без напоминания",
      save: "Сохранить",
      cancel: "Отмена",
      edit: "Изменить",
      delete: "Удалить",
      confirmDelete: "Удалить эту запись и связанный расход из Finance?",
      newTitle: "Новое обслуживание",
      editTitle: "Редактирование обслуживания",
      noServices: "История пока пуста",
      noServicesHint: "Добавь первую запись об обслуживании автомобиля.",
      totalExpenses: "Расходы на обслуживание",
      serviceCount: "Количество работ",
      nextService: "Следующее обслуживание",
      due: "Пора обслужить",
      upcoming: "Скоро обслуживание",
      completed: "История",
      saved: "Запись сохранена",
      deleted: "Запись удалена",
      vehicleSaved: "Автомобиль сохранён",
      invalid: "Проверь введённые данные.",
      error: "Ошибка",
      description: "Расход автоматически попадёт в Finance.",
      currentMileage: "Пробег",
      noUpcoming: "Нет ближайших напоминаний",
      overdueDate: "Просрочено по дате",
      overdueKm: "Просрочено по пробегу",
      leftKm: "Осталось",
      leftDays: "Осталось дней",
      free: "Без расходов",
      fuelPropane: "Пропан",
      fuelPetrol: "Бензин",
      fuelHybrid: "Гибрид",
      fuelElectric: "Электро",
      all: "Все записи"
    },

    uz: {
      title: "Avtomobilim",
      subtitle: "Avtomobil holati, texnik xizmat va xarajatlar nazorati.",
      vehicle: "Avtomobilim",
      brand: "Marka",
      model: "Model",
      year: "Ishlab chiqarilgan yil",
      mileage: "Joriy masofa",
      fuelType: "Yoqilg‘i turi",
      saveVehicle: "Avtomobilni saqlash",
      services: "Xizmat ko‘rsatish tarixi",
      add: "Xizmat qo‘shish",
      date: "Sana",
      category: "Kategoriya",
      serviceName: "Ish nomi",
      amount: "Narxi",
      currency: "Valyuta",
      notes: "Izoh",
      reminderDate: "Sana bo‘yicha eslatma",
      reminderKm: "Masofa bo‘yicha eslatma",
      noReminder: "Eslatmasiz",
      save: "Saqlash",
      cancel: "Bekor qilish",
      edit: "Tahrirlash",
      delete: "O‘chirish",
      confirmDelete: "Ushbu yozuv va Finance dagi bog‘langan xarajat o‘chirilsinmi?",
      newTitle: "Yangi xizmat",
      editTitle: "Xizmatni tahrirlash",
      noServices: "Tarix hozircha bo‘sh",
      noServicesHint: "Avtomobilga birinchi xizmat yozuvini qo‘shing.",
      totalExpenses: "Xizmat xarajatlari",
      serviceCount: "Xizmatlar soni",
      nextService: "Keyingi xizmat",
      due: "Xizmat vaqti keldi",
      upcoming: "Yaqinda xizmat kerak",
      completed: "Tarix",
      saved: "Yozuv saqlandi",
      deleted: "Yozuv o‘chirildi",
      vehicleSaved: "Avtomobil saqlandi",
      invalid: "Ma'lumotlarni tekshiring.",
      error: "Xatolik",
      description: "Xarajat avtomatik ravishda Finance bo‘limiga tushadi.",
      currentMileage: "Masofa",
      noUpcoming: "Yaqin eslatmalar yo‘q",
      overdueDate: "Sana bo‘yicha muddati o‘tgan",
      overdueKm: "Masofa bo‘yicha muddati o‘tgan",
      leftKm: "Qoldi",
      leftDays: "Qolgan kun",
      free: "Xarajatsiz",
      fuelPropane: "Propan",
      fuelPetrol: "Benzin",
      fuelHybrid: "Gibrid",
      fuelElectric: "Elektr",
      all: "Barcha yozuvlar"
    }
  };

  function lang() {
    return localStorage.getItem("asad-os-language") === "uz"
      ? "uz" : "ru";
  }

  function t(key) {
    return words[lang()][key] || key;
  }

  function money(value, currency) {
    const formatted = new Intl.NumberFormat(
      currency === "UZS" ? "ru-RU" : "en-US",
      {
        maximumFractionDigits: currency === "UZS" ? 0 : 2,
        minimumFractionDigits: currency === "UZS" ? 0 : 2
      }
    ).format(Number(value) || 0);

    return currency === "UZS"
      ? formatted + " UZS"
      : "$" + formatted;
  }

  function showMoney(uzs, usd) {
    const selected =
      localStorage.getItem("asad-os-currency") || "BOTH";

    if (selected === "UZS") return money(uzs, "UZS");
    if (selected === "USD") return money(usd, "USD");

    return `
      <span>${money(uzs, "UZS")}</span>
      <small>${money(usd, "USD")}</small>
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

  function today() {
    const d = new Date();

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatDate(value) {
    if (!value) return "—";

    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }

  function categoryName(key) {
    return categories[key]?.[lang()] || key;
  }

  function getTotals() {
    const result = {
      UZS: 0,
      USD: 0
    };

    services.forEach(item => {
      result[item.currency] += Number(item.amount || 0);
    });

    return result;
  }

  function getReminderStatus(item) {
    const currentMileage = Number(vehicle?.mileage || 0);
    const currentDate = today();

    const dateDue =
      item.reminderDate && item.reminderDate <= currentDate;

    const kmDue =
      item.reminderKm !== null &&
      item.reminderKm !== undefined &&
      item.reminderKm !== "" &&
      currentMileage >= Number(item.reminderKm);

    if (dateDue || kmDue) {
      return {
        type: "overdue",
        label: dateDue ? t("overdueDate") : t("overdueKm")
      };
    }

    if (item.reminderDate) {
      const days = Math.ceil(
        (new Date(item.reminderDate + "T00:00:00") -
         new Date(currentDate + "T00:00:00")) / 86400000
      );

      if (days <= 30) {
        return {
          type: "upcoming",
          label: `${t("leftDays")}: ${days}`
        };
      }
    }

    if (item.reminderKm !== null &&
        item.reminderKm !== undefined &&
        item.reminderKm !== "") {
      const left = Number(item.reminderKm) - currentMileage;

      if (left <= 1000) {
        return {
          type: "upcoming",
          label: `${t("leftKm")}: ${left.toLocaleString("ru-RU")} km`
        };
      }
    }

    return null;
  }

  function renderVehicle() {
    const v = vehicle || {};

    return `
      <div class="garage-vehicle-card">

        <div class="garage-vehicle-top">
          <div class="garage-car-icon">🚘</div>

          <div>
            <p class="garage-label">${t("vehicle")}</p>
            <h3>${escapeHTML(v.brand || "Chevrolet")}
              ${escapeHTML(v.model || "Tracker 2")}</h3>
            <small>${escapeHTML(v.year || 2024)}</small>
          </div>
        </div>

        <form id="garageVehicleForm" class="garage-vehicle-form">

          <label class="finance-field">
            <span>${t("brand")}</span>
            <input id="garageBrand" maxlength="50"
              value="${escapeHTML(v.brand || "Chevrolet")}" required>
          </label>

          <label class="finance-field">
            <span>${t("model")}</span>
            <input id="garageModel" maxlength="50"
              value="${escapeHTML(v.model || "Tracker 2")}" required>
          </label>

          <label class="finance-field">
            <span>${t("year")}</span>
            <input id="garageYear" type="number"
              min="1950" max="2100"
              value="${Number(v.year || 2024)}" required>
          </label>

          <label class="finance-field">
            <span>${t("mileage")} (km)</span>
            <input id="garageMileage" type="number"
              min="0" step="1"
              value="${Number(v.mileage || 0)}" required>
          </label>

          <label class="finance-field">
            <span>${t("fuelType")}</span>
            <select id="garageFuel">
              <option value="Propane" ${v.fuel === "Propane" ? "selected" : ""}>${t("fuelPropane")}</option>
              <option value="Petrol" ${v.fuel === "Petrol" ? "selected" : ""}>${t("fuelPetrol")}</option>
              <option value="Hybrid" ${v.fuel === "Hybrid" ? "selected" : ""}>${t("fuelHybrid")}</option>
              <option value="Electric" ${v.fuel === "Electric" ? "selected" : ""}>${t("fuelElectric")}</option>
            </select>
          </label>

          <div class="garage-vehicle-save">
            <button type="submit" class="finance-save">
              ${t("saveVehicle")}
            </button>
          </div>

        </form>
      </div>
    `;
  }

  function renderSummary() {
    const totals = getTotals();

    return `
      <div class="garage-summary">

        <div class="garage-stat-card">
          <span>💰 ${t("totalExpenses")}</span>
          <strong>${showMoney(totals.UZS, totals.USD)}</strong>
        </div>

        <div class="garage-stat-card">
          <span>🔧 ${t("serviceCount")}</span>
          <strong>${services.length}</strong>
        </div>

        <div class="garage-stat-card">
          <span>🛞 ${t("currentMileage")}</span>
          <strong>${Number(vehicle?.mileage || 0).toLocaleString("ru-RU")} km</strong>
        </div>

      </div>
    `;
  }

  function renderReminders() {
    const reminders = services
      .map(item => ({
        item,
        status: getReminderStatus(item)
      }))
      .filter(entry => entry.status)
      .sort((a, b) =>
        (a.item.reminderDate || "9999-99-99")
          .localeCompare(b.item.reminderDate || "9999-99-99")
      );

    if (!reminders.length) {
      return `
        <div class="garage-reminder-empty">
          <span>✓</span>
          ${t("noUpcoming")}
        </div>
      `;
    }

    return `
      <div class="garage-reminders">
        ${reminders.map(({ item, status }) => `
          <div class="garage-reminder ${status.type}">
            <div>
              <strong>${escapeHTML(item.title)}</strong>
              <small>${categoryName(item.category)}</small>
            </div>
            <span>${status.label}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderServices() {
    if (!services.length) {
      return `
        <div class="finance-empty">
          <div class="empty-icon large">⚙</div>
          <h3>${t("noServices")}</h3>
          <p>${t("noServicesHint")}</p>
        </div>
      `;
    }

    return `
      <div class="finance-table-wrap">
        <table class="finance-table garage-table">
          <thead>
            <tr>
              <th>${t("date")}</th>
              <th>${t("category")}</th>
              <th>${t("serviceName")}</th>
              <th>${t("currentMileage")}</th>
              <th>${t("amount")}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${services.map(item => {
              const status = getReminderStatus(item);

              return `
                <tr>
                  <td>${formatDate(item.date)}</td>

                  <td>
                    <span class="garage-category">
                      ${categories[item.category]?.icon || "🔧"}
                      ${categoryName(item.category)}
                    </span>
                  </td>

                  <td>
                    <strong>${escapeHTML(item.title)}</strong>
                    ${item.notes ? `
                      <small class="garage-row-note">
                        ${escapeHTML(item.notes)}
                      </small>
                    ` : ""}
                    ${status ? `
                      <small class="garage-status ${status.type}">
                        ${status.label}
                      </small>
                    ` : ""}
                  </td>

                  <td>${Number(item.mileage).toLocaleString("ru-RU")} km</td>

                  <td class="finance-amount expense">
                    ${Number(item.amount) > 0
                      ? money(item.amount, item.currency)
                      : t("free")}
                  </td>

                  <td>
                    <div class="finance-row-actions">
                      <button type="button"
                        data-garage-action="edit"
                        data-id="${item.id}">✎</button>

                      <button type="button"
                        data-garage-action="delete"
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

  function renderForm() {
    if (!formOpen) return "";

    const old = editingId === null
      ? null
      : services.find(item => item.id === editingId);

    return `
      <div class="finance-form-overlay"
        data-garage-action="overlay">

        <div class="finance-form-modal garage-form">

          <div class="finance-form-heading">
            <div>
              <h3>${old ? t("editTitle") : t("newTitle")}</h3>
              <p>${t("description")}</p>
            </div>

            <button type="button" class="finance-close"
              data-garage-action="close">×</button>
          </div>

          <form id="garageServiceForm">

            <div class="finance-form-grid">

              <label class="finance-field">
                <span>${t("date")}</span>
                <input type="date" id="serviceDate"
                  value="${old?.date || today()}" required>
              </label>

              <label class="finance-field">
                <span>${t("category")}</span>
                <select id="serviceCategory">
                  ${Object.entries(categories).map(([key, item]) => `
                    <option value="${key}"
                      ${old?.category === key ? "selected" : ""}>
                      ${item[lang()]}
                    </option>
                  `).join("")}
                </select>
              </label>

              <label class="finance-field full">
                <span>${t("serviceName")}</span>
                <input id="serviceTitle" maxlength="100"
                  value="${escapeHTML(old?.title || "")}"
                  placeholder="${lang() === "uz" ? "Masalan: Moy almashtirish" : "Например: Замена масла"}"
                  required>
              </label>

              <label class="finance-field">
                <span>${t("currentMileage")} (km)</span>
                <input type="number" id="serviceMileage"
                  min="0" step="1"
                  value="${old?.mileage ?? vehicle?.mileage ?? 0}"
                  required>
              </label>

              <label class="finance-field">
                <span>${t("amount")}</span>
                <input type="number" id="serviceAmount"
                  min="0" step="any"
                  value="${old?.amount ?? 0}">
              </label>

              <label class="finance-field">
                <span>${t("currency")}</span>
                <select id="serviceCurrency">
                  <option value="UZS"
                    ${old?.currency !== "USD" ? "selected" : ""}>
                    UZS — So‘m
                  </option>
                  <option value="USD"
                    ${old?.currency === "USD" ? "selected" : ""}>
                    USD — Dollar
                  </option>
                </select>
              </label>

              <label class="finance-field">
                <span>${t("reminderDate")}</span>
                <input type="date" id="serviceReminderDate"
                  value="${old?.reminderDate || ""}">
              </label>

              <label class="finance-field">
                <span>${t("reminderKm")} (km)</span>
                <input type="number" id="serviceReminderKm"
                  min="0" step="1"
                  value="${old?.reminderKm ?? ""}"
                  placeholder="Например: 150000">
              </label>

              <label class="finance-field full">
                <span>${t("notes")}</span>
                <textarea id="serviceNotes"
                  maxlength="250" rows="3">${escapeHTML(old?.notes || "")}</textarea>
              </label>

            </div>

            <div class="finance-form-actions">
              <button type="button" class="finance-cancel"
                data-garage-action="close">
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

  function render() {
    const panel = $("modulePanel");
    if (!panel) return;

    panel.className = "panel garage-workspace";

    panel.innerHTML = `
      <div class="garage-toolbar">
        <div>
          <h3>${t("title")}</h3>
          <p>${t("subtitle")}</p>
        </div>

        <button class="finance-add-button"
          data-garage-action="add">
          + ${t("add")}
        </button>
      </div>

      ${renderVehicle()}

      ${renderSummary()}

      <div class="garage-reminder-section">
        <h3>🔔 ${t("nextService")}</h3>
        ${renderReminders()}
      </div>

      <div class="garage-history">
        <div class="garage-history-heading">
          <h3>${t("services")}</h3>
          <span>${services.length}</span>
        </div>

        ${renderServices()}
      </div>

      ${renderForm()}
    `;
  }

  async function refresh() {
    const [serviceItems, vehicleData] = await Promise.all([
      DB.getGarageServices(),
      DB.getGarageVehicle()
    ]);

    services = serviceItems;
    vehicle = vehicleData;

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

  async function saveVehicle(form) {
    const data = {
      brand: $("garageBrand").value.trim(),
      model: $("garageModel").value.trim(),
      year: Number($("garageYear").value),
      mileage: Number($("garageMileage").value),
      fuel: $("garageFuel").value
    };

    try {
      await DB.saveGarageVehicle(data);
      await refresh();

      window.showToast(t("vehicleSaved"), "success");
    } catch (error) {
      console.error(error);
      window.showToast(t("error") + ": " + error.message, "error");
    }
  }

  async function saveService() {
    const data = {
      date: $("serviceDate").value,
      category: $("serviceCategory").value,
      title: $("serviceTitle").value.trim(),
      mileage: Number($("serviceMileage").value),
      amount: Number($("serviceAmount").value || 0),
      currency: $("serviceCurrency").value,
      reminderDate: $("serviceReminderDate").value || "",
      reminderKm: $("serviceReminderKm").value || null,
      notes: $("serviceNotes").value.trim()
    };

    try {
      if (
        !data.date ||
        !data.title ||
        !Number.isFinite(data.mileage) ||
        data.mileage < 0 ||
        !Number.isFinite(data.amount) ||
        data.amount < 0
      ) {
        throw new Error(t("invalid"));
      }

      if (editingId !== null) {
        await DB.updateGarageService(editingId, data);
      } else {
        await DB.addGarageService(data);
      }

      const currentMileage = Number(vehicle?.mileage || 0);

      if (data.mileage > currentMileage) {
        await DB.saveGarageVehicle({
          ...vehicle,
          mileage: data.mileage
        });
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
    const page = $("otherPage");

    if (!page || !page.contains(event.target)) return;

    const button = event.target.closest("[data-garage-action]");
    if (!button) return;

    const action = button.dataset.garageAction;

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
      openForm(button.dataset.id);
      return;
    }

    if (action === "delete") {
      if (!confirm(t("confirmDelete"))) return;

      try {
        await DB.deleteGarageService(button.dataset.id);
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
    if (event.target.id === "garageServiceForm") {
      event.preventDefault();
      saveService();
    }

    if (event.target.id === "garageVehicleForm") {
      event.preventDefault();
      saveVehicle(event.target);
    }
  });

  window.ASADGarage = {
    render,
    refresh,
    openForm
  };

})();
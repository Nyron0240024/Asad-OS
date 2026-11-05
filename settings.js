/* =========================================
   ASAD OS — SETTINGS 2.0
   Backup & Restore
========================================= */

(() => {
  "use strict";

  const DB = window.ASADDatabase;

  const $ = id => document.getElementById(id);

  function showMessage(message, type = "success") {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }

  function createBackupPanel() {
    const wrapper = document.createElement("section");

    wrapper.className = "settings-backup-section";

    wrapper.innerHTML = `
      <div class="settings-section-heading">
        <div>
          <span class="settings-section-label">DATA MANAGEMENT</span>
          <h3>Резервное копирование</h3>
          <p>Сохраняй и восстанавливай данные ASAD OS.</p>
        </div>
        <div class="settings-section-icon">▤</div>
      </div>

      <div class="backup-info">
        <strong>Что входит в резервную копию?</strong>
        <p>Финансы, задачи, цели, автомобиль и смены такси.</p>
        <small>Файл хранится на твоём устройстве. Никакие данные на сервер не отправляются.</small>
      </div>

      <div class="backup-actions">
        <button type="button" class="backup-button primary" id="createBackupButton">
          <span>↓</span>
          Скачать резервную копию
        </button>

        <button type="button" class="backup-button secondary" id="selectBackupButton">
          <span>↑</span>
          Восстановить из файла
        </button>

        <input
          type="file"
          id="backupFileInput"
          accept=".json,application/json"
          hidden
        />
      </div>

      <div class="backup-restore-options" id="backupRestoreOptions" hidden>
        <div class="backup-info">
          <strong>Выбери способ восстановления</strong>
          <p>Объединение сохранит текущие записи. Замена очистит текущие записи в пяти хранилищах и загрузит данные из файла.</p>
        </div>

        <button type="button" class="backup-button primary" id="mergeBackupButton">
          Объединить данные
        </button>

        <button type="button" class="backup-button danger" id="replaceBackupButton">
          Заменить текущие данные
        </button>

        <button type="button" class="backup-button secondary" id="cancelRestoreButton">
          Отмена
        </button>
      </div>

      <div class="backup-status" id="backupStatus">
        Рекомендуется периодически сохранять резервную копию.
      </div>
    `;

    return wrapper;
  }

  let selectedBackup = null;

  async function createBackup() {
    const button = $("createBackupButton");

    try {
      button.disabled = true;
      button.textContent = "Создаём копию...";

      const backup = await DB.exportData();

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `ASAD-OS-backup-${date}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      $("backupStatus").textContent =
        "Резервная копия успешно создана и скачана.";

      showMessage("Резервная копия скачана!");

    } catch (error) {
      console.error("Backup error:", error);
      showMessage("Не удалось создать копию: " + error.message, "error");
    } finally {
      button.disabled = false;
      button.innerHTML = "<span>↓</span> Скачать резервную копию";
    }
  }

  async function readBackupFile(file) {
    if (!file) return;

    try {
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("Файл слишком большой. Максимальный размер — 50 МБ.");
      }

      const content = await file.text();
      const backup = JSON.parse(content);

      if (
        !backup ||
        backup.application !== "ASAD OS" ||
        backup.formatVersion !== 1 ||
        !backup.data ||
        typeof backup.data !== "object"
      ) {
        throw new Error("Это не резервная копия ASAD OS.");
      }

      const stores = [
        "transactions",
        "tasks",
        "goals",
        "garage",
        "trips"
      ];

      for (const store of stores) {
        if (!Array.isArray(backup.data[store])) {
          throw new Error("В резервной копии отсутствует раздел: " + store);
        }
      }

      selectedBackup = backup;

      const total = stores.reduce(
        (sum, store) => sum + backup.data[store].length,
        0
      );

      $("backupStatus").textContent =
        `Файл проверен. Найдено записей: ${total}. Выбери способ восстановления.`;

      $("backupRestoreOptions").hidden = false;

      showMessage("Резервная копия проверена.");

    } catch (error) {
      selectedBackup = null;
      $("backupRestoreOptions").hidden = true;

      console.error("Restore file error:", error);
      showMessage("Ошибка файла: " + error.message, "error");
    }
  }

  async function restoreBackup(mode) {
    if (!selectedBackup) {
      showMessage("Сначала выбери файл резервной копии.", "error");
      return;
    }

    if (mode === "replace") {
      const confirmed = confirm(
        "ВНИМАНИЕ!\n\n" +
        "Текущие данные в пяти разделах будут заменены содержимым резервной копии.\n\n" +
        "Перед продолжением убедись, что у тебя есть свежая резервная копия текущих данных.\n\n" +
        "Продолжить?"
      );

      if (!confirmed) return;
    }

    const buttons = [
      $("mergeBackupButton"),
      $("replaceBackupButton"),
      $("cancelRestoreButton")
    ];

    buttons.forEach(button => button.disabled = true);

    try {
      await DB.importData(selectedBackup, mode);

      selectedBackup = null;

      $("backupRestoreOptions").hidden = true;
      $("backupFileInput").value = "";

      $("backupStatus").textContent =
        mode === "merge"
          ? "Данные успешно объединены."
          : "Данные успешно восстановлены из резервной копии.";

      showMessage(
        mode === "merge"
          ? "Данные объединены!"
          : "Резервная копия восстановлена!"
      );

      if (window.ASADDashboard) {
        await window.ASADDashboard.refresh();
      }

    } catch (error) {
      console.error("Restore error:", error);
      showMessage("Ошибка восстановления: " + error.message, "error");
    } finally {
      buttons.forEach(button => button.disabled = false);
    }
  }

  async function refresh() {
    const panel = $("modulePanel");

    if (!panel) return;

    if (panel.querySelector(".settings-backup-section")) return;

    const backupPanel = createBackupPanel();

    panel.appendChild(backupPanel);

    $("createBackupButton").addEventListener("click", createBackup);

    $("selectBackupButton").addEventListener("click", () => {
      $("backupFileInput").click();
    });

    $("backupFileInput").addEventListener("change", event => {
      const file = event.target.files[0];
      readBackupFile(file);
    });

    $("mergeBackupButton").addEventListener("click", () => {
      restoreBackup("merge");
    });

    $("replaceBackupButton").addEventListener("click", () => {
      restoreBackup("replace");
    });

    $("cancelRestoreButton").addEventListener("click", () => {
      selectedBackup = null;
      $("backupRestoreOptions").hidden = true;
      $("backupFileInput").value = "";
      $("backupStatus").textContent = "Восстановление отменено.";
    });
  }

  window.ASADSettings = { refresh };

})();
/* =========================================
   ASAD OS — DATABASE ENGINE
   Version 1 — Existing data preserved
========================================= */

(() => {
  "use strict";

  const NAME = "ASAD_OS_DATABASE";
  const VERSION = 1;

  const STORES = [
    "transactions",
    "tasks",
    "goals",
    "garage",
    "trips"
  ];

  let db = null;
  let opening = null;

  function open() {
    if (db) return Promise.resolve(db);
    if (opening) return opening;

    opening = new Promise((resolve, reject) => {
      const request = indexedDB.open(NAME, VERSION);

      request.onupgradeneeded = event => {
        const database = event.target.result;

        STORES.forEach(name => {
          if (!database.objectStoreNames.contains(name)) {
            database.createObjectStore(name, {
              keyPath: "id",
              autoIncrement: true
            });
          }
        });
      };

      request.onsuccess = () => {
        db = request.result;

        db.onversionchange = () => {
          db.close();
          db = null;
          opening = null;
        };

        resolve(db);
      };

      request.onerror = () => {
        opening = null;
        reject(request.error);
      };

      request.onblocked = () => {
        opening = null;
        reject(new Error("Close other ASAD OS tabs and reload."));
      };
    });

    return opening;
  }

  function validDate(value) {
    if (typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(value + "T00:00:00");

    return !Number.isNaN(date.getTime()) &&
      date.getFullYear() === Number(value.slice(0, 4)) &&
      date.getMonth() + 1 === Number(value.slice(5, 7)) &&
      date.getDate() === Number(value.slice(8, 10));
  }

  function validateTransaction(item) {
    if (!item ||
        !["income", "expense"].includes(item.type) ||
        !Number.isFinite(Number(item.amount)) ||
        Number(item.amount) <= 0 ||
        !["UZS", "USD"].includes(item.currency) ||
        typeof item.category !== "string" ||
        !item.category.trim() ||
        !validDate(item.date) ||
        typeof (item.description || "") !== "string" ||
        (item.description || "").length > 150) {
      throw new Error("Invalid financial transaction.");
    }
  }

  function validateShift(data) {
    if (!validDate(data.date)) {
      throw new Error("Invalid shift date.");
    }

    if (!["UZS", "USD"].includes(data.currency)) {
      throw new Error("Invalid currency.");
    }

    for (const field of ["income", "km", "fuelCost", "otherCost"]) {
      const number = Number(data[field] ?? 0);

      if (!Number.isFinite(number) || number < 0) {
        throw new Error("Invalid " + field);
      }
    }

    if (Number(data.income) <= 0) {
      throw new Error("Income must be greater than zero.");
    }

    if (!Number.isInteger(Number(data.orders ?? 0)) ||
        Number(data.orders ?? 0) < 0) {
      throw new Error("Invalid order count.");
    }

    if (typeof (data.notes || "") !== "string" ||
        (data.notes || "").length > 150) {
      throw new Error("Invalid notes.");
    }
  }

  function record(type, amount, currency, category, date, description) {
    return {
      type,
      amount: Number(amount),
      currency,
      category,
      date,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function getAll(storeName) {
    return open().then(database => new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, "readonly");
      const request = tx.objectStore(storeName).getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }));
  }

  function get(storeName, id) {
    return open().then(database => new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, "readonly");
      const request = tx.objectStore(storeName).get(Number(id));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }));
  }

  function add(storeName, data) {
    return open().then(database => new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, "readwrite");
      const request = tx.objectStore(storeName).add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }));
  }

  function put(storeName, data) {
    return open().then(database => new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, "readwrite");
      const request = tx.objectStore(storeName).put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }));
  }

  function remove(storeName, id) {
    return open().then(database => new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, "readwrite");
      const request = tx.objectStore(storeName).delete(Number(id));

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    }));
  }

  async function addTransaction(data) {
    const item = {
      ...data,
      amount: Number(data.amount),
      description: data.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    validateTransaction(item);

    return add("transactions", item);
  }

  async function updateTransaction(id, data) {
    const old = await get("transactions", id);

    if (!old) throw new Error("Transaction not found.");

    const updated = {
      ...old,
      ...data,
      id: Number(id),
      amount: Number(data.amount),
      updatedAt: new Date().toISOString()
    };

    validateTransaction(updated);

    return put("transactions", updated);
  }

  async function deleteTransaction(id) {
    return remove("transactions", id);
  }

  async function getTransactions() {
    const items = await getAll("transactions");

    return items.sort((a, b) =>
      b.date.localeCompare(a.date) || b.id - a.id
    );
  }

  async function getTrips() {
    const items = await getAll("trips");

    return items.sort((a, b) =>
      b.date.localeCompare(a.date) || b.id - a.id
    );
  }

  /*
    Atomic shift saving:
    - Taxi income
    - Fuel expense
    - Other expense
    - Shift record

    All saved together or none saved.
  */

  async function addDriverShift(data) {
    validateShift(data);

    const database = await open();

    return new Promise((resolve, reject) => {
      const tx = database.transaction(
        ["transactions", "trips"],
        "readwrite"
      );

      const transactions = tx.objectStore("transactions");
      const trips = tx.objectStore("trips");

      const shift = {
        ...data,
        income: Number(data.income),
        km: Number(data.km || 0),
        orders: Number(data.orders || 0),
        fuelCost: Number(data.fuelCost || 0),
        otherCost: Number(data.otherCost || 0),
        createdAt: new Date().toISOString()
      };

      let incomeId;
      let fuelId = null;
      let otherId = null;

      let pending = 1 +
        (shift.fuelCost > 0 ? 1 : 0) +
        (shift.otherCost > 0 ? 1 : 0);

      function finish() {
        pending--;

        if (pending !== 0) return;

        trips.add({
          ...shift,
          incomeTransactionId: incomeId,
          fuelTransactionId: fuelId,
          otherTransactionId: otherId
        });
      }

      const income = transactions.add(
        record("income", shift.income, shift.currency,
          "taxi", shift.date, "Yandex Taxi — shift")
      );

      income.onsuccess = () => {
        incomeId = income.result;
        finish();
      };

      if (shift.fuelCost > 0) {
        const fuel = transactions.add(
          record("expense", shift.fuelCost, shift.currency,
            "fuel", shift.date, "Yandex Taxi — fuel")
        );

        fuel.onsuccess = () => {
          fuelId = fuel.result;
          finish();
        };
      }

      if (shift.otherCost > 0) {
        const other = transactions.add(
          record("expense", shift.otherCost, shift.currency,
            "car", shift.date, "Yandex Taxi — other expenses")
        );

        other.onsuccess = () => {
          otherId = other.result;
          finish();
        };
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Shift save failed."));
    });
  }

  async function updateDriverShift(id, data) {
    validateShift(data);

    const database = await open();

    return new Promise((resolve, reject) => {
      const tx = database.transaction(
        ["transactions", "trips"],
        "readwrite"
      );

      const transactions = tx.objectStore("transactions");
      const trips = tx.objectStore("trips");

      const request = trips.get(Number(id));

      request.onsuccess = () => {
        const old = request.result;

        if (!old) {
          tx.abort();
          return;
        }

        if (old.incomeTransactionId) {
          transactions.delete(old.incomeTransactionId);
        }

        if (old.fuelTransactionId) {
          transactions.delete(old.fuelTransactionId);
        }

        if (old.otherTransactionId) {
          transactions.delete(old.otherTransactionId);
        }

        const shift = {
          ...old,
          ...data,
          id: Number(id),
          income: Number(data.income),
          km: Number(data.km || 0),
          orders: Number(data.orders || 0),
          fuelCost: Number(data.fuelCost || 0),
          otherCost: Number(data.otherCost || 0),
          updatedAt: new Date().toISOString()
        };

        let incomeId;
        let fuelId = null;
        let otherId = null;

        let pending = 1 +
          (shift.fuelCost > 0 ? 1 : 0) +
          (shift.otherCost > 0 ? 1 : 0);

        function finish() {
          pending--;

          if (pending !== 0) return;

          trips.put({
            ...shift,
            incomeTransactionId: incomeId,
            fuelTransactionId: fuelId,
            otherTransactionId: otherId
          });
        }

        const income = transactions.add(
          record("income", shift.income, shift.currency,
            "taxi", shift.date, "Yandex Taxi — shift")
        );

        income.onsuccess = () => {
          incomeId = income.result;
          finish();
        };

        if (shift.fuelCost > 0) {
          const fuel = transactions.add(
            record("expense", shift.fuelCost, shift.currency,
              "fuel", shift.date, "Yandex Taxi — fuel")
          );

          fuel.onsuccess = () => {
            fuelId = fuel.result;
            finish();
          };
        }

        if (shift.otherCost > 0) {
          const other = transactions.add(
            record("expense", shift.otherCost, shift.currency,
              "car", shift.date, "Yandex Taxi — other expenses")
          );

          other.onsuccess = () => {
            otherId = other.result;
            finish();
          };
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Shift update failed."));
    });
  }

  async function deleteDriverShift(id) {
    const database = await open();

    return new Promise((resolve, reject) => {
      const tx = database.transaction(
        ["transactions", "trips"],
        "readwrite"
      );

      const transactions = tx.objectStore("transactions");
      const trips = tx.objectStore("trips");

      const request = trips.get(Number(id));

      request.onsuccess = () => {
        const shift = request.result;

        if (!shift) {
          tx.abort();
          return;
        }

        if (shift.incomeTransactionId) {
          transactions.delete(shift.incomeTransactionId);
        }

        if (shift.fuelTransactionId) {
          transactions.delete(shift.fuelTransactionId);
        }

        if (shift.otherTransactionId) {
          transactions.delete(shift.otherTransactionId);
        }

        trips.delete(Number(id));
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Shift deletion failed."));
    });
  }

    // =========================================
  // GARAGE MANAGER
  // =========================================

  function validateGarageService(data) {
    if (!validDate(data.date)) {
      throw new Error("Invalid service date.");
    }

    if (typeof data.title !== "string" ||
        !data.title.trim() ||
        data.title.length > 100) {
      throw new Error("Invalid service title.");
    }

    if (!Number.isFinite(Number(data.mileage)) ||
        Number(data.mileage) < 0) {
      throw new Error("Invalid mileage.");
    }

    if (!Number.isFinite(Number(data.amount)) ||
        Number(data.amount) < 0) {
      throw new Error("Invalid service amount.");
    }

    if (!["UZS", "USD"].includes(data.currency)) {
      throw new Error("Invalid currency.");
    }

    if (data.reminderDate && !validDate(data.reminderDate)) {
      throw new Error("Invalid reminder date.");
    }

    if (data.reminderKm !== "" &&
        data.reminderKm !== null &&
        data.reminderKm !== undefined &&
        (!Number.isFinite(Number(data.reminderKm)) ||
         Number(data.reminderKm) < 0)) {
      throw new Error("Invalid reminder mileage.");
    }

    if (typeof (data.notes || "") !== "string" ||
        (data.notes || "").length > 250) {
      throw new Error("Invalid service notes.");
    }
  }

  function garageTransaction(data) {
    return {
      type: "expense",
      amount: Number(data.amount),
      currency: data.currency,
      category: "car",
      date: data.date,
      description: ("Авто: " + data.title).slice(0, 150),
      source: "garage",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async function getGarageServices() {
    const items = await getAll("garage");

    return items
      .filter(item => item.type === "service")
      .sort((a, b) =>
        b.date.localeCompare(a.date) || b.id - a.id
      );
  }

  async function getGarageVehicle() {
    const item = await get("garage", 0);

    return item || {
      id: 0,
      type: "vehicle",
      brand: "Chevrolet",
      model: "Tracker 2",
      year: 2024,
      mileage: 0,
      fuel: "Propane"
    };
  }

  async function saveGarageVehicle(data) {
    const vehicle = {
      id: 0,
      type: "vehicle",
      brand: String(data.brand || "Chevrolet").slice(0, 50),
      model: String(data.model || "Tracker 2").slice(0, 50),
      year: Number(data.year) || 2024,
      mileage: Number(data.mileage) || 0,
      fuel: String(data.fuel || "Propane").slice(0, 50),
      updatedAt: new Date().toISOString()
    };

    if (!Number.isFinite(vehicle.mileage) || vehicle.mileage < 0) {
      throw new Error("Invalid vehicle mileage.");
    }

    if (vehicle.year < 1950 || vehicle.year > 2100) {
      throw new Error("Invalid vehicle year.");
    }

    return put("garage", vehicle);
  }

  async function addGarageService(data) {
    validateGarageService(data);

    const database = await open();

    return new Promise((resolve, reject) => {
      const tx = database.transaction(
        ["garage", "transactions"],
        "readwrite"
      );

      const garage = tx.objectStore("garage");
      const transactions = tx.objectStore("transactions");

      const service = {
        ...data,
        type: "service",
        title: data.title.trim(),
        mileage: Number(data.mileage),
        amount: Number(data.amount),
        reminderKm:
          data.reminderKm === "" ||
          data.reminderKm === null ||
          data.reminderKm === undefined
            ? null
            : Number(data.reminderKm),
        notes: data.notes || "",
        createdAt: new Date().toISOString()
      };

      function saveService(transactionId = null) {
        service.transactionId = transactionId;

        const request = garage.add(service);

        request.onsuccess = () => {
          service.id = request.result;
        };
      }

      if (service.amount > 0) {
        const request = transactions.add(garageTransaction(service));

        request.onsuccess = () => {
          saveService(request.result);
        };
      } else {
        saveService();
      }

      tx.oncomplete = () => resolve(service.id);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(
        tx.error || new Error("Garage service save failed.")
      );
    });
  }

  async function updateGarageService(id, data) {
    validateGarageService(data);

    const database = await open();

    return new Promise((resolve, reject) => {
      const tx = database.transaction(
        ["garage", "transactions"],
        "readwrite"
      );

      const garage = tx.objectStore("garage");
      const transactions = tx.objectStore("transactions");

      const request = garage.get(Number(id));

      request.onsuccess = () => {
        const old = request.result;

        if (!old || old.type !== "service") {
          tx.abort();
          return;
        }

        if (old.transactionId) {
          transactions.delete(old.transactionId);
        }

        const service = {
          ...old,
          ...data,
          id: Number(id),
          type: "service",
          title: data.title.trim(),
          mileage: Number(data.mileage),
          amount: Number(data.amount),
          reminderKm:
            data.reminderKm === "" ||
            data.reminderKm === null ||
            data.reminderKm === undefined
              ? null
              : Number(data.reminderKm),
          notes: data.notes || "",
          updatedAt: new Date().toISOString(),
          transactionId: null
        };

        function saveService(transactionId = null) {
          service.transactionId = transactionId;
          garage.put(service);
        }

        if (service.amount > 0) {
          const transaction = transactions.add(
            garageTransaction(service)
          );

          transaction.onsuccess = () => {
            saveService(transaction.result);
          };
        } else {
          saveService();
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(
        tx.error || new Error("Garage service update failed.")
      );
    });
  }

  async function deleteGarageService(id) {
    const database = await open();

    return new Promise((resolve, reject) => {
      const tx = database.transaction(
        ["garage", "transactions"],
        "readwrite"
      );

      const garage = tx.objectStore("garage");
      const transactions = tx.objectStore("transactions");

      const request = garage.get(Number(id));

      request.onsuccess = () => {
        const service = request.result;

        if (!service || service.type !== "service") {
          tx.abort();
          return;
        }

        if (service.transactionId) {
          transactions.delete(service.transactionId);
        }

        garage.delete(Number(id));
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(
        tx.error || new Error("Garage service deletion failed.")
      );
    });
  }

  async function exportData() {
    const data = {};

    for (const name of STORES) {
      data[name] = await getAll(name);
    }

    return {
      application: "ASAD OS",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      data
    };
  }

  async function importData(backup, mode = "replace") {
    if (
      !backup ||
      backup.application !== "ASAD OS" ||
      backup.formatVersion !== 1 ||
      !backup.data
    ) {
      throw new Error("Invalid ASAD OS backup.");
    }

    for (const name of STORES) {
      if (!Array.isArray(backup.data[name]) ||
          backup.data[name].length > 100000) {
        throw new Error("Invalid backup data: " + name);
      }
    }

    backup.data.transactions.forEach(validateTransaction);

    const database = await open();

    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORES, "readwrite");

      for (const name of STORES) {
        const store = tx.objectStore(name);

        if (mode === "replace") {
          store.clear();

          backup.data[name].forEach(item => store.put(item));
        } else {
          backup.data[name].forEach(item => {
            const copy = { ...item };
            delete copy.id;
            store.add(copy);
          });
        }
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  window.ASADDatabase = {
        getGarageServices,
    getGarageVehicle,
    saveGarageVehicle,
    addGarageService,
    updateGarageService,
    deleteGarageService,
    open,
    getAll,
    get,
    add,
    put,
    remove,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactions,
    getTrips,
    addDriverShift,
    updateDriverShift,
    deleteDriverShift,
    exportData,
    importData
  };

})();
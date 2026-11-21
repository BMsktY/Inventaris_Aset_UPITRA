(() => {
  const statusElement = document.getElementById("summary-status");
  const valueElement = document.getElementById("progress-value");
  const trackElement = document.getElementById("progress-track");
  const fillElement = document.getElementById("progress-fill");
  const noteElement = document.getElementById("progress-note");
  const listElement = document.getElementById("check-list");
  const checkedElement = document.getElementById("last-checked");
  const refreshButton = document.getElementById("refresh-button");

  function renderError(error) {
    statusElement.textContent = `Pemeriksaan gagal: ${error.message}`;
    valueElement.textContent = "—";
    trackElement.setAttribute("aria-valuenow", "0");
    fillElement.style.width = "0%";
    noteElement.textContent = "Pastikan server API sedang berjalan, lalu periksa kembali.";
    listElement.replaceChildren();
    const item = document.createElement("p");
    item.className = "loading";
    item.textContent = "Status integrasi belum dapat dimuat.";
    listElement.append(item);
    checkedElement.textContent = "";
  }

  function renderProgress(progress) {
    statusElement.textContent = progress.status === "ready"
      ? `${progress.completed} dari ${progress.total} komponen siap`
      : `${progress.completed} dari ${progress.total} komponen siap; ada yang perlu diperiksa`;
    valueElement.textContent = `${progress.percentage}%`;
    trackElement.setAttribute("aria-valuenow", String(progress.percentage));
    fillElement.style.width = `${progress.percentage}%`;
    noteElement.textContent = progress.note;
    listElement.replaceChildren();

    progress.checks.forEach((check) => {
      const item = document.createElement("article");
      item.className = "check-item";
      const detail = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = check.label;
      const description = document.createElement("p");
      description.textContent = check.description;
      const badge = document.createElement("span");
      badge.className = `check-status${check.status === "ready" ? "" : " incomplete"}`;
      badge.textContent = check.status === "ready" ? "Siap" : "Perlu diperiksa";
      detail.append(title, description);
      item.append(detail, badge);
      listElement.append(item);
    });

    checkedElement.textContent = `Diperiksa: ${new Date().toLocaleString("id-ID")}`;
  }

  async function staticServerProgress() {
    const resourceExists = async (url) => {
      const response = await fetch(url, { cache: "no-store" });
      return response.ok;
    };
    const [webReady, sdkReady, syncReady, configResponse] = await Promise.all([
      Promise.all(["/index.html", "/js/app.js"].map(resourceExists)).then((results) => results.every(Boolean)),
      resourceExists("/js/firebase-sdk.js"),
      resourceExists("/js/sync-service.js"),
      fetch("/js/firebase-config.js", { cache: "no-store" })
    ]);
    const configSource = configResponse.ok ? await configResponse.text() : "";
    const configReady = ["apiKey", "authDomain", "projectId", "storageBucket", "appId"]
      .every((key) => new RegExp(`${key}:\\s*"[^"\\s]+"`).test(configSource));
    const firebaseReady = sdkReady && syncReady && configReady;
    const checks = [
      {
        id: "web",
        label: "Aplikasi web",
        description: "Halaman dan logika inventaris dapat dimuat.",
        status: webReady ? "ready" : "incomplete"
      },
      {
        id: "firebase",
        label: "Firebase dan sinkronisasi",
        description: "SDK, konfigurasi, dan layanan sinkronisasi tersedia di web.",
        status: firebaseReady ? "ready" : "incomplete"
      },
      {
        id: "api",
        label: "API pemantauan",
        description: "Jalankan npm start untuk memeriksa endpoint API.",
        status: "incomplete"
      },
      {
        id: "cordova",
        label: "Cordova Android",
        description: "Kesiapan Android harus diperiksa melalui Cordova CLI.",
        status: "incomplete"
      }
    ];
    const completed = checks.filter((check) => check.status === "ready").length;
    return {
      status: "incomplete",
      completed,
      total: checks.length,
      percentage: Math.round((completed / checks.length) * 100),
      checks,
      note: "Server statis tidak menjalankan API. Gunakan npm start untuk pemeriksaan API; koneksi Firebase tetap diverifikasi setelah login."
    };
  }

  async function loadProgress() {
    refreshButton.disabled = true;
    refreshButton.textContent = "Memeriksa…";
    try {
      const response = await fetch("/api/progress", { cache: "no-store" });
      let result;
      try {
        result = await response.json();
      } catch (error) {
        result = null;
      }
      if (!result || !Array.isArray(result.checks)) result = await staticServerProgress();
      renderProgress(result);
    } catch (error) {
      renderError(error);
    } finally {
      refreshButton.disabled = false;
      refreshButton.textContent = "Periksa lagi";
    }
  }

  refreshButton.addEventListener("click", loadProgress);
  loadProgress();
})();

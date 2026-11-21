const BUILDINGS = [
  "Gedung 1",
  "Gedung 2",
  "Gedung 3",
  "Gedung 4",
  "Gedung 5",
  "Gedung 6",
  "Gedung 7"
];

const SAMPLE_ASSETS = [
  { id: "asset-001", id_barang: "PRYT.MFHL.01", kode: "INV.SRPS.61.213.0226.PRYT.MFHL.0001", nama_barang: "Proyektor", kat: "61 - Fixed Assets Installation (DC)", qty: 1, biro: "Sarana dan Prasarana", tanggal_pembelian: "2026-02-15", gedung: "Gedung 6", lokasi: "Gedung 6 · Lantai 1", ruangan: "Multi Function Hall", area_penempatan: "Multi Function Hall", status: "Baik", foto_barang: "", scanHistory: [{ scannedBy: "Bima Sakti", scannerRole: "Pengguna", scannedAt: "2026-11-15T09:41:00.000Z", location: "Multi Function Hall" }] },
  { id: "asset-002", id_barang: "PRYT.MFHL.02", kode: "INV.SRPS.61.213.0226.PRYT.MFHL.0002", nama_barang: "Proyektor", kat: "61 - Fixed Assets Installation (DC)", qty: 1, biro: "Sarana dan Prasarana", tanggal_pembelian: "2026-02-15", gedung: "Gedung 6", lokasi: "Gedung 6 · Lantai 1", ruangan: "Multi Function Hall", area_penempatan: "Multi Function Hall", status: "Maintenance", foto_barang: "", scanHistory: [] },
  { id: "asset-003", id_barang: "KRSI.MFHL.01", kode: "INV.SRPS.62.213.0226.KRSI.MFHL.0001", nama_barang: "Kursi", kat: "62 - Furniture & Fixtures", qty: 60, biro: "Sarana dan Prasarana", tanggal_pembelian: "2025-08-10", gedung: "Gedung 6", lokasi: "Gedung 6 · Lantai 1", ruangan: "Multi Function Hall", area_penempatan: "Multi Function Hall", status: "Baik", foto_barang: "", scanHistory: [] },
  { id: "asset-004", id_barang: "MEJA.MFHL.01", kode: "INV.SRPS.62.213.0226.MEJA.MFHL.0001", nama_barang: "Meja", kat: "62 - Furniture & Fixtures", qty: 20, biro: "Sarana dan Prasarana", tanggal_pembelian: "2025-08-10", gedung: "Gedung 6", lokasi: "Gedung 6 · Lantai 1", ruangan: "Multi Function Hall", area_penempatan: "Multi Function Hall", status: "Baik", foto_barang: "", scanHistory: [] },
  { id: "asset-005", id_barang: "AC.MFHL.01", kode: "INV.SRPS.61.213.0226.AC.MFHL.0001", nama_barang: "Pendingin ruangan", kat: "61 - Fixed Assets Installation (DC)", qty: 4, biro: "Sarana dan Prasarana", tanggal_pembelian: "2024-05-12", gedung: "Gedung 6", lokasi: "Gedung 6 · Lantai 1", ruangan: "Multi Function Hall", area_penempatan: "Multi Function Hall", status: "Baik", foto_barang: "", scanHistory: [] },
  { id: "asset-006", id_barang: "KRSI.FEB.01", kode: "INV.SRPS.62.213.0226.KRSI.FEB.0001", nama_barang: "Kursi", kat: "62 - Furniture & Fixtures", qty: 32, biro: "Sarana dan Prasarana", tanggal_pembelian: "2024-08-20", gedung: "Gedung 6", lokasi: "Gedung 6 · Lantai 1", ruangan: "Ruang kelas FEB", area_penempatan: "KLS6.1", status: "Baik", foto_barang: "", scanHistory: [] },
  { id: "asset-007", id_barang: "AC.FEB.01", kode: "INV.SRPS.61.213.0226.AC.FEB.0001", nama_barang: "Pendingin ruangan", kat: "61 - Fixed Assets Installation (DC)", qty: 24, biro: "Sarana dan Prasarana", tanggal_pembelian: "2023-04-10", gedung: "Gedung 6", lokasi: "Gedung 6 · Lantai 1", ruangan: "Ruang dosen FEB", area_penempatan: "DSN6.1", status: "Baik", foto_barang: "", scanHistory: [] }
];

const DEFAULT_SAMPLE_REPORTS = [
  {
    id: "report-demo-1",
    senderUid: "bima",
    senderName: "Bima Sakti",
    senderEmail: "bima@upt.ac.id",
    targetRole: "admin",
    room: "Multi Function Hall",
    assetId: "asset-002",
    assetItemId: "PRYT.MFHL.02",
    assetCode: "INV.SRPS.61.213.0226.PRYT.MFHL.0002",
    assetName: "Proyektor",
    assetLocation: "Gedung 6 · Lantai 1",
    assetArea: "Multi Function Hall",
    assetPhoto: "",
    message: "Proyektor unit 02 sering mati saat digunakan. Mohon diperiksa.",
    feedback: "Terima kasih, Bima. Tim kami akan memeriksa proyektor siang ini. Status aset telah diperbarui.",
    feedbackAt: "2026-11-15T09:28:00.000Z",
    statusBadge: "Maintenance",
    createdAt: "2026-11-15T09:15:00.000Z"
  }
];

const App = {
  currentUser: null,
  assets: [],
  rooms: [],
  reports: [],
  selectedBuilding: "Gedung 6",
  fnfState: {
    room: null,
    categoryName: null,
    selectedAssetId: null
  },
  expandedCategoryId: null,
  selectedUnitCode: null,
  selectedUnitSeq: null,
  adminReportsFilter: "all",
  adminActiveReportId: null,
  activeLabelAsset: null,
  activeLabelUnitCode: null,
  cameraStream: null,
  cameraFrame: null,
  cameraReaderControls: null,
  cameraTorchSupported: false,
  cameraTorchEnabled: false,
  pendingAssetPhoto: null,
  searchHistory: [],
  inventoryStatus: "",
  managedUserRoleFilter: "",
  roomCategoryFilter: "Semua",
  assetFormReturnTab: "tab-dashboard",
  labelReturnTab: "tab-dashboard",
  localDataForMigration: { assets: [], rooms: [], reports: [] },

  async init() {
    this.bindEvents();
    this.assets = this.readLocalData("sarpras_assets", SAMPLE_ASSETS);
    this.rooms = this.readLocalData("sarpras_rooms", []);
    this.reports = this.readLocalData("sarpras_reports", DEFAULT_SAMPLE_REPORTS);
    this.searchHistory = this.readLocalData("sarpras_search_history", ["Kursi Multi Function Hall", "PRYT.MFHL.01"]);
    this.setStorageStatus();

    const migrateBtn = document.getElementById("btn-migrate-local");
    if (migrateBtn) {
      migrateBtn.addEventListener("click", async () => {
        if (!confirm("Firebase masih kosong. Pindahkan data yang tersimpan di perangkat ini ke Firebase?")) return;
        try {
          const count = await SyncService.migrateLocalData();
          document.getElementById("migration-actions").classList.add("hidden");
          this.setStorageStatus(`Data lokal (${count} catatan) berhasil dipindahkan ke Firebase.`);
        } catch (error) {
          alert(`Pemindahan data gagal: ${error.message}`);
        }
      });
    }

    try {
      this.currentUser = await AuthService.restoreSession();
      if (this.currentUser) await this.onAuthenticated();
    } catch (error) {
      console.error("Sesi aplikasi tidak dapat dipulihkan.", error);
      this.currentUser = null;
      document.getElementById("app-shell").classList.add("hidden");
      document.getElementById("view-login").classList.remove("hidden");
      if (FirebaseService.auth && FirebaseService.auth.currentUser) {
        try {
          await FirebaseService.auth.signOut();
        } catch (signOutError) {
          console.error("Sesi Firebase gagal ditutup.", signOutError);
        }
      }
      this.setStorageStatus(`Koneksi Firebase gagal: ${error.message}`);
      document.getElementById("login-storage-status").classList.remove("hidden");
    }
  },

  setStorageStatus(message) {
    const banner = document.getElementById("storage-status");
    const loginBanner = document.getElementById("login-storage-status");
    const migrationActions = document.getElementById("migration-actions");
    if (!FirebaseService.configured) {
      const text = "Mode lokal: Berjalan secara mandiri di perangkat.";
      if (banner) banner.textContent = text;
      if (loginBanner) loginBanner.textContent = text;
      return;
    }
    const text = message || (FirebaseService.ready
      ? "Firebase siap. Data aset dan laporan tersinkron antarperangkat."
      : `Firebase belum siap${FirebaseService.error ? `: ${FirebaseService.error.message}` : ". Periksa koneksi internet."}`);
    if (banner) {
      banner.textContent = text;
      banner.classList.remove("hidden");
    }
    if (loginBanner) {
      loginBanner.textContent = text;
      loginBanner.classList.remove("hidden");
    }
  },

  readLocalData(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(fallback));
    } catch (error) {
      console.error(`Data lokal ${key} tidak dapat dibaca.`, error);
      return JSON.parse(JSON.stringify(fallback));
    }
  },

  persistAssets() {
    localStorage.setItem("sarpras_assets", JSON.stringify(this.assets));
  },

  persistRooms() {
    localStorage.setItem("sarpras_rooms", JSON.stringify(this.rooms));
  },

  bindEvents() {
    const updateKeyboardInset = () => {
      const activeElement = document.activeElement;
      const isEditing = activeElement && activeElement.matches(
        "input, textarea, select, [contenteditable='true']"
      );
      const viewport = window.visualViewport;
      const inset = isEditing && viewport
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0;
      document.documentElement.style.setProperty("--keyboard-inset", `${Math.round(inset)}px`);
      document.body.classList.toggle("keyboard-open", inset > 100);
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateKeyboardInset);
      window.visualViewport.addEventListener("scroll", updateKeyboardInset);
    }
    window.addEventListener("resize", updateKeyboardInset);
    document.addEventListener("focusin", () => window.setTimeout(updateKeyboardInset, 100));
    document.addEventListener("focusout", () => window.setTimeout(updateKeyboardInset, 150));

    // Toggle Password Visibility
    const togglePassBtn = document.getElementById("btn-toggle-password");
    if (togglePassBtn) {
      togglePassBtn.addEventListener("click", () => {
        const passInput = document.getElementById("login-password");
        const eyeShow = document.getElementById("icon-eye-show");
        const eyeHide = document.getElementById("icon-eye-hide");
        if (passInput.type === "password") {
          passInput.type = "text";
          eyeShow.classList.add("hidden");
          eyeHide.classList.remove("hidden");
        } else {
          passInput.type = "password";
          eyeShow.classList.remove("hidden");
          eyeHide.classList.add("hidden");
        }
      });
    }

    // Login Form
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value;
      const errEl = document.getElementById("login-error");
      errEl.textContent = "";
      try {
        this.currentUser = await AuthService.login(email, pass);
        await this.onAuthenticated();
      } catch (err) {
        SyncService.unsubscribe();
        if (FirebaseService.auth && FirebaseService.auth.currentUser) {
          try {
            await FirebaseService.auth.signOut();
          } catch (signOutError) {
            console.error("Sesi Firebase gagal ditutup setelah proses login gagal.", signOutError);
            err.message += ` Sesi juga gagal ditutup: ${signOutError.message}`;
          }
        }
        this.currentUser = null;
        document.getElementById("app-shell").classList.add("hidden");
        document.getElementById("view-login").classList.remove("hidden");
        document.getElementById("login-storage-status").classList.remove("hidden");
        errEl.textContent = "Login gagal: " + AuthService.getLoginErrorMessage(err);
      }
    });

    // Logout
    document.getElementById("btn-logout").addEventListener("click", async () => {
      this.stopCameraScanner();
      document.body.classList.remove("report-chat-active");
      try {
        await AuthService.logout();
      } catch (error) {
        alert(`Logout gagal: ${error.message}`);
        return;
      }
      SyncService.unsubscribe();
      this.currentUser = null;
      this.reports = [];
      this.adminActiveReportId = null;
      this.selectedUnitCode = null;
      this.selectedUnitSeq = null;
      this.fnfState = { room: null, categoryName: null, selectedAssetId: null };
      this.clearReportAttachedAsset();
      document.getElementById("report-message").value = "";
      document.getElementById("migration-actions").classList.add("hidden");
      document.getElementById("app-shell").classList.add("hidden");
      document.getElementById("view-login").classList.remove("hidden");
      this.setStorageStatus();
    });

    // Navigation Buttons
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const isAdmin = this.currentUser && this.currentUser.role === "admin";
        const targetTab = btn.dataset.tab || (isAdmin ? btn.dataset.adminTab : btn.dataset.userTab);
        this.switchTab(targetTab);
      });
    });
    document.getElementById("building-filter").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-building]");
      if (button) this.selectBuilding(button.dataset.building);
    });
    document.getElementById("fnf-content").addEventListener("click", (event) => {
      const roomCard = event.target.closest("[data-room-key]");
      if (roomCard) this.fnfOpenRoom(roomCard.dataset.roomKey);
    });

    // Header Back Button
    document.getElementById("btn-header-back").addEventListener("click", () => {
      if (this.fnfState.selectedAssetId) {
        this.fnfBackToCategory();
        return;
      }
      if (this.fnfState.categoryName) {
        this.fnfBackToRoom();
        return;
      }
      if (this.fnfState.room && document.getElementById("tab-dashboard").classList.contains("hidden") === false) {
        this.fnfReset();
        return;
      }
      this.switchTab(this.currentUser && this.currentUser.role === "admin" ? "tab-inventory" : "tab-dashboard");
    });

    // Search Shortcut from Dashboard
    document.getElementById("dashboard-search-shortcut").addEventListener("click", () => {
      this.switchTab("tab-search");
      document.getElementById("search-input").focus();
    });

    // Notification Button
    document.getElementById("btn-notif").addEventListener("click", () => {
      this.switchTab("tab-reports");
      document.getElementById("notif-dot").classList.add("hidden");
    });

    // Search Input & Filters
    document.getElementById("search-input").addEventListener("input", (e) => {
      this.renderSearchResults(e.target.value, document.getElementById("search-room-filter").value);
    });

    document.getElementById("btn-clear-search").addEventListener("click", () => {
      document.getElementById("search-input").value = "";
      this.renderSearchResults("", document.getElementById("search-room-filter").value);
      document.getElementById("search-input").focus();
    });

    document.getElementById("btn-clear-history").addEventListener("click", () => {
      this.searchHistory = [];
      localStorage.removeItem("sarpras_search_history");
      this.renderSearchHistory();
    });

    document.getElementById("btn-process-scan").addEventListener("click", () => this.processScanInput());

    document.getElementById("search-input").addEventListener("change", (e) => {
      const term = e.target.value.trim();
      if (term) {
        this.searchHistory = [term, ...this.searchHistory.filter((t) => t !== term)].slice(0, 8);
        localStorage.setItem("sarpras_search_history", JSON.stringify(this.searchHistory));
        this.renderSearchHistory();
      }
    });

    document.getElementById("search-room-filter").addEventListener("change", (e) => {
      this.renderSearchResults(document.getElementById("search-input").value, e.target.value);
    });

    // Inventory Search & Filter
    document.getElementById("inventory-search").addEventListener("input", () => this.renderInventory());
    document.getElementById("inventory-status-filter").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-status]");
      if (!button) return;
      this.inventoryStatus = button.dataset.status;
      document.querySelectorAll("#inventory-status-filter .chip").forEach((chip) => {
        chip.classList.toggle("active", chip === button);
      });
      this.renderInventory();
    });

    // Managed Users Search & Filter
    document.getElementById("managed-users-search").addEventListener("input", () => this.renderManagedUsers());
    const userRoleFilter = document.getElementById("managed-users-filter");
    if (userRoleFilter) {
      userRoleFilter.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-role]");
        if (!btn) return;
        this.managedUserRoleFilter = btn.dataset.role;
        userRoleFilter.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === btn));
        this.renderManagedUsers();
      });
    }

    // Camera Scan
    document.getElementById("btn-camera-capture").addEventListener("click", () => {
      this.toggleCameraScanner();
    });
    document.getElementById("btn-flash-toggle").addEventListener("click", () => {
      this.toggleCameraTorch();
    });
    document.getElementById("btn-photo-camera").addEventListener("click", () => {
      this.captureAssetPhoto("camera");
    });
    document.getElementById("btn-photo-library").addEventListener("click", () => {
      this.captureAssetPhoto("library");
    });
    document.getElementById("asset-photo-file").addEventListener("change", (event) => {
      this.readSelectedAssetPhoto(event.target.files[0]);
    });
    document.getElementById("f-gedung").addEventListener("change", () => {
      this.updateAssetRoomOptions(document.getElementById("f-ruangan").value);
    });
    document.getElementById("f-ruangan-select").addEventListener("change", () => {
      this.syncAssetRoomFields();
    });
    document.getElementById("scan-raw-input").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn-process-scan").click();
      }
    });

    // Status Chip Selector in Asset Form
    const chipSelector = document.getElementById("status-chip-selector");
    if (chipSelector) {
      chipSelector.addEventListener("click", (e) => {
        const btn = e.target.closest(".status-chip");
        if (!btn) return;
        chipSelector.querySelectorAll(".status-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("f-status").value = btn.dataset.val;
      });
    }

    // Dynamic auto-identity preview
    const namaInput = document.getElementById("f-nama");
    const idBarangInput = document.getElementById("f-id-barang");
    const updateAutoPreview = () => {
      const prefix = (idBarangInput.value.trim() || "PRYT").toUpperCase();
      const code = `${prefix}.MFHL.03`;
      const full = `INV.SRPS.61.213.0226.${code}`;
      document.getElementById("preview-auto-id").textContent = code;
      document.getElementById("preview-auto-fullcode").textContent = full;
      document.getElementById("f-kode").value = full;
    };
    if (idBarangInput) idBarangInput.addEventListener("input", updateAutoPreview);
    if (namaInput) {
      namaInput.addEventListener("input", () => {
        if (!idBarangInput.value) {
          const val = namaInput.value.trim().toUpperCase().slice(0, 4);
          idBarangInput.value = val || "PRYT";
          updateAutoPreview();
        }
      });
    }

    // Send Report Form
    document.getElementById("report-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.currentUser) {
        alert("Silakan masuk terlebih dahulu untuk mengirim laporan.");
        return;
      }
      const room = document.getElementById("report-room")?.value.trim() || "Multi Function Hall";
      const assetId = document.getElementById("report-asset-id")?.value.trim() || "";
      const assetItemId = document.getElementById("report-asset-item-id")?.value.trim() || "";
      const assetCode = document.getElementById("report-asset-code")?.value.trim() || "";
      const assetName = document.getElementById("report-asset-name")?.value.trim() || "";
      const assetLocation = document.getElementById("report-asset-location")?.value.trim() || "";
      const assetArea = document.getElementById("report-asset-area")?.value.trim() || "";
      const assetPhoto = document.getElementById("report-asset-photo")?.value.trim() || "";
      const message = document.getElementById("report-message").value.trim();
      if (!message) return;

      const report = {
        id: "report-" + Date.now(),
        senderUid: this.currentUser ? this.currentUser.uid : "user-1",
        senderName: this.currentUser ? (this.currentUser.name || "Bima Sakti") : "Bima Sakti",
        senderEmail: this.currentUser ? this.currentUser.email : "bima@upt.ac.id",
        targetRole: "admin",
        room,
        assetId,
        assetItemId,
        assetCode,
        assetName,
        assetLocation,
        assetArea,
        assetPhoto,
        message,
        feedback: "",
        statusBadge: "",
        createdAt: new Date().toISOString()
      };
      this.reports.push(report);
      try {
        await SyncService.saveReport(report);
      } catch (error) {
        this.reports = this.reports.filter((item) => item.id !== report.id);
        alert(`Laporan gagal dikirim: ${error.message}`);
        return;
      }
      this.clearReportAttachedAsset();
      this.renderReportsTimeline();
      document.getElementById("report-message").value = "";
    });

    document.getElementById("admin-reply-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this.adminActiveReportId) {
        await this.sendFeedback(this.adminActiveReportId);
      }
    });

    // Asset Form Submit
    document.getElementById("asset-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.currentUser || this.currentUser.role !== "admin") {
        alert("Akses ditolak: hanya Admin yang dapat menambah atau mengubah data inventaris.");
        return;
      }

      const docId = document.getElementById("asset-doc-id").value;
      const [building, floor] = JSON.parse(document.getElementById("f-gedung").value);
      const payload = {
        id_barang: document.getElementById("f-id-barang").value.trim() || "PRYT.MFHL.03",
        kode: document.getElementById("f-kode").value.trim(),
        nama_barang: document.getElementById("f-nama").value.trim(),
        kat: document.getElementById("f-kat").value.trim(),
        qty: parseInt(document.getElementById("f-qty").value, 10) || 1,
        biro: document.getElementById("f-biro").value.trim(),
        tanggal_pembelian: document.getElementById("f-tgl").value,
        gedung: this.normalizeBuildingName(building),
        lokasi: `${this.normalizeBuildingName(building)} · ${this.normalizeFloorName(floor)}`,
        ruangan: document.getElementById("f-ruangan").value.trim(),
        area_penempatan: document.getElementById("f-area").value.trim(),
        status: document.getElementById("f-status").value,
        foto_barang: document.getElementById("f-foto-url").value.trim()
      };
      const newAssetId = docId || "asset-" + Date.now();
      const existingAssetIndex = docId
        ? this.assets.findIndex((asset) => asset.id === docId)
        : -1;
      if (docId && existingAssetIndex < 0) {
        alert("Data aset tidak ditemukan.");
        return;
      }

      if (this.pendingAssetPhoto) {
        const photoStatus = document.getElementById("asset-photo-status");
        if (photoStatus) photoStatus.textContent = "Mengunggah foto aset...";
        try {
          payload.foto_barang = await SyncService.uploadAssetPhoto(this.pendingAssetPhoto, newAssetId);
        } catch (error) {
          if (photoStatus) photoStatus.textContent = `Foto gagal diunggah: ${error.message}`;
          alert(`Foto aset gagal disimpan: ${error.message}`);
          return;
        }
      }

      if (docId) {
        const previousAsset = this.assets[existingAssetIndex];
        this.assets[existingAssetIndex] = { ...previousAsset, ...payload };
        try {
          await SyncService.saveAsset(this.assets[existingAssetIndex]);
        } catch (error) {
          this.assets[existingAssetIndex] = previousAsset;
          alert(`Aset gagal disimpan: ${error.message}`);
          return;
        }
      } else {
        const newAsset = { ...payload, id: newAssetId, scanHistory: [] };
        this.assets.push(newAsset);
        try {
          await SyncService.saveAsset(newAsset);
        } catch (error) {
          this.assets = this.assets.filter((asset) => asset.id !== newAsset.id);
          alert(`Aset gagal disimpan: ${error.message}`);
          return;
        }
      }
      this.pendingAssetPhoto = null;
      this.persistAssets();
      this.renderAssetLocationOptions();
      this.closeAssetForm();
      this.renderBuildingFilter();
      this.renderDashboardStats();
      this.renderFNF();
      this.renderRoomManagement();
      this.populateSearchRooms();
      this.renderSearchResults(document.getElementById("search-input").value, document.getElementById("search-room-filter").value);
      this.renderInventory();
      alert("Data inventaris berhasil disimpan.");
    });

    document.getElementById("room-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = document.getElementById("room-form-status");
      if (!this.currentUser || this.currentUser.role !== "admin") {
        status.textContent = "Hanya Admin yang dapat menambahkan ruangan.";
        return;
      }

      const name = document.getElementById("room-name").value.trim();
      const building = this.normalizeBuildingName(document.getElementById("room-building").value);
      const floor = this.normalizeFloorName(document.getElementById("room-floor").value);
      if (!name || !building || !floor) {
        status.textContent = "Nama ruangan, gedung, dan lantai wajib diisi.";
        return;
      }

      const room = {
        id: `room-${Date.now()}`,
        name,
        gedung: building,
        lantai: floor,
        kode: name.toUpperCase().replace(/[^A-Z0-9]+/g, ".").replace(/^\.+|\.+$/g, ""),
        createdAt: new Date().toISOString(),
        createdByUid: this.currentUser.uid
      };
      const roomKey = this.fnfRoomKey(room).toLowerCase();
      const exists = this.rooms.some((savedRoom) => this.fnfRoomKey(savedRoom).toLowerCase() === roomKey)
        || this.assets.some((asset) => asset.ruangan && this.fnfRoomKey(asset).toLowerCase() === roomKey);
      if (exists) {
        status.textContent = "Ruangan dengan gedung dan lantai tersebut sudah terdaftar.";
        return;
      }

      this.rooms.push(room);
      try {
        await SyncService.saveRoom(room);
      } catch (error) {
        this.rooms = this.rooms.filter((savedRoom) => savedRoom.id !== room.id);
        status.textContent = `Ruangan gagal disimpan: ${error.message}`;
        return;
      }
      this.persistRooms();
      this.selectedBuilding = building;
      this.fnfState = { room: null, categoryName: null, selectedAssetId: null };
      document.getElementById("room-form").reset();
      status.textContent = `Ruangan "${name}" berhasil ditambahkan.`;
      this.renderBuildingFilter();
      this.renderDashboardStats();
      this.renderFNF();
      this.renderRoomManagement();
      this.renderAssetLocationOptions();
      this.populateSearchRooms();
    });

    // User Form Submit
    document.getElementById("user-crud-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this.currentUser && this.currentUser.role !== "admin") return;
      try {
        await AuthService.upsertUserAccount({
          id: document.getElementById("managed-uid").value.trim(),
          name: document.getElementById("managed-name").value.trim(),
          email: document.getElementById("managed-email").value.trim(),
          unit: document.getElementById("managed-unit").value.trim(),
          role: document.getElementById("managed-role").value,
          password: document.getElementById("managed-password").value
        });
        e.target.reset();
        document.getElementById("user-form-panel").open = false;
        document.getElementById("managed-uid").value = "";
        this.renderManagedUsers();
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById("btn-user-new").addEventListener("click", () => {
      document.getElementById("user-crud-form").reset();
      document.getElementById("managed-uid").value = "";
    });
  },

  async onAuthenticated() {
    const isAdmin = this.currentUser && this.currentUser.role === "admin";
    this.adminActiveReportId = null;
    document.body.classList.toggle("role-admin", isAdmin);

    const secondaryNav = document.getElementById("nav-secondary");
    if (secondaryNav) {
      secondaryNav.dataset.tab = "";
      const userIcon = secondaryNav.querySelector(".icon-nav-user");
      const adminIcon = secondaryNav.querySelector(".icon-nav-admin");
      if (userIcon) userIcon.classList.toggle("hidden", isAdmin);
      if (adminIcon) adminIcon.classList.toggle("hidden", !isAdmin);
      const label = document.getElementById("nav-secondary-label");
      if (label) label.textContent = isAdmin ? "Aset" : "Cari";
    }

    const profileLabel = document.getElementById("nav-profile-label");
    if (profileLabel) profileLabel.textContent = isAdmin ? "Akun" : "Profil";

    document.querySelectorAll(".admin-only").forEach((el) => el.classList.toggle("hidden", !isAdmin));
    document.querySelectorAll(".user-only").forEach((el) => el.classList.toggle("hidden", isAdmin));

    const hour = new Date().getHours();
    const greeting = hour < 11 ? "pagi" : hour < 15 ? "siang" : hour < 18 ? "sore" : "malam";
    document.getElementById("dashboard-greeting").textContent =
      `Selamat ${greeting}, ${isAdmin ? "Admin" : (this.currentUser.name || "Pengguna")}`;

    try {
      const data = await SyncService.loadInitialData();
      this.assets = data.assets === null
        ? this.readLocalData("sarpras_assets", SAMPLE_ASSETS)
        : data.assets;
      this.rooms = data.rooms === null
        ? this.readLocalData("sarpras_rooms", [])
        : data.rooms;
      const localReports = this.readLocalData("sarpras_reports", DEFAULT_SAMPLE_REPORTS);
      this.reports = data.reports === null
        ? (isAdmin ? localReports : localReports.filter((report) => report.senderUid === this.currentUser.uid))
        : data.reports;
      this.persistAssets();
      this.persistRooms();
      if (data.reports === null && isAdmin) {
        localStorage.setItem("sarpras_reports", JSON.stringify(this.reports));
      }
    } catch (error) {
      this.currentUser = null;
      document.getElementById("app-shell").classList.add("hidden");
      document.getElementById("view-login").classList.remove("hidden");
      document.getElementById("login-storage-status").classList.remove("hidden");
      throw new Error(`Data akun tidak dapat dimuat: ${error.message}`);
    }

    document.getElementById("view-login").classList.add("hidden");
    document.getElementById("login-storage-status").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");

    this.renderDashboardStats();
    this.renderBuildingFilter();
    this.renderAssetLocationOptions();
    this.renderFNF();
    this.renderInventory();
    this.populateSearchRooms();
    this.renderSearchResults("", "");
    this.renderReportsTimeline();
    this.renderProfile();
    this.renderRoomManagement();
    if (isAdmin) this.renderManagedUsers();
    this.updateNotification();

    if (SyncService.firebaseEnabled) {
      SyncService.subscribe({
        onAssets: (assets) => {
          this.assets = assets;
          this.persistAssets();
          this.renderBuildingFilter();
          this.renderAssetLocationOptions();
          this.renderDashboardStats();
          this.renderFNF();
          this.renderRoomManagement();
          this.renderInventory();
          this.populateSearchRooms();
        },
        onRooms: (rooms) => {
          this.rooms = rooms;
          this.persistRooms();
          this.renderBuildingFilter();
          this.renderDashboardStats();
          this.renderFNF();
          this.renderRoomManagement();
          this.renderAssetLocationOptions();
          this.populateSearchRooms();
        },
        onReports: (reports) => {
          this.reports = reports;
          this.renderReportsTimeline();
          this.updateNotification();
        },
        onScans: (scans) => {
          const scansByAsset = new Map();
          scans.forEach((scan) => {
            if (!scansByAsset.has(scan.assetId)) scansByAsset.set(scan.assetId, []);
            scansByAsset.get(scan.assetId).push({
              scannedBy: scan.scannedBy,
              scannerRole: scan.scannerRole,
              scannedAt: scan.scannedAt,
              rawInput: scan.rawInput,
              matchedIdBarang: scan.matchedIdBarang
            });
          });
          this.assets.forEach((asset) => {
            asset.scanHistory = scansByAsset.get(asset.id) || [];
          });
          this.renderFNF();
        },
        onError: (error) => {
          console.error("Sinkronisasi data gagal.", error);
          this.setStorageStatus(`Sinkronisasi terganggu: ${error.message}`);
        }
      });
    }
  },

  updateNotification() {
    const dot = document.getElementById("notif-dot");
    if (!dot) return;
    const hasNotification = this.currentUser && this.currentUser.role === "admin"
      ? this.reports.length > 0
      : this.reports.some((report) => report.senderUid === this.currentUser.uid && report.feedback);
    dot.classList.toggle("hidden", !hasNotification);
  },

  async toggleCameraScanner() {
    if (this.cameraStream || this.cameraReaderControls) {
      this.stopCameraScanner();
      return;
    }
    const status = document.getElementById("scan-camera-status");
    const video = document.getElementById("scan-camera-video");
    const placeholder = document.getElementById("scan-idle-placeholder");
    const viewport = document.getElementById("scan-viewport");
    const indicator = document.getElementById("scan-camera-indicator");
    const flashButton = document.getElementById("btn-flash-toggle");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (navigator.camera && window.Camera && window.Code39Scanner) {
        if (status) status.textContent = "Arahkan kamera ke label barcode Code 39.";
        navigator.camera.getPicture(async (photoData) => {
          try {
            const rawValue = await window.Code39Scanner.decodeImage(photoData);
            document.getElementById("scan-raw-input").value = rawValue;
            await this.processScanInput();
          } catch (error) {
            if (status) status.textContent = `Barcode tidak terbaca: ${error.message}`;
          }
        }, (error) => {
          if (status) status.textContent = `Pemindaian dibatalkan atau gagal: ${error}`;
        }, {
          quality: 90,
          destinationType: window.Camera.DestinationType.DATA_URL,
          sourceType: window.Camera.PictureSourceType.CAMERA,
          encodingType: window.Camera.EncodingType.JPEG,
          mediaType: window.Camera.MediaType.PICTURE,
          targetWidth: 1920,
          targetHeight: 1080,
          correctOrientation: true,
          allowEdit: false,
          saveToPhotoAlbum: false
        });
        return;
      }
      alert("Kamera tidak didukung pada browser ini. Anda dapat memasukkan kode secara langsung.");
      return;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      const videoTrack = this.cameraStream.getVideoTracks()[0];
      const capabilities = videoTrack && videoTrack.getCapabilities
        ? videoTrack.getCapabilities()
        : {};
      this.cameraTorchSupported = Boolean(capabilities && capabilities.torch);
      const cameraEnhancements = [];
      let hardwareZoomRequested = false;
      if (capabilities.zoom && typeof capabilities.zoom.max === "number") {
        const zoom = Math.min(capabilities.zoom.max, Math.max(capabilities.zoom.min || 1, 1.5));
        cameraEnhancements.push({ zoom });
        hardwareZoomRequested = true;
      }
      if (Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("continuous")) {
        cameraEnhancements.push({ focusMode: "continuous" });
      }
      if (cameraEnhancements.length) {
        try {
          await videoTrack.applyConstraints({ advanced: cameraEnhancements });
        } catch (error) {
          hardwareZoomRequested = false;
          console.warn("Kamera tidak dapat menerapkan zoom atau fokus otomatis.", error);
        }
      }
      if (video) {
        video.srcObject = this.cameraStream;
        video.classList.toggle("scan-camera-digital-zoom", !hardwareZoomRequested);
        video.classList.remove("hidden");
        await video.play();
      }
      if (placeholder) placeholder.classList.add("hidden");
      if (viewport) viewport.classList.add("is-camera-active");
      if (indicator) {
        indicator.classList.remove("is-inactive");
        indicator.classList.add("is-active");
        indicator.querySelector(".scan-camera-indicator-label").textContent = "KAMERA AKTIF";
      }
      if (flashButton) {
        flashButton.classList.remove("hidden");
        flashButton.disabled = !this.cameraTorchSupported;
        flashButton.title = this.cameraTorchSupported
          ? "Nyalakan lampu"
          : "Lampu flash tidak didukung perangkat ini";
        flashButton.setAttribute("aria-label", flashButton.title);
      }
      const btn = document.getElementById("btn-camera-capture");
      const btnLabel = document.getElementById("camera-button-label");
      if (btnLabel) btnLabel.textContent = "Tutup kamera";
      if (btn) btn.setAttribute("aria-pressed", "true");
      const torchHint = this.cameraTorchSupported ? "" : " Lampu flash tidak tersedia di perangkat ini.";
      const completeScan = async (rawValue) => {
        if (!this.cameraStream) return;
        document.getElementById("scan-raw-input").value = rawValue;
        this.stopCameraScanner();
        await this.processScanInput();
      };
      let nativeDetector = null;
      if ("BarcodeDetector" in window) {
        try {
          const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
          if (supportedFormats.includes("code_39")) {
            nativeDetector = new window.BarcodeDetector({ formats: ["code_39"] });
          }
        } catch (error) {
          console.warn("BarcodeDetector Code 39 tidak dapat digunakan; beralih ke pemindai lokal.", error);
        }
      }

      if (nativeDetector) {
        if (status) status.textContent = `Arahkan kamera ke barcode Code 39.${torchHint}`;
        const detectFrame = async () => {
          if (!this.cameraStream || !video) return;
          try {
            const results = await nativeDetector.detect(video);
            if (results.length) {
              await completeScan(results[0].rawValue);
              return;
            }
          } catch (error) {
            console.error("Pembacaan barcode kamera gagal.", error);
            this.stopCameraScanner();
            if (status) status.textContent = `Pembacaan barcode gagal: ${error.message}`;
            return;
          }
          if (this.cameraStream) this.cameraFrame = requestAnimationFrame(detectFrame);
        };
        this.cameraFrame = requestAnimationFrame(detectFrame);
      } else if (window.Code39Scanner) {
        if (status) status.textContent = `Pemindai Code 39 aktif. Dekatkan barcode ke kamera.${torchHint}`;
        this.cameraReaderControls = await window.Code39Scanner.start(
          video,
          (rawValue) => completeScan(rawValue),
          (error) => {
            console.error("Pembacaan barcode Code 39 gagal.", error);
            this.stopCameraScanner();
            if (status) status.textContent = `Pembacaan barcode gagal: ${error.message}`;
          }
        );
      } else if (status) {
        status.textContent = `Pemindai Code 39 belum termuat. Masukkan ID barang secara manual.${torchHint}`;
      }
    } catch (err) {
      this.stopCameraScanner();
      if (status) status.textContent = `Kamera tidak aktif: ${err.message}`;
    }
  },

  async toggleCameraTorch() {
    const track = this.cameraStream && this.cameraStream.getVideoTracks()[0];
    const status = document.getElementById("scan-camera-status");
    const button = document.getElementById("btn-flash-toggle");
    if (!track || !this.cameraTorchSupported) {
      if (status) status.textContent = "Lampu flash tidak didukung oleh kamera perangkat ini.";
      return;
    }

    const nextState = !this.cameraTorchEnabled;
    try {
      await track.applyConstraints({ advanced: [{ torch: nextState }] });
      this.cameraTorchEnabled = nextState;
      if (button) {
        button.classList.toggle("flash-active", nextState);
        button.setAttribute("aria-pressed", String(nextState));
        button.setAttribute("aria-label", nextState ? "Matikan lampu" : "Nyalakan lampu");
        button.title = nextState ? "Matikan lampu" : "Nyalakan lampu";
      }
      if (status) {
        status.textContent = nextState
          ? "Lampu kamera menyala. Arahkan kamera ke barcode aset."
          : "Lampu kamera mati. Arahkan kamera ke barcode aset.";
      }
    } catch (error) {
      if (status) status.textContent = `Lampu kamera gagal diubah: ${error.message}`;
    }
  },

  stopCameraScanner() {
    if (this.cameraFrame) cancelAnimationFrame(this.cameraFrame);
    this.cameraFrame = null;
    if (this.cameraReaderControls) {
      this.cameraReaderControls.stop();
      this.cameraReaderControls = null;
    }
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((t) => t.stop());
      this.cameraStream = null;
    }
    const video = document.getElementById("scan-camera-video");
    const placeholder = document.getElementById("scan-idle-placeholder");
    const viewport = document.getElementById("scan-viewport");
    const indicator = document.getElementById("scan-camera-indicator");
    const flashButton = document.getElementById("btn-flash-toggle");
    if (video) {
      video.classList.add("hidden");
      video.classList.remove("scan-camera-digital-zoom");
      video.srcObject = null;
    }
    if (placeholder) placeholder.classList.remove("hidden");
    if (viewport) viewport.classList.remove("is-camera-active");
    if (indicator) {
      indicator.classList.remove("is-active");
      indicator.classList.add("is-inactive");
      indicator.querySelector(".scan-camera-indicator-label").textContent = "KAMERA NONAKTIF";
    }
    this.cameraTorchSupported = false;
    this.cameraTorchEnabled = false;
    if (flashButton) {
      flashButton.classList.add("hidden");
      flashButton.classList.remove("flash-active");
      flashButton.disabled = true;
      flashButton.setAttribute("aria-pressed", "false");
      flashButton.setAttribute("aria-label", "Lampu flash tidak didukung");
      flashButton.title = "Lampu flash belum tersedia";
    }
    const btn = document.getElementById("btn-camera-capture");
    const btnLabel = document.getElementById("camera-button-label");
    if (btnLabel) btnLabel.textContent = "Buka kamera";
    if (btn) btn.setAttribute("aria-pressed", "false");
    const status = document.getElementById("scan-camera-status");
    if (status) status.textContent = "";
  },

  async processScanInput() {
    const raw = document.getElementById("scan-raw-input").value.trim();
    const res = await ScanService.processScan(raw, this.assets, this.currentUser);
    if (res.found) {
      try {
        await SyncService.recordScan(res.asset.id, res.asset.scanHistory[0]);
      } catch (error) {
        alert(`Aset ditemukan, tetapi riwayat scan gagal disimpan: ${error.message}`);
      }
    }
    this.renderScanResult(res);
  },

  switchTab(tabId) {
    if (tabId === "tab-inventory" && (!this.currentUser || this.currentUser.role !== "admin")) return;
    this.stopCameraScanner();
    document.body.classList.toggle("report-chat-active", tabId === "tab-reports");
    document.querySelectorAll(".tab-view").forEach((v) => v.classList.add("hidden"));

    const targetEl = document.getElementById(tabId);
    if (targetEl) targetEl.classList.remove("hidden");

    const isDashboard = tabId === "tab-dashboard";
    const isAdmin = this.currentUser && this.currentUser.role === "admin";
    const titles = {
      "tab-search": "Pencarian aset",
      "tab-scan": "Scan barcode",
      "tab-reports": "Laporan saya",
      "tab-profile": isAdmin ? "Kelola akun pengguna" : "Profil saya",
      "tab-inventory": "Data inventaris",
      "panel-asset-form": "Tambah aset",
      "panel-print-label": "Cetak label barcode"
    };

    const brandLockup = document.querySelector(".brand-lockup");
    const backBtn = document.getElementById("btn-header-back");
    const notifBtn = document.getElementById("btn-notif");
    const adminBadge = document.getElementById("header-admin-badge");
    const titleSpan = document.getElementById("header-page-title");

    if (brandLockup) brandLockup.classList.toggle("hidden", !isDashboard);
    if (backBtn) backBtn.classList.toggle("hidden", isDashboard);
    if (notifBtn) notifBtn.classList.toggle("hidden", !isDashboard);
    if (titleSpan) titleSpan.textContent = titles[tabId] || "";

    // Show Admin badge on admin specific screens
    if (adminBadge) {
      const showAdmin = isAdmin && ["tab-inventory", "panel-asset-form", "panel-print-label", "tab-profile"].includes(tabId);
      adminBadge.classList.toggle("hidden", !showAdmin);
    }

    if (isDashboard) this.updateFNFHeader();

    document.querySelectorAll(".nav-btn").forEach((b) => {
      const navTarget = b.dataset.tab || (isAdmin ? b.dataset.adminTab : b.dataset.userTab);
      b.classList.toggle("active", navTarget === tabId);
    });
    window.scrollTo(0, 0);
  },

  renderInventory() {
    const search = document.getElementById("inventory-search");
    const list = document.getElementById("inventory-list");
    if (!search || !list) return;

    const term = search.value.trim().toLowerCase();
    const total = this.assets.reduce((sum, asset) => sum + (Number(asset.qty) || 0), 0);
    const maintenance = this.assets
      .filter((asset) => asset.status === "Maintenance")
      .reduce((sum, asset) => sum + (Number(asset.qty) || 0), 0);

    document.getElementById("inventory-total").textContent = total.toLocaleString("id-ID");
    document.getElementById("inventory-maintenance").textContent = maintenance.toLocaleString("id-ID");

    const filtered = this.assets.filter((asset) => {
      const matchesStatus = !this.inventoryStatus || asset.status === this.inventoryStatus;
      const haystack = `${asset.nama_barang} ${asset.id_barang} ${asset.kode} ${asset.ruangan} ${asset.gedung}`.toLowerCase();
      return matchesStatus && haystack.includes(term);
    });

    document.getElementById("inventory-count").textContent = `${filtered.length} aset`;

    list.innerHTML = filtered.length
      ? filtered.map((asset) => `
        <article class="inventory-item-card">
          <div class="inventory-item-meta" onclick="App.openSearchAsset('${asset.id}')" style="cursor:pointer;">
            <strong>${asset.nama_barang}</strong>
            <small>${asset.id_barang} · ${asset.gedung ? asset.gedung.replace("Gedung ", "Gd. ") : "Gd. 6"}</small>
            <div style="margin-top:2px;">
              <span class="status-badge status-${asset.status}">${asset.status}</span>
            </div>
          </div>
          <div class="inventory-item-actions">
            <button type="button" class="btn-icon-square btn-icon-edit" aria-label="Edit ${asset.nama_barang}" onclick="App.editAsset('${asset.id}')">
              <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button type="button" class="btn-icon-square btn-icon-delete" aria-label="Hapus ${asset.nama_barang}" onclick="App.deleteAsset('${asset.id}')">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </article>`).join("")
      : `<div class="card" style="text-align:center; color:var(--text-muted); padding:20px;">Tidak ada data aset ditemukan.</div>`;
  },

  updateFNFHeader() {
    const active = !document.getElementById("tab-dashboard").classList.contains("hidden");
    if (!active) return;
    const { room, categoryName, selectedAssetId } = this.fnfState;
    const asset = selectedAssetId ? this.assets.find((item) => item.id === selectedAssetId) : null;
    const hasDrilldown = active && Boolean(room);

    document.querySelector(".brand-lockup").classList.toggle("hidden", hasDrilldown);
    document.getElementById("btn-header-back").classList.toggle("hidden", !hasDrilldown);
    document.getElementById("btn-notif").classList.toggle("hidden", hasDrilldown);
    document.getElementById("dashboard-main-view").classList.toggle("hidden", hasDrilldown);

    const titleEl = document.getElementById("header-page-title");
    if (asset) {
      titleEl.textContent = "Detail aset";
    } else if (categoryName) {
      titleEl.textContent = categoryName;
    } else if (room) {
      titleEl.textContent = this.fnfRoomLabel(room);
    }
  },

  getFilteredAssetsByBuilding() {
    if (this.selectedBuilding === "Semua") return this.assets;
    return this.assets.filter((a) => (a.gedung || "").toLowerCase() === this.selectedBuilding.toLowerCase());
  },

  getBuildingOptions() {
    const additionalBuildings = [
      ...this.assets.map((asset) => asset.gedung),
      ...this.rooms.map((room) => room.gedung)
    ]
      .filter((building) => building && !BUILDINGS.includes(building));
    return [...new Set([...BUILDINGS, ...additionalBuildings])];
  },

  renderDashboardStats() {
    const list = this.getFilteredAssetsByBuilding();
    const rooms = new Set(list.filter((asset) => asset.ruangan).map((asset) => this.fnfRoomKey(asset)));
    this.rooms.forEach((room) => {
      if (this.selectedBuilding === "Semua" || room.gedung === this.selectedBuilding) {
        rooms.add(this.fnfRoomKey(room));
      }
    });
    const totalQty = list.reduce((sum, a) => sum + (Number(a.qty) || 0), 0);
    document.getElementById("stat-rooms").textContent = rooms.size.toLocaleString("id-ID");
    document.getElementById("stat-assets").textContent = totalQty.toLocaleString("id-ID");
    document.getElementById("room-count-label").textContent = `${rooms.size.toLocaleString("id-ID")} ruangan`;
    document.getElementById("building-caption").textContent =
      this.selectedBuilding === "Semua" ? "SEMUA GEDUNG" : `${this.selectedBuilding.toUpperCase()} / LANTAI 1`;
  },

  renderBuildingFilter() {
    const container = document.getElementById("building-filter");
    if (!container) return;
    const buildings = this.getBuildingOptions();
    container.innerHTML = buildings.map(
      (b) =>
        `<button type="button" class="chip ${this.selectedBuilding === b ? "active" : ""}" data-building="${this.escapeHTML(b)}" aria-pressed="${this.selectedBuilding === b}">${this.escapeHTML(b.replace("Gedung ", "Gd. "))}</button>`
    ).join("");
    const options = document.getElementById("room-building-options");
    if (options) {
      options.innerHTML = buildings.map((building) => `<option value="${this.escapeHTML(building)}"></option>`).join("");
    }
  },

  selectBuilding(building) {
    this.selectedBuilding = building;
    this.fnfState = { room: null, categoryName: null, selectedAssetId: null };
    this.renderBuildingFilter();
    this.renderDashboardStats();
    this.renderFNF();
  },

  normalizeBuildingName(value) {
    const cleaned = String(value || "").trim().replace(/\s+/g, " ");
    if (!cleaned) return "";
    const match = cleaned.match(/^(?:gedung|gd\.?)\s*(.*)$/i);
    return `Gedung ${match ? match[1].trim() : cleaned}`.trim();
  },

  normalizeFloorName(value) {
    const cleaned = String(value || "").trim().replace(/\s+/g, " ");
    if (!cleaned) return "";
    return /^lantai\b/i.test(cleaned)
      ? cleaned.replace(/^lantai\b\s*/i, "Lantai ")
      : `Lantai ${cleaned}`;
  },

  getAssetFloor(item) {
    if (item && item.lantai) return this.normalizeFloorName(item.lantai);
    const location = String(item && item.lokasi || "");
    const match = location.match(/lantai\s*([^\s·,-]+)/i);
    return match ? this.normalizeFloorName(match[1]) : "Lantai 1";
  },

  fnfRoomKey(item) {
    const building = item.gedung || "-";
    const floor = item.lantai || this.getAssetFloor(item);
    const name = item.ruangan || item.name || "Tanpa Ruangan";
    return `${building}::${this.normalizeFloorName(floor)}::${name}`;
  },

  fnfRoomLabel(roomKey) {
    return roomKey.split("::").slice(2).join("::") || roomKey;
  },

  renderRoomManagement() {
    const list = document.getElementById("room-admin-list");
    const count = document.getElementById("room-admin-count");
    if (!list || !count) return;
    count.textContent = `${this.rooms.length.toLocaleString("id-ID")} ruangan`;
    if (!this.rooms.length) {
      list.innerHTML = `<p class="room-admin-empty">Belum ada ruangan tambahan.</p>`;
      return;
    }
    list.innerHTML = [...this.rooms]
      .sort((a, b) => a.name.localeCompare(b.name, "id"))
      .map((room) => {
        const assetCount = this.assets
          .filter((asset) => this.fnfRoomKey(asset) === this.fnfRoomKey(room))
          .reduce((sum, asset) => sum + (Number(asset.qty) || 0), 0);
        return `
          <div class="room-admin-item">
            <div class="room-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V6l7-3 7 3v15M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4"/></svg>
            </div>
            <div class="room-admin-item-info">
              <strong>${this.escapeHTML(room.name)}</strong>
              <small>${this.escapeHTML(room.gedung)} · ${this.escapeHTML(this.normalizeFloorName(room.lantai))}</small>
            </div>
            <span class="room-admin-asset-count">${assetCount.toLocaleString("id-ID")} aset</span>
          </div>`;
      }).join("");
  },

  renderAssetLocationOptions(preferredAsset = null) {
    const locationSelect = document.getElementById("f-gedung");
    if (!locationSelect) return;

    const locations = new Map();
    const addLocation = (building, floor) => {
      if (!building) return;
      const location = [this.normalizeBuildingName(building), this.normalizeFloorName(floor)];
      const key = JSON.stringify(location);
      if (!locations.has(key)) locations.set(key, location);
    };
    BUILDINGS.forEach((building) => addLocation(building, "Lantai 1"));
    this.assets.forEach((asset) => addLocation(asset.gedung, this.getAssetFloor(asset)));
    this.rooms.forEach((room) => addLocation(room.gedung, room.lantai));

    let previousLocation = null;
    try {
      previousLocation = JSON.parse(locationSelect.value);
    } catch (error) {
      previousLocation = null;
    }
    const building = preferredAsset?.gedung || previousLocation?.[0] || "Gedung 6";
    const floor = preferredAsset
      ? this.getAssetFloor(preferredAsset)
      : previousLocation?.[1] || "Lantai 1";
    addLocation(building, floor);
    const selectedLocation = JSON.stringify([
      this.normalizeBuildingName(building),
      this.normalizeFloorName(floor)
    ]);

    locationSelect.innerHTML = [...locations.values()]
      .map((location) => {
        const value = JSON.stringify(location);
        const label = `${location[0]} · ${location[1]}`;
        return `<option value="${this.escapeHTML(value)}">${this.escapeHTML(label)}</option>`;
      }).join("");
    locationSelect.value = selectedLocation;
    this.updateAssetRoomOptions(
      preferredAsset?.ruangan || (selectedLocation === JSON.stringify(["Gedung 6", "Lantai 1"])
        ? "Multi Function Hall"
        : "")
    );
  },

  updateAssetRoomOptions(preferredName = "") {
    const locationSelect = document.getElementById("f-gedung");
    const roomSelect = document.getElementById("f-ruangan-select");
    if (!locationSelect || !roomSelect) return;

    let selectedLocation;
    try {
      selectedLocation = JSON.parse(locationSelect.value);
    } catch (error) {
      selectedLocation = [];
    }
    const [building, floor] = selectedLocation;
    const options = new Map();
    const addRoom = (name, roomBuilding, roomFloor, area) => {
      if (!name || roomBuilding !== building || this.normalizeFloorName(roomFloor) !== floor) return;
      const key = name.toLowerCase();
      if (!options.has(key)) options.set(key, { name, area: area || name });
    };
    this.assets.forEach((asset) => {
      addRoom(asset.ruangan, asset.gedung, this.getAssetFloor(asset), asset.area_penempatan);
    });
    this.rooms.forEach((room) => {
      addRoom(room.name, room.gedung, room.lantai, room.kode);
    });

    const roomOptions = [...options.values()].sort((a, b) => a.name.localeCompare(b.name, "id"));
    roomSelect.innerHTML = `<option value="">Pilih ruangan</option>` + roomOptions.map((room) =>
      `<option value="${this.escapeHTML(room.name)}" data-area="${this.escapeHTML(room.area)}">${this.escapeHTML(room.name)}</option>`
    ).join("");
    roomSelect.value = roomOptions.some((room) => room.name === preferredName) ? preferredName : "";
    this.syncAssetRoomFields();
  },

  syncAssetRoomFields() {
    const roomSelect = document.getElementById("f-ruangan-select");
    const roomField = document.getElementById("f-ruangan");
    const areaField = document.getElementById("f-area");
    if (!roomSelect || !roomField || !areaField) return;
    const selectedOption = roomSelect.selectedOptions[0];
    roomField.value = roomSelect.value;
    areaField.value = selectedOption?.dataset.area || roomSelect.value;
  },

  calculateAssetAge(dateStr) {
    if (!dateStr) return "Tanggal belum diketahui";
    const parts = dateStr.split("-").map(Number);
    const start = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(dateStr);
    if (isNaN(start.getTime())) return "Tanggal belum valid";
    const now = new Date();
    let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now < start) return "Tanggal pembelian mendatang";
    if (now.getDate() < start.getDate()) months -= 1;
    if (months <= 0) return "Kurang dari 1 bulan";
    if (months >= 12) {
      const y = Math.floor(months / 12);
      const m = months % 12;
      return m > 0 ? `${y} tahun ${m} bulan` : `${y} tahun`;
    }
    return `${months} bulan`;
  },

  formatAssetDate(dateStr) {
    if (!dateStr) return "Tanggal belum diketahui";
    const parts = dateStr.split("-").map(Number);
    const date = parts.length === 3
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date(dateStr);
    return Number.isNaN(date.getTime())
      ? "Tanggal belum valid"
      : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  },

  updateAssetPhotoPreview(photoUrl) {
    const image = document.getElementById("photo-thumb-img");
    const placeholder = document.getElementById("photo-thumb-placeholder");
    const name = document.getElementById("photo-name-label");
    const meta = document.getElementById("photo-meta-label");
    if (!image || !placeholder || !name || !meta) return;
    const hasPhoto = Boolean(photoUrl);
    image.classList.toggle("hidden", !hasPhoto);
    placeholder.classList.toggle("hidden", hasPhoto);
    if (hasPhoto) image.src = photoUrl;
    else image.removeAttribute("src");
    name.textContent = hasPhoto ? "Foto barang tersedia" : "Foto bukti belum tersedia";
    meta.textContent = hasPhoto ? "Dokumentasi aset" : "Ikon barang digunakan sebagai pengganti foto.";
  },

  captureAssetPhoto(source) {
    if (!this.currentUser || this.currentUser.role !== "admin") {
      alert("Hanya Admin yang dapat menambahkan foto aset.");
      return;
    }

    const camera = navigator.camera;
    const cameraConstants = window.Camera;
    if (camera && cameraConstants && cameraConstants.DestinationType && cameraConstants.PictureSourceType) {
      const options = {
        quality: 82,
        destinationType: cameraConstants.DestinationType.DATA_URL,
        sourceType: source === "library"
          ? cameraConstants.PictureSourceType.PHOTOLIBRARY
          : cameraConstants.PictureSourceType.CAMERA,
        encodingType: cameraConstants.EncodingType.JPEG,
        mediaType: cameraConstants.MediaType.PICTURE,
        targetWidth: 1280,
        targetHeight: 1280,
        correctOrientation: true,
        allowEdit: false,
        saveToPhotoAlbum: false
      };
      camera.getPicture(
        (photoData) => this.prepareAssetPhoto(photoData),
        (error) => {
          const status = document.getElementById("asset-photo-status");
          if (status) status.textContent = `Pengambilan foto gagal atau dibatalkan: ${error}`;
        },
        options
      );
      return;
    }

    const input = document.getElementById("asset-photo-file");
    input.dataset.source = source;
    if (source === "camera") input.setAttribute("capture", "environment");
    else input.removeAttribute("capture");
    input.click();
  },

  readSelectedAssetPhoto(file) {
    const input = document.getElementById("asset-photo-file");
    if (input) input.value = "";
    if (!file) return;
    const status = document.getElementById("asset-photo-status");
    if (!file.type.startsWith("image/")) {
      if (status) status.textContent = "File yang dipilih harus berupa gambar.";
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      if (status) status.textContent = "Foto tidak dapat dibaca dari perangkat.";
    };
    reader.onload = () => this.prepareAssetPhoto(reader.result);
    reader.readAsDataURL(file);
  },

  async prepareAssetPhoto(photoData) {
    const status = document.getElementById("asset-photo-status");
    try {
      const dataUrl = String(photoData || "").startsWith("data:image/")
        ? String(photoData)
        : `data:image/jpeg;base64,${photoData}`;
      const compressedPhoto = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Perangkat tidak dapat memproses foto."));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        image.onerror = () => reject(new Error("Format foto tidak dapat dibaca."));
        image.src = dataUrl;
      });
      this.pendingAssetPhoto = compressedPhoto;
      this.updateAssetPhotoPreview(compressedPhoto);
      if (status) status.textContent = "Foto siap. Tekan Simpan aset untuk mengunggahnya.";
    } catch (error) {
      console.error("Pemrosesan foto aset gagal.", error);
      if (status) status.textContent = `Foto tidak dapat diproses: ${error.message}`;
    }
  },

  escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  },

  renderFNF() {
    this.updateFNFHeader();
    const list = this.getFilteredAssetsByBuilding();
    const bcEl = document.getElementById("fnf-breadcrumb");
    const contentEl = document.getElementById("fnf-content");
    const { room, categoryName, selectedAssetId } = this.fnfState;

    // Level 3: Detail Aset (04 · Detail aset)
    if (selectedAssetId) {
      const asset = this.assets.find((a) => a.id === selectedAssetId);
      if (asset) {
        bcEl.innerHTML = `<span onclick="App.fnfBackToCategory()">← Kembali ke ${categoryName || "Daftar"}</span>`;
        contentEl.innerHTML = this.renderAssetDetailCard(asset);
        return;
      }
    }

    // Level 2: Kategori / Barang di dalam Ruangan (03 · Aset per ruangan)
    if (room) {
      const roomAssets = list.filter((a) => this.fnfRoomKey(a) === room);
      const roomMetadata = this.rooms.find((entry) => this.fnfRoomKey(entry) === room);
      const filteredCategoryAssets = roomAssets.filter((a) => {
        if (!this.roomCategoryFilter || this.roomCategoryFilter === "Semua") return true;
        if (this.roomCategoryFilter === "Perabot") return a.kat && a.kat.includes("Furniture");
        if (this.roomCategoryFilter === "Instalasi") return a.kat && (a.kat.includes("Installation") || a.kat.includes("Electronic") || a.kat.includes("Computer"));
        return true;
      });
      const roomLabel = this.fnfRoomLabel(room);
      const totalUnits = roomAssets.reduce((sum, a) => sum + (Number(a.qty) || 0), 0);
      const codeLoc = roomMetadata?.kode || roomAssets[0]?.area_penempatan || roomLabel;
      const gedungName = roomMetadata?.gedung || roomAssets[0]?.gedung || room.split("::")[0];
      const floorName = roomMetadata?.lantai || this.getAssetFloor(roomAssets[0]);

      bcEl.innerHTML = `<span onclick="App.fnfReset()">← Jelajahi ruangan</span> / ${this.escapeHTML(roomLabel)}`;

      contentEl.innerHTML = `
        <div class="room-summary-card">
          <div class="room-summary-left">
            <svg class="room-summary-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18M5 21V6l7-3 7 3v15M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4"/>
            </svg>
            <div>
              <div class="room-summary-title">${this.escapeHTML(gedungName)} · ${this.escapeHTML(floorName)}</div>
              <div class="room-summary-code">Kode lokasi: ${this.escapeHTML(codeLoc)}</div>
            </div>
          </div>
          <span class="room-summary-badge">${totalUnits} aset</span>
        </div>

        <div class="search-bar" style="margin-bottom:12px;">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4.2 4.2"/></svg>
          <input type="search" placeholder="Cari barang di ruangan ini" oninput="App.filterRoomAssets(this.value)" />
        </div>

        <div class="section-heading" style="margin-top:6px;">
          <h2>Aset di ruangan</h2>
        </div>

        <div class="inventory-filter" style="margin-bottom:8px;">
          <button class="chip ${this.roomCategoryFilter === 'Semua' ? 'active' : ''}" type="button" onclick="App.filterRoomByCategory('Semua')">Semua</button>
          <button class="chip ${this.roomCategoryFilter === 'Perabot' ? 'active' : ''}" type="button" onclick="App.filterRoomByCategory('Perabot')">Perabot</button>
          <button class="chip ${this.roomCategoryFilter === 'Instalasi' ? 'active' : ''}" type="button" onclick="App.filterRoomByCategory('Instalasi')">Instalasi</button>
        </div>

        <div style="font-size:10px; color:var(--text-muted); margin-bottom:10px;">
          ${filteredCategoryAssets.length} kategori barang · ${filteredCategoryAssets.reduce((sum, a) => sum + (Number(a.qty) || 0), 0)} unit
        </div>

        <div id="room-asset-items">
          ${filteredCategoryAssets.length ? filteredCategoryAssets.map((item) => {
            const isExpanded = this.expandedCategoryId === item.id;
            const prefix = (item.id_barang || "KRSI.MFHL").replace(/\.\d+$/, "");
            const totalUnits = Math.max(Number(item.qty) || 1, 1);

            let unitsHtml = "";
            if (isExpanded) {
              const rows = [];
              for (let i = 1; i <= totalUnits; i++) {
                const unitNum = String(i).padStart(2, "0");
                const unitCode = totalUnits === 1 ? item.id_barang : `${prefix}.${unitNum}`;
                const openUnit = totalUnits === 1
                  ? `App.fnfOpenAsset('${item.id}')`
                  : `App.fnfOpenUnit('${item.id}', '${unitCode}', ${i}, ${totalUnits})`;
                rows.push(`
                  <button type="button" class="unit-item-row" onclick="${openUnit}">
                    <div class="unit-item-info">
                      <strong>${this.escapeHTML(unitCode)}</strong>
                      <small>${this.escapeHTML(item.nama_barang)} · Unit ${unitNum}/${String(totalUnits).padStart(2, "0")}</small>
                      <small class="unit-item-location">${this.escapeHTML(item.lokasi || `${gedungName} · ${floorName}`)} · ${this.escapeHTML(item.status || "Status belum diatur")}</small>
                    </div>
                    <span class="unit-chevron">›</span>
                  </button>
                `);
              }
              unitsHtml = `
                <div class="unit-dropdown-panel">
                  <div class="unit-dropdown-header">
                    <strong>${this.escapeHTML(item.nama_barang)}</strong>
                    <span>${this.escapeHTML(gedungName)} · ${this.escapeHTML(floorName)} · ${totalUnits} unit</span>
                  </div>
                  <div class="unit-items-container">
                    ${rows.join("")}
                  </div>
                </div>
              `;
            }

            return `
              <div style="margin-bottom: ${isExpanded ? '0' : '8px'};">
                <button type="button" class="asset-category-card ${isExpanded ? 'is-expanded' : ''}" data-category-id="${this.escapeHTML(item.id)}" aria-expanded="${isExpanded}" onclick="App.toggleCategoryExpand('${item.id}')">
                  <div class="room-icon-box">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"/></svg>
                  </div>
                  <div class="room-info-meta">
                    <strong>${this.escapeHTML(item.nama_barang)}</strong>
                    <small>${Number(item.qty) || 1} unit · ${item.kat && item.kat.includes("Furniture") ? "Perabot" : "Instalasi"}</small>
                  </div>
                  <span class="room-chevron-icon">›</span>
                </button>
                ${unitsHtml}
              </div>
            `;
          }).join("") : `<div class="card room-assets-empty">Belum ada aset yang terdaftar di ruangan ini.</div>`}
        </div>
      `;
      return;
    }

    // Level 1: Daftar Ruangan (02 · Beranda)
    const roomMap = {};
    for (const a of list) {
      const r = a.ruangan || "Tanpa Ruangan";
      const key = this.fnfRoomKey(a);
      if (!roomMap[key]) roomMap[key] = {
        key,
        ruangan: r,
        gedung: a.gedung || "-",
        lantai: this.getAssetFloor(a),
        lokasi: a.lokasi || "",
        area: a.area_penempatan || "",
        qty: 0
      };
      roomMap[key].qty += Number(a.qty) || 0;
    }
    this.rooms.forEach((roomEntry) => {
      if (this.selectedBuilding !== "Semua" && roomEntry.gedung !== this.selectedBuilding) return;
      const key = this.fnfRoomKey(roomEntry);
      if (!roomMap[key]) {
        roomMap[key] = {
          key,
          ruangan: roomEntry.name,
          gedung: roomEntry.gedung,
          lantai: this.normalizeFloorName(roomEntry.lantai),
          lokasi: `${roomEntry.gedung} · ${this.normalizeFloorName(roomEntry.lantai)}`,
          area: roomEntry.kode || roomEntry.name,
          qty: 0
        };
      }
    });

    bcEl.textContent = "";
    const roomsArr = Object.values(roomMap);
    if (!roomsArr.length) {
      contentEl.innerHTML = `<div class="card"><p style="font-size:12px; color:var(--text-muted); text-align:center;">Belum ada data aset untuk gedung ini.</p></div>`;
      return;
    }

    contentEl.innerHTML = roomsArr
      .map(
        (r) => `
        <button type="button" class="room-card" data-room-key="${this.escapeHTML(r.key)}">
          <div class="room-icon-box">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 21h18M5 21V6l7-3 7 3v15M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4"/>
            </svg>
          </div>
          <div class="room-info-meta">
            <strong>${this.escapeHTML(r.ruangan)}</strong>
            <small>${this.escapeHTML(r.gedung)} · ${this.escapeHTML(r.lantai)} · ${r.qty.toLocaleString("id-ID")} aset</small>
          </div>
          <span class="room-chevron-icon">›</span>
        </button>`
      )
      .join("");
  },

  toggleCategoryExpand(catId) {
    if (this.expandedCategoryId === catId) {
      this.expandedCategoryId = null;
      const trigger = [...document.querySelectorAll(".asset-category-card")]
        .find((button) => button.dataset.categoryId === catId);
      const panel = trigger && trigger.parentElement.querySelector(".unit-dropdown-panel");
      if (trigger) {
        trigger.classList.remove("is-expanded");
        trigger.setAttribute("aria-expanded", "false");
      }
      if (panel) {
        panel.classList.add("is-closing");
        window.setTimeout(() => this.renderFNF(), 180);
      } else {
        this.renderFNF();
      }
    } else {
      this.expandedCategoryId = catId;
      this.renderFNF();
    }
  },

  fnfOpenUnit(assetId, unitCode, unitNumber, totalUnits) {
    this.selectedUnitCode = unitCode;
    const tot = totalUnits || 60;
    this.selectedUnitSeq = `${String(unitNumber).padStart(2, '0')}/${String(tot).padStart(2, '0')}`;
    this.fnfOpenAsset(assetId);
  },

  filterRoomByCategory(cat) {
    this.roomCategoryFilter = cat;
    this.renderFNF();
  },

  filterRoomAssets(term) {
    const q = (term || "").toLowerCase();
    const items = document.querySelectorAll("#room-asset-items .asset-category-card");
    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.parentElement.style.display = text.includes(q) ? "block" : "none";
    });
  },

  fnfOpenRoom(roomKey) {
    this.roomCategoryFilter = "Semua";
    this.expandedCategoryId = null;
    this.fnfState = { room: roomKey, categoryName: null, selectedAssetId: null };
    this.renderFNF();
  },

  fnfOpenCategory(encodedCat) {
    this.fnfState.categoryName = decodeURIComponent(encodedCat);
    this.fnfState.selectedAssetId = null;
    this.renderFNF();
  },

  fnfOpenAsset(assetId) {
    this.fnfState.selectedAssetId = assetId;
    this.renderFNF();
  },

  openSearchAsset(assetId, unitCode = null) {
    const asset = this.assets.find((item) => item.id === assetId);
    if (!asset) return;
    this.selectedBuilding = asset.gedung || "Semua";
    this.selectedUnitCode = unitCode && unitCode !== asset.id_barang ? unitCode : null;
    const unitNumber = this.selectedUnitCode ? Number(this.selectedUnitCode.split(".").pop()) : 0;
    this.selectedUnitSeq = unitNumber ? `${String(unitNumber).padStart(2, "0")}/${String(asset.qty).padStart(2, "0")}` : null;
    this.fnfState = {
      room: this.fnfRoomKey(asset),
      categoryName: asset.nama_barang,
      selectedAssetId: asset.id
    };
    this.switchTab("tab-dashboard");
    this.renderBuildingFilter();
    this.renderDashboardStats();
    this.renderFNF();
  },

  fnfBackToCategory() {
    this.fnfState.selectedAssetId = null;
    this.selectedUnitCode = null;
    this.selectedUnitSeq = null;
    this.renderFNF();
  },

  fnfBackToRoom() {
    this.fnfState.categoryName = null;
    this.fnfState.selectedAssetId = null;
    this.selectedUnitCode = null;
    this.selectedUnitSeq = null;
    this.expandedCategoryId = null;
    this.renderFNF();
  },

  fnfReset() {
    this.selectedUnitCode = null;
    this.selectedUnitSeq = null;
    this.expandedCategoryId = null;
    this.fnfState = { room: null, categoryName: null, selectedAssetId: null };
    this.renderFNF();
  },

  // 04 · Detail aset
  renderAssetDetailCard(asset) {
    const isAdmin = this.currentUser && this.currentUser.role === "admin";
    const ageText = this.calculateAssetAge(asset.tanggal_pembelian);
    const unitCode = this.selectedUnitCode || asset.id_barang || "PRYT.MFHL.01";
    const unitSeq = this.selectedUnitSeq || (asset.qty > 1 ? `01/${String(asset.qty).padStart(2, '0')}` : "1 unit");
    const baseCode = asset.kode || `INV.SRPS.61.213.0226.${unitCode}.0001`;
    const fullBarcodeCode = this.selectedUnitCode
      ? baseCode.replace(/\.\d{4}$/, `.${String(this.selectedUnitSeq.split("/")[0]).padStart(4, "0")}`)
      : baseCode;
    const code39Text = this.escapeHTML(ScanService.formatCode39(fullBarcodeCode));
    const latestScan = (asset.scanHistory || [])[0];
    const purchaseDate = this.formatAssetDate(asset.tanggal_pembelian);
    const todayDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    return `
      <div class="asset-detail-card">
        ${asset.foto_barang ? `
          <div class="asset-photo-container">
            <img src="${asset.foto_barang}" alt="${asset.nama_barang}" class="asset-photo-img" />
            <span class="asset-photo-tag">Dokumentasi</span>
          </div>
        ` : `
          <div class="asset-photo-placeholder">
            <div class="placeholder-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/>
                <path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"/>
              </svg>
            </div>
            <div class="placeholder-title">${asset.nama_barang}</div>
            <div class="placeholder-subtitle">Foto bukti fisik belum diunggah</div>
          </div>
        `}

        <div class="asset-header-row">
          <h2 class="asset-header-name">${asset.nama_barang}</h2>
          <span class="status-badge status-${asset.status}">${asset.status}</span>
        </div>
        <div class="asset-header-code">${unitCode} · ${unitSeq}</div>

        <!-- Label Barcode Resmi 2-Panel Sesuai Gambar UPITRA (Item 3) -->
        <div class="official-barcode-label">
          <div class="label-left-brand">
            <img src="img/logo-upitra.png" alt="UPITRA" class="label-brand-logo" />
            <div class="label-brand-name">UNIVERSITAS<br>PIGNATELLI TRIPUTRA</div>
          </div>
          <div class="label-right-content">
            <div class="label-barcode-bars">${code39Text}</div>
            <div class="label-code-text">${this.escapeHTML(fullBarcodeCode)}</div>
          </div>
        </div>

        <div class="section-heading" style="margin-top:14px; margin-bottom:8px;">
          <h2>Informasi aset</h2>
        </div>

        <div class="info-grid">
          <div class="info-grid-item">
            <label>Nama barang</label>
            <strong>${asset.nama_barang}</strong>
          </div>
          <div class="info-grid-item">
            <label>Qty unit ini</label>
            <strong>${this.selectedUnitCode ? `${this.selectedUnitSeq}` : `${asset.qty} unit`}</strong>
          </div>
          <div class="info-grid-item">
            <label>Lokasi</label>
            <strong>${asset.lokasi || `${asset.gedung || "Gedung 6"} · Lantai 1`}</strong>
          </div>
          <div class="info-grid-item">
            <label>Area penempatan</label>
            <strong>${asset.ruangan || asset.area_penempatan || "Multi Function Hall"}</strong>
          </div>
          <div class="info-grid-item">
            <label>Tanggal pembelian</label>
            <strong>${purchaseDate}</strong>
          </div>
          <div class="info-grid-item">
            <label>Biro pemilik</label>
            <strong>${asset.biro || "Sarana dan Prasarana"}</strong>
          </div>
          <div class="info-grid-item info-grid-full">
            <label>Kategori akun keuangan (KAT)</label>
            <strong>${asset.kat || "61 - Fixed Assets Installation (DC)"}</strong>
          </div>
        </div>

        <!-- Usia Aset Timeline Horizontal (Item 5) -->
        <div class="age-timeline-card">
          <div class="age-timeline-header">
            <div class="age-timeline-badge">
              <span> Usia aset: ${ageText}</span>
            </div>
          </div>
          <div class="age-timeline-track">
            <div class="age-timeline-node"></div>
            <div class="age-timeline-line"></div>
            <div class="age-timeline-node"></div>
          </div>
          <div class="age-timeline-labels">
            <span class="age-timeline-start">${purchaseDate}</span>
            <span class="age-timeline-end">Hari ini · ${todayDate}</span>
          </div>
        </div>

        <div class="section-heading" style="margin-top:14px; margin-bottom:6px;">
          <h2>Terakhir dipindai</h2>
        </div>
        <div class="scan-history-box">
          <svg class="scan-history-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 4H5a1 1 0 0 0-1 1v3m12-4h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m12-4v3a1 1 0 0 1-1 1h-3M8 8h8v8H8z"/>
          </svg>
          <div>
            <strong style="font-size:11px; display:block;">${latestScan ? `${latestScan.scannedBy} · ${latestScan.scannerRole}` : "Belum pernah dipindai"}</strong>
            <small style="font-size:10px; color:var(--text-muted);">${latestScan ? `${new Date(latestScan.scannedAt).toLocaleString("id-ID")} · ${latestScan.location || asset.ruangan || ""}` : "Riwayat pemindaian akan tampil di sini."}</small>
          </div>
        </div>

        <div class="asset-actions-row">
          <button type="button" class="btn btn-outline-primary" onclick="App.reportFromAssetCurrent()">Laporkan kondisi</button>
          <button type="button" class="btn btn-primary" onclick="App.openPrintLabel('${asset.id}')">Cetak label</button>
        </div>

        ${isAdmin ? `
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button type="button" class="btn btn-secondary" style="flex:1;" onclick="App.editAsset('${asset.id}')">Edit aset</button>
            <button type="button" class="btn btn-danger" style="flex:1;" onclick="App.deleteAsset('${asset.id}')">Hapus aset</button>
          </div>
        ` : ""}
      </div>
    `;
  },

  reportFromAssetCurrent() {
    const asset = this.assets.find(a => a.id === this.fnfState.selectedAssetId);
    if (!asset) return;
    this.reportFromAsset(asset);
  },

  populateSearchRooms() {
    const sel = document.getElementById("search-room-filter");
    if (!sel) return;
    const current = sel.value;
    const roomsByKey = new Map(
      this.assets
        .filter((asset) => asset.ruangan)
        .map((asset) => [this.fnfRoomKey(asset), asset])
    );
    this.rooms.forEach((room) => {
      const key = this.fnfRoomKey(room);
      if (!roomsByKey.has(key)) roomsByKey.set(key, room);
    });
    sel.innerHTML =
      `<option value="">Semua Ruangan</option>` +
      [...roomsByKey].map(([key, room]) => {
        const value = encodeURIComponent(key);
        const label = `${room.ruangan || room.name} · ${room.gedung} · ${room.lantai || this.getAssetFloor(room)}`;
        return `<option value="${value}" ${value === current ? "selected" : ""}>${this.escapeHTML(label)}</option>`;
      }).join("");
  },

  renderSearchHistory() {
    const el = document.getElementById("search-history-list");
    if (!el) return;
    el.innerHTML =
      this.searchHistory
        .map(
          (term) =>
            `<div style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;" onclick="App.applyHistorySearch('${term.replace(/'/g, "\\'")}')">
              <svg style="width:14px; height:14px; stroke:var(--text-muted); fill:none; stroke-width:2;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style="font-size:11px; color:var(--text-main);">${term}</span>
            </div>`
        )
        .join("") || `<span style="font-size:10px; color:var(--text-muted);">Belum ada riwayat pencarian.</span>`;
  },

  applyHistorySearch(term) {
    document.getElementById("search-input").value = term;
    this.renderSearchResults(term, document.getElementById("search-room-filter").value);
  },

  // 05 · Pencarian
  renderSearchResults(query, roomFilter) {
    this.renderSearchHistory();
    const q = (query || "").trim().toLowerCase();
    const resEl = document.getElementById("search-results");
    if (!resEl) return;

    const filtered = this.assets.filter((a) => {
      const matchRoom = !roomFilter || this.fnfRoomKey(a) === decodeURIComponent(roomFilter);
      const haystack = `${a.nama_barang} ${a.area_penempatan} ${a.ruangan} ${a.lokasi} ${a.kode} ${a.id_barang}`.toLowerCase();
      const matchQuery = !q || haystack.includes(q);
      return matchRoom && matchQuery;
    });

    document.getElementById("search-count").textContent = `${filtered.length} aset ditemukan`;

    resEl.innerHTML = filtered.length
      ? filtered.map((item) => `
        <div class="card" onclick="App.openSearchAsset('${item.id}')" style="cursor:pointer; display:flex; align-items:center; gap:12px; padding:12px 14px;">
          <div class="room-icon-box">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"/></svg>
          </div>
          <div style="flex:1;">
            <div style="font-size:13px; font-weight:700; color:var(--text-main);">${item.nama_barang}</div>
            <div style="font-size:10px; color:var(--text-muted);">${item.id_barang}</div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${item.ruangan} · ${item.gedung ? item.gedung.replace("Gedung ", "Gd. ") : "Gd. 6"}</div>
          </div>
          <div style="text-align:right;">
            <span class="status-badge status-${item.status}">${item.status}</span>
          </div>
          <span class="room-chevron-icon" style="margin-left:4px;">›</span>
        </div>`
      ).join("")
      : `<div class="card" style="text-align:center; color:var(--text-muted); font-size:11px; padding:20px;">Tidak ada aset yang sesuai kata kunci.</div>`;
  },

  // 06 · Scan barcode hasil
  renderScanResult(res) {
    const box = document.getElementById("scan-result-box");
    if (!box) return;
    if (!res.found) {
      box.innerHTML = `<div class="card"><p style="color:var(--danger); font-size:12px; font-weight:600; text-align:center;">${res.message}</p></div>`;
      return;
    }
    box.innerHTML = `
      <div class="scan-result-card">
        <div class="scan-result-header">
          <div class="scan-check-icon">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span>Barcode berhasil ditemukan</span>
        </div>
        <div style="margin-top:6px;">
          <h3 style="font-size:14px; font-weight:800; color:var(--text-main);">${this.escapeHTML(res.asset.nama_barang)}</h3>
          <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">ID barang: ${this.escapeHTML(res.expectedOutputId)} · ${this.escapeHTML(res.asset.ruangan || "")}</div>
          <div style="font-size:9px; color:var(--text-muted); margin-top:4px;">Pemindai: ${this.escapeHTML(this.currentUser ? this.currentUser.name : "")} · ${new Date().toLocaleString("id-ID")}</div>
        </div>
      </div>
      <button type="button" class="btn btn-primary" style="width:100%; margin-top:10px; min-height:44px;" onclick="App.openSearchAsset('${res.asset.id}', '${this.escapeHTML(res.expectedOutputId)}')">Lihat detail aset</button>
    `;
  },

  reportFromAsset(assetOrRoom, code) {
    this.switchTab("tab-reports");
    let asset = null;
    if (typeof assetOrRoom === "object" && assetOrRoom !== null) {
      asset = assetOrRoom;
    } else if (typeof assetOrRoom === "string") {
      asset = this.assets.find(a => (a.kode === code || a.id_barang === code || a.id === code || a.ruangan === assetOrRoom));
      if (!asset) {
        asset = {
          ruangan: assetOrRoom || "Multi Function Hall",
          id_barang: code || "PRYT.MFHL.02",
          nama_barang: "Proyektor",
          gedung: "Gedung 6",
          area_penempatan: assetOrRoom || "Multi Function Hall",
          foto_barang: ""
        };
      }
    }

    if (asset) {
      const rEl = document.getElementById("report-room");
      const idEl = document.getElementById("report-asset-id");
      const itemIdEl = document.getElementById("report-asset-item-id");
      const cEl = document.getElementById("report-asset-code");
      const nEl = document.getElementById("report-asset-name");
      const lEl = document.getElementById("report-asset-location");
      const aEl = document.getElementById("report-asset-area");
      const pEl = document.getElementById("report-asset-photo");

      if (rEl) rEl.value = asset.ruangan || "Multi Function Hall";
      if (idEl) idEl.value = asset.id || "";
      if (itemIdEl) itemIdEl.value = this.selectedUnitCode || asset.id_barang || "";
      const unitNumber = this.selectedUnitSeq ? Number(this.selectedUnitSeq.split("/")[0]) : 0;
      const fullCode = asset.kode && unitNumber
        ? asset.kode.replace(/\.\d{4}$/, `.${String(unitNumber).padStart(4, "0")}`)
        : asset.kode || "";
      if (cEl) cEl.value = fullCode;
      if (nEl) nEl.value = asset.nama_barang || "";
      if (lEl) lEl.value = asset.lokasi || `${asset.gedung || "Gedung 6"} · Lantai 1`;
      if (aEl) aEl.value = asset.area_penempatan || asset.ruangan || "Multi Function Hall";
      if (pEl) pEl.value = asset.foto_barang || "";

      // Show attached asset banner
      const banner = document.getElementById("report-attached-asset-banner");
      const nameEl = document.getElementById("report-attached-name");
      const metaEl = document.getElementById("report-attached-meta");
      const iconEl = document.getElementById("report-attached-icon");
      document.getElementById("report-context-room-title").textContent = asset.ruangan || "Laporan aset";
      document.getElementById("report-context-room-sub").textContent = asset.lokasi || `${asset.gedung || "Gedung 6"} · Lantai 1`;
      if (banner && nameEl && metaEl) {
        nameEl.textContent = asset.nama_barang || "Aset Terkait";
        metaEl.textContent = `${this.selectedUnitCode || asset.id_barang || ""} · ${fullCode}`;
        if (iconEl) {
          iconEl.innerHTML = asset.foto_barang
            ? `<img src="${this.escapeHTML(asset.foto_barang)}" alt="" style="width:36px;height:36px;border-radius:6px;object-fit:cover;" />`
            : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"/></svg>`;
        }
        banner.classList.remove("hidden");
      }
    }
  },

  clearReportAttachedAsset() {
    const banner = document.getElementById("report-attached-asset-banner");
    if (banner) banner.classList.add("hidden");
    const idEl = document.getElementById("report-asset-id");
    const itemIdEl = document.getElementById("report-asset-item-id");
    const cEl = document.getElementById("report-asset-code");
    const nEl = document.getElementById("report-asset-name");
    const lEl = document.getElementById("report-asset-location");
    const aEl = document.getElementById("report-asset-area");
    const pEl = document.getElementById("report-asset-photo");
    if (idEl) idEl.value = "";
    if (itemIdEl) itemIdEl.value = "";
    if (cEl) cEl.value = "";
    if (nEl) nEl.value = "";
    if (lEl) lEl.value = "";
    if (aEl) aEl.value = "";
    if (pEl) pEl.value = "";
  },

  filterAdminReports(filter) {
    this.adminReportsFilter = filter;
    ["all", "pending", "handled"].forEach(f => {
      const btn = document.getElementById(`filter-rep-${f}`);
      if (btn) btn.classList.toggle("active", f === filter);
    });
    this.renderReportsTimeline();
  },

  openAdminReportChat(reportId) {
    this.adminActiveReportId = reportId;
    this.renderReportsTimeline();
  },

  backToAdminReportList() {
    this.adminActiveReportId = null;
    this.renderReportsTimeline();
  },

  // 07 · Laporan saya & Admin Inbox
  renderReportsTimeline() {
    const timelineEl = document.getElementById("reports-timeline");
    const adminListView = document.getElementById("admin-reports-view");
    const chatView = document.getElementById("report-chat-view");
    const adminBackBar = document.getElementById("admin-chat-back-bar");
    const composer = document.getElementById("report-compose-card");
    const adminComposer = document.getElementById("admin-reply-compose");
    const isAdmin = this.currentUser && this.currentUser.role === "admin";

    if (isAdmin && !this.adminActiveReportId) {
      if (composer) composer.classList.add("hidden");
      if (adminComposer) adminComposer.classList.add("hidden");
      if (adminListView) adminListView.classList.remove("hidden");
      if (chatView) chatView.classList.add("hidden");

      const listContainer = document.getElementById("admin-reports-list");
      if (!listContainer) return;

      let filteredReports = [...this.reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (this.adminReportsFilter === "pending") {
        filteredReports = filteredReports.filter(r => !r.feedback);
      } else if (this.adminReportsFilter === "handled") {
        filteredReports = filteredReports.filter(r => !!r.feedback);
      }

      if (filteredReports.length === 0) {
        listContainer.innerHTML = `<div class="card" style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">Tidak ada laporan pada kategori ini.</div>`;
        return;
      }

      listContainer.innerHTML = filteredReports.map(r => {
        const isHandled = !!r.feedback;
        const timeStr = r.createdAt
          ? new Date(r.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
          : "";
        const itemId = this.escapeHTML(r.assetItemId || "");
        const assetName = this.escapeHTML(r.assetName || "Laporan umum");
        return `
          <div class="admin-report-card" onclick="App.openAdminReportChat('${r.id}')">
            <div class="admin-report-header">
              <span class="admin-report-sender">${this.escapeHTML(r.senderName || "Pengguna")}</span>
              <span class="admin-report-time">${timeStr}</span>
            </div>
            ${r.assetName || r.assetCode ? `
              <div class="admin-report-asset-badge">
                ${assetName} ${itemId ? `· ${itemId}` : ""}
              </div>
            ` : ''}
            <div class="admin-report-snippet">
              "${this.escapeHTML(r.message || "")}"
            </div>
            <div class="admin-report-footer">
              <span>${this.escapeHTML(r.room || "Lokasi tidak dicantumkan")}</span>
              <span class="status-badge ${isHandled ? 'status-Baik' : 'status-Maintenance'}">
                ${isHandled ? 'Ditangani' : 'Perlu Ditangani'}
              </span>
            </div>
          </div>
        `;
      }).join("");

      return;
    }

    if (adminListView) adminListView.classList.add("hidden");
    if (chatView) chatView.classList.remove("hidden");
    if (composer) composer.classList.toggle("hidden", Boolean(isAdmin));
    const activeReport = isAdmin
      ? this.reports.find((report) => report.id === this.adminActiveReportId)
      : null;
    if (adminComposer) {
      adminComposer.classList.toggle("hidden", !isAdmin || !activeReport || Boolean(activeReport.feedback));
    }
    if (adminBackBar) {
      if (isAdmin && this.adminActiveReportId) {
        adminBackBar.classList.remove("hidden");
      } else {
        adminBackBar.classList.add("hidden");
      }
    }

    if (!timelineEl) return;

    const targetReports = (isAdmin
      ? this.reports.filter((report) => report.id === this.adminActiveReportId)
      : this.reports.filter((report) => report.senderUid === this.currentUser.uid))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (isAdmin && !targetReports.length) {
      timelineEl.innerHTML = `<div class="card" role="status">Laporan tidak ditemukan atau sudah tidak tersedia.</div>`;
      return;
    }

    const contextReport = targetReports[targetReports.length - 1];
    if (contextReport) {
      document.getElementById("report-context-room-title").textContent =
        contextReport.room || "Laporan aset";
      document.getElementById("report-context-room-sub").textContent =
        contextReport.assetLocation || "Percakapan pribadi dengan Admin";
    }

    let chatHtml = "";

    targetReports.forEach((r) => {
      const timeStr = r.createdAt
        ? new Date(r.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
        : "";
      const photo = r.assetPhoto
        ? `<img src="${this.escapeHTML(r.assetPhoto)}" class="chat-structured-thumb" alt="Foto ${this.escapeHTML(r.assetName || "aset")}" />`
        : `<div class="chat-structured-placeholder" aria-label="Foto barang belum tersedia"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"/></svg></div>`;
      const assetDetails = r.assetName || r.assetItemId || r.assetCode
        ? `<div class="chat-structured-asset">
            ${photo}
            <div class="chat-structured-meta">
              <strong class="chat-structured-name">${this.escapeHTML(r.assetName || "Aset terdata")}</strong>
              <small class="chat-structured-code">ID barang: ${this.escapeHTML(r.assetItemId || "-")}</small>
              <small class="chat-structured-code">Kode: ${this.escapeHTML(r.assetCode || "-")}</small>
              <span class="chat-structured-loc">Lokasi: ${this.escapeHTML(r.assetLocation || "-")}</span>
              <span class="chat-structured-loc">Area: ${this.escapeHTML(r.assetArea || r.room || "-")}</span>
            </div>
          </div>`
        : "";
      chatHtml += `
        <div class="chat-bubble-user" style="margin-top:12px;">
          <div class="chat-meta">${this.escapeHTML(r.senderName || "Pengguna")} · ${timeStr}</div>
          ${assetDetails}
          <div class="chat-text-note">${this.escapeHTML(r.message)}</div>
        </div>

        ${r.feedback ? `
          <div class="chat-bubble-admin" style="margin-top:8px;">
            <div class="chat-meta">Admin Sarpras · ${r.feedbackAt ? new Date(r.feedbackAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
            <div class="chat-text">${this.escapeHTML(r.feedback)}</div>
            <div style="margin-top:6px;">
              <span class="status-badge status-Baik">Telah Ditanggapi</span>
            </div>
          </div>
        ` : ""}
      `;
    });

    timelineEl.innerHTML = chatHtml ||
      `<div class="card report-empty-state">Belum ada laporan. Pilih detail aset atau tulis laporan untuk menghubungi Admin.</div>`;
  },

  async sendFeedback(reportId) {
    if (!this.currentUser || this.currentUser.role !== "admin") return;
    const input = document.getElementById("admin-reply-message");
    const val = input ? input.value.trim() : "";
    if (!val) return;
    const report = this.reports.find((item) => item.id === reportId);
    if (!report) return;
    const previousFeedback = report.feedback;
    const previousFeedbackAt = report.feedbackAt;
    report.feedback = val;
    report.feedbackAt = new Date().toISOString();
    try {
      await SyncService.saveFeedback(report);
    } catch (err) {
      report.feedback = previousFeedback;
      report.feedbackAt = previousFeedbackAt;
      alert(`Balasan gagal disimpan: ${err.message}`);
      this.renderReportsTimeline();
      return;
    }
    if (input) input.value = "";
    this.renderReportsTimeline();
  },

  // 08 · Profil pengguna
  renderProfile() {
    const u = this.currentUser || { name: "Bima Sakti", email: "bima@upt.ac.id", unit: "Fakultas Ekonomi dan Bisnis", role: "user" };
    const cardEl = document.getElementById("profile-card");
    if (!cardEl) return;
    const loginHistory = (u.loginHistory || []).map((entry) => `
      <div class="login-history-item">
        <svg class="login-history-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div>
          <div class="login-history-text">${new Date(entry.timestamp).toLocaleString("id-ID")}</div>
          <div class="login-history-device">${this.escapeHTML(entry.device || "Perangkat")}</div>
        </div>
      </div>
    `).join("") || `<div class="topbar-sub">Belum ada riwayat masuk.</div>`;

    cardEl.innerHTML = `
      <div class="profile-card-header">
        <img src="img/logo-upitra.png" alt="UPITRA" class="profile-avatar-logo" />
        <div class="profile-header-meta">
          <h2 class="profile-name">${u.name || "Bima Sakti"}</h2>
          <div class="profile-email">${u.email || "bima@upt.ac.id"}</div>
          <span class="profile-role-badge">${u.role === "admin" ? "Admin" : "Pengguna"}</span>
        </div>
      </div>
      <div class="profile-unit-text">Unit: ${u.unit || "Fakultas Ekonomi dan Bisnis"}</div>

      <div class="profile-access-card" style="margin-top:14px;">
        <svg class="profile-access-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
        </svg>
        <div class="profile-access-body">
          <strong>Akses pengguna</strong>
          <p>Lihat aset, scan, dan kirim laporan.<br>Perubahan data dilakukan oleh admin.</p>
        </div>
      </div>

      <div class="login-history-group">
        <div class="login-history-title">Riwayat masuk</div>
        <div class="card" style="padding:10px 14px; margin-bottom:0;">
          ${loginHistory}
        </div>
      </div>
      <p class="admin-footnote" style="margin-top:10px;">Akun dibuat dan dikelola oleh admin Sarpras.</p>
    `;
  },

  // 12 · Kelola akun pengguna (Admin)
  async renderManagedUsers() {
    try {
      const users = await AuthService.getAllUsers();
      const searchEl = document.getElementById("managed-users-search");
      const term = searchEl ? searchEl.value.trim().toLowerCase() : "";
      const roleFilter = this.managedUserRoleFilter;

      const filtered = users.filter((u) => {
        const matchesRole = !roleFilter || u.role === roleFilter;
        const matchesTerm = `${u.name} ${u.email}`.toLowerCase().includes(term);
        return matchesRole && matchesTerm;
      });

      const totalCount = users.length;
      const adminCount = users.filter(u => u.role === "admin").length;
      const userCount = users.filter(u => u.role === "user").length;

      document.getElementById("account-total").textContent = `${totalCount} akun aktif`;
      document.getElementById("account-users-detail").textContent = `${adminCount} admin · ${userCount} pengguna`;

      const listEl = document.getElementById("managed-users-list");
      if (!listEl) return;

      listEl.innerHTML = filtered.map((u) => `
        <div class="managed-user-item">
          <div class="managed-user-meta">
            <strong>${u.name || u.email}</strong>
            <small>${u.email}</small>
            <span class="status-badge ${u.role === 'admin' ? 'status-Baik' : 'status-Hilang'}" style="margin-top:2px;">
              ${u.role === 'admin' ? 'Admin' : 'Pengguna'}
            </span>
          </div>
          <div class="inventory-item-actions">
            <button type="button" class="btn-icon-square btn-icon-edit" aria-label="Edit akun" onclick="App.prefillUserForm('${u.id}')">
              <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            ${u.id !== this.currentUser?.uid ? `
              <button type="button" class="btn-icon-square btn-icon-delete" aria-label="Hapus akun" onclick="App.removeUser('${u.id}')">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            ` : ""}
          </div>
        </div>
      `).join("");
    } catch (err) {
      console.warn("Gagal memuat pengguna:", err);
    }
  },

  openUserForm() {
    const form = document.getElementById("user-crud-form");
    if (form) form.reset();
    document.getElementById("managed-uid").value = "";
    document.getElementById("user-form-panel").open = true;
    document.getElementById("managed-name").focus();
  },

  async prefillUserForm(id) {
    const users = await AuthService.getAllUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return;
    document.getElementById("managed-uid").value = target.id;
    document.getElementById("managed-name").value = target.name || "";
    document.getElementById("managed-email").value = target.email || "";
    document.getElementById("managed-unit").value = target.unit || "";
    document.getElementById("managed-role").value = target.role || "user";
    document.getElementById("managed-password").value = "";
    document.getElementById("user-form-panel").open = true;
  },

  async removeUser(id) {
    if (!confirm("Hapus akun pengguna ini?")) return;
    await AuthService.deleteUserAccount(id);
    this.renderManagedUsers();
  },

  // 10 · Tambah aset
  openAddAsset() {
    if (!this.currentUser || this.currentUser.role !== "admin") return;
    const activeView = document.querySelector(".tab-view:not(.hidden)");
    this.assetFormReturnTab = activeView ? activeView.id : "tab-inventory";
    this.pendingAssetPhoto = null;
    const form = document.getElementById("asset-form");
    if (form) form.reset();
    document.getElementById("asset-doc-id").value = "";
    document.getElementById("asset-photo-status").textContent = "";
    document.getElementById("asset-photo-file").value = "";
    this.renderAssetLocationOptions({
      gedung: "Gedung 6",
      lokasi: "Gedung 6 · Lantai 1",
      ruangan: "Multi Function Hall"
    });
    this.updateAssetPhotoPreview("");
    this.switchTab("panel-asset-form");
  },

  editAsset(assetId) {
    if (!this.currentUser || this.currentUser.role !== "admin") return;
    const item = this.assets.find((a) => a.id === assetId);
    if (!item) return;
    this.assetFormReturnTab = "tab-inventory";
    this.pendingAssetPhoto = null;
    document.getElementById("asset-photo-status").textContent = "";
    document.getElementById("asset-photo-file").value = "";
    this.renderAssetLocationOptions(item);
    document.getElementById("asset-doc-id").value = item.id;
    document.getElementById("f-nama").value = item.nama_barang || "";
    document.getElementById("f-id-barang").value = item.id_barang || "";
    document.getElementById("f-kode").value = item.kode || "";
    document.getElementById("f-kat").value = item.kat || "";
    document.getElementById("f-qty").value = item.qty || 1;
    document.getElementById("f-foto-url").value = item.foto_barang || "";
    this.updateAssetPhotoPreview(item.foto_barang || "");
    document.getElementById("f-biro").value = item.biro || "Sarana dan Prasarana";
    document.getElementById("f-tgl").value = item.tanggal_pembelian || "";
    document.getElementById("f-status").value = item.status || "Baik";
    document.getElementById("preview-auto-id").textContent = item.id_barang;
    document.getElementById("preview-auto-fullcode").textContent = item.kode;

    const chipSelector = document.getElementById("status-chip-selector");
    if (chipSelector) {
      chipSelector.querySelectorAll(".status-chip").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.val === item.status);
      });
    }
    this.switchTab("panel-asset-form");
  },

  async deleteAsset(assetId) {
    if (!this.currentUser || this.currentUser.role !== "admin") return;
    if (!confirm("Hapus data aset ini?")) return;
    const deletedAsset = this.assets.find((asset) => asset.id === assetId);
    if (!deletedAsset) {
      alert("Data aset tidak ditemukan.");
      return;
    }
    this.assets = this.assets.filter((a) => a.id !== assetId);
    try {
      await SyncService.deleteAsset(assetId);
    } catch (error) {
      this.assets.push(deletedAsset);
      alert(`Aset tidak dapat dihapus: ${error.message}`);
      return;
    }
    this.persistAssets();
    this.renderInventory();
    this.renderBuildingFilter();
    this.renderAssetLocationOptions();
    this.renderDashboardStats();
    this.renderFNF();
    this.renderRoomManagement();
  },

  closeAssetForm() {
    this.pendingAssetPhoto = null;
    document.getElementById("asset-photo-status").textContent = "";
    this.switchTab(this.assetFormReturnTab || "tab-inventory");
  },

  // 11 · Cetak label
  openPrintLabel(assetId) {
    const asset = this.assets.find((a) => a.id === assetId);
    if (!asset) return;
    this.activeLabelAsset = asset;
    this.activeLabelUnitCode = this.fnfState.selectedAssetId === assetId ? this.selectedUnitCode : null;
    this.labelReturnTab = "tab-dashboard";

    document.getElementById("print-selected-title").textContent = `1 aset · ${asset.nama_barang}`;
    document.getElementById("print-selected-sub").textContent = asset.id_barang;
    document.getElementById("preview-pager-badge").textContent = "1 dari 1";

    this.renderStickerPreview();
    this.switchTab("panel-print-label");
  },

  openBatchPrintLabel() {
    this.activeLabelAsset = this.assets[0] || null;
    this.activeLabelUnitCode = null;
    this.labelReturnTab = "tab-inventory";

    document.getElementById("print-selected-title").textContent = `2 aset · Proyektor`;
    document.getElementById("print-selected-sub").textContent = `PRYT.MFHL.01 - PRYT.MFHL.02`;
    document.getElementById("preview-pager-badge").textContent = "1 dari 2";

    this.renderStickerPreview();
    this.switchTab("panel-print-label");
  },

  updateLabelSize() {
    this.renderStickerPreview();
  },

  renderStickerPreview() {
    const asset = this.activeLabelAsset || this.assets[0] || { nama_barang: "Proyektor", id_barang: "PRYT.MFHL.01", kode: "INV.SRPS.61.213.0226.PRYT.MFHL.0001" };
    const itemId = this.activeLabelUnitCode || asset.id_barang;
    const unitNumber = this.activeLabelUnitCode
      ? Number(this.activeLabelUnitCode.split(".").pop())
      : 0;
    const inventoryCode = unitNumber && asset.kode
      ? asset.kode.replace(/\.\d{4}$/, `.${String(unitNumber).padStart(4, "0")}`)
      : asset.kode || "";
    const code39Text = this.escapeHTML(ScanService.formatCode39(inventoryCode));
    const size = document.getElementById("label-size-select").value;

    document.getElementById("sticker-preview-container").innerHTML = `
      <div class="official-barcode-label sticker-card" data-size="${this.escapeHTML(size)}">
        <div class="label-left-brand">
          <img src="img/logo-upitra.png" alt="UPITRA" class="label-brand-logo" />
          <div class="label-brand-name">UNIVERSITAS<br>PIGNATELLI TRIPUTRA</div>
        </div>
        <div class="label-right-content">
          <div class="label-barcode-bars">${code39Text}</div>
          <div class="label-code-text">${this.escapeHTML(inventoryCode)}</div>
        </div>
      </div>
    `;
  },

  closePrintLabel() {
    this.switchTab(this.labelReturnTab || "tab-dashboard");
  }
};

if (window.cordova) {
  document.addEventListener("deviceready", () => {
    const platform = window.cordova.platformId || "unknown";
    console.info("[Cordova] Siap.", {
      platform,
      version: window.cordova.version || "unknown"
    });
    console.info(FirebaseService.ready
      ? "[Integrasi] Firebase dan Cordova siap."
      : "[Integrasi] Cordova siap; Firebase belum siap.");
  }, { once: true });
} else {
  console.info("[Cordova] Tidak terdeteksi; aplikasi berjalan di browser.");
}

document.addEventListener("DOMContentLoaded", () => App.init());

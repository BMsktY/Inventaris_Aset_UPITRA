const SyncService = {
  subscriptions: [],
  collections: {
    assets: "assets",
    rooms: "rooms",
    buildings: "buildings",
    reports: "reports",
    scans: "scans"
  },

  get firebaseEnabled() {
    return FirebaseService.ready;
  },

  async loadInitialData() {
    if (!this.firebaseEnabled) {
      return {
        assets: null,
        rooms: null,
        buildings: null,
        reports: null,
        cloudEmpty: false
      };
    }

    const reportsQuery = App.currentUser.role === "admin"
      ? FirebaseService.db.collection(this.collections.reports)
      : FirebaseService.db.collection(this.collections.reports).where("senderUid", "==", App.currentUser.uid);
    const [assetsSnapshot, roomsSnapshot, buildingsSnapshot, reportsSnapshot] = await Promise.all([
      FirebaseService.db.collection(this.collections.assets).get(),
      FirebaseService.db.collection(this.collections.rooms).get(),
      FirebaseService.db.collection(this.collections.buildings).get(),
      reportsQuery.get()
    ]);
    return {
      assets: assetsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      rooms: roomsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      buildings: buildingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      reports: reportsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      cloudEmpty: assetsSnapshot.empty && roomsSnapshot.empty
        && App.currentUser.role === "admin" && reportsSnapshot.empty
    };
  },

  subscribe({
    onAssets,
    onRooms = () => {},
    onBuildings = () => {},
    onReports,
    onScans = () => {},
    onError = console.error
  }) {
    this.unsubscribe();
    if (!this.firebaseEnabled) return;

    const db = FirebaseService.db;
    this.subscriptions = [
      db.collection(this.collections.assets).onSnapshot(
        (snapshot) => onAssets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
        onError
      ),
      db.collection(this.collections.rooms).onSnapshot(
        (snapshot) => onRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
        onError
      ),
      db.collection(this.collections.buildings).onSnapshot(
        (snapshot) => onBuildings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
        onError
      ),
      (App.currentUser.role === "admin"
        ? db.collection(this.collections.reports)
        : db.collection(this.collections.reports).where("senderUid", "==", App.currentUser.uid)).onSnapshot(
        (snapshot) => onReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
        onError
      )
    ];

    const scansQuery = App.currentUser.role === "admin"
      ? db.collection(this.collections.scans).orderBy("scannedAt", "desc").limit(500)
      : db.collection(this.collections.scans)
        .where("scannedByUid", "==", App.currentUser.uid)
        .orderBy("scannedAt", "desc")
        .limit(100);
    this.subscriptions.push(scansQuery.onSnapshot(
      (snapshot) => onScans(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      onError
    ));
  },

  unsubscribe() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
  },

  async saveAsset(asset) {
    if (this.firebaseEnabled) {
      const { id, scanHistory, lastScannedAt, lastScannedBy, ...data } = asset;
      await FirebaseService.db.collection(this.collections.assets).doc(id).set(data, { merge: true });
    }
    localStorage.setItem("sarpras_assets", JSON.stringify(App.assets));
  },

  async saveRoom(room) {
    if (this.firebaseEnabled) {
      const { id, ...data } = room;
      await FirebaseService.db.collection(this.collections.rooms).doc(id).set(data, { merge: true });
    }
    localStorage.setItem("sarpras_rooms", JSON.stringify(App.rooms));
  },

  async saveBuilding(building) {
    if (this.firebaseEnabled) {
      const { id, ...data } = building;
      await FirebaseService.db.collection(this.collections.buildings).doc(id).set(data, { merge: true });
    }
    localStorage.setItem("sarpras_buildings", JSON.stringify(App.buildings));
  },

  async deleteBuilding(buildingId) {
    if (this.firebaseEnabled) {
      await FirebaseService.db.collection(this.collections.buildings).doc(buildingId).delete();
    }
    localStorage.setItem("sarpras_buildings", JSON.stringify(App.buildings));
  },

  async renameBuilding(building, newName) {
    if (!this.firebaseEnabled) return;
    const db = FirebaseService.db;
    const [assetsSnapshot, roomsSnapshot] = await Promise.all([
      db.collection(this.collections.assets).where("gedung", "==", building.name).get(),
      db.collection(this.collections.rooms).where("gedung", "==", building.name).get()
    ]);
    const writes = assetsSnapshot.size + roomsSnapshot.size + 1;
    if (writes > 500) throw new Error("Gedung memiliki terlalu banyak data untuk diganti namanya sekaligus.");

    const batch = db.batch();
    assetsSnapshot.docs.forEach((doc) => {
      const asset = doc.data();
      const location = typeof asset.lokasi === "string" && asset.lokasi.startsWith(building.name)
        ? `${newName}${asset.lokasi.slice(building.name.length)}`
        : asset.lokasi;
      batch.update(doc.ref, { gedung: newName, ...(location ? { lokasi: location } : {}) });
    });
    roomsSnapshot.docs.forEach((doc) => batch.update(doc.ref, { gedung: newName }));
    batch.set(db.collection(this.collections.buildings).doc(building.id), {
      name: newName,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await batch.commit();
  },

  async renameFloor(building, oldFloor, newFloor, nextFloors) {
    if (!this.firebaseEnabled) return;
    const db = FirebaseService.db;
    const [assetsSnapshot, roomsSnapshot] = await Promise.all([
      db.collection(this.collections.assets).where("gedung", "==", building.name).get(),
      db.collection(this.collections.rooms).where("gedung", "==", building.name).get()
    ]);
    const normalizedFloor = (value) => {
      const text = String(value || "").trim().replace(/\s+/g, " ");
      return /^lantai\b/i.test(text) ? text.replace(/^lantai\b\s*/i, "Lantai ") : `Lantai ${text}`;
    };
    const assetFloor = (asset) => {
      if (asset.lantai) return normalizedFloor(asset.lantai);
      const match = String(asset.lokasi || "").match(/lantai\s*([^\s·,-]+)/i);
      return match ? normalizedFloor(match[1]) : "Lantai 1";
    };
    const assetDocs = assetsSnapshot.docs.filter((doc) => assetFloor(doc.data()) === oldFloor);
    const roomDocs = roomsSnapshot.docs.filter((doc) => normalizedFloor(doc.data().lantai) === oldFloor);
    if (assetDocs.length + roomDocs.length + 1 > 500) {
      throw new Error("Lantai memiliki terlalu banyak data untuk diperbarui sekaligus.");
    }

    const batch = db.batch();
    assetDocs.forEach((doc) => {
      const asset = doc.data();
      const location = typeof asset.lokasi === "string" && /lantai\s*[^·,-]+/i.test(asset.lokasi)
        ? asset.lokasi.replace(/lantai\s*[^·,-]+/i, newFloor)
        : `${building.name} · ${newFloor}`;
      batch.update(doc.ref, { lantai: newFloor, lokasi: location });
    });
    roomDocs.forEach((doc) => batch.update(doc.ref, { lantai: newFloor }));
    batch.set(db.collection(this.collections.buildings).doc(building.id), {
      floors: nextFloors,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await batch.commit();
  },

  async deleteAsset(assetId) {
    if (this.firebaseEnabled) {
      await FirebaseService.db.collection(this.collections.assets).doc(assetId).delete();
    }
    localStorage.setItem("sarpras_assets", JSON.stringify(App.assets));
  },

  async uploadAssetPhoto(dataUrl, assetId) {
    if (!this.firebaseEnabled) return dataUrl;
    if (!FirebaseService.storageReady) {
      throw new Error(FirebaseService.storageError
        ? FirebaseService.storageError.message
        : "Firebase Storage belum siap.");
    }

    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error("Foto aset tidak dapat dibaca untuk diunggah.");
    const imageBlob = await response.blob();
    const photoRef = FirebaseService.storage.ref(`asset-photos/${encodeURIComponent(assetId)}/photo.jpg`);
    const uploadedPhoto = await photoRef.put(imageBlob, { contentType: "image/jpeg" });
    return uploadedPhoto.ref.getDownloadURL();
  },

  async saveReport(report) {
    if (this.firebaseEnabled) {
      const { id, ...data } = report;
      await FirebaseService.db.collection(this.collections.reports).doc(id).set(data);
      localStorage.setItem("sarpras_reports", JSON.stringify(App.reports));
      return;
    }
    const savedReports = JSON.parse(localStorage.getItem("sarpras_reports") || "[]");
    const reportsById = new Map([...App.reports, ...savedReports].map((item) => [item.id, item]));
    reportsById.set(report.id, report);
    localStorage.setItem("sarpras_reports", JSON.stringify([...reportsById.values()]));
  },

  async saveFeedback(report) {
    if (this.firebaseEnabled) {
      await FirebaseService.db.collection(this.collections.reports).doc(report.id).update({
        feedback: report.feedback,
        feedbackAt: report.feedbackAt
      });
      localStorage.setItem("sarpras_reports", JSON.stringify(App.reports));
      return;
    }
    const savedReports = JSON.parse(localStorage.getItem("sarpras_reports") || "[]");
    const reportsById = new Map([...App.reports, ...savedReports].map((item) => [item.id, item]));
    reportsById.set(report.id, report);
    localStorage.setItem("sarpras_reports", JSON.stringify([...reportsById.values()]));
  },

  async recordScan(assetId, scanEntry) {
    if (!this.firebaseEnabled) {
      localStorage.setItem("sarpras_assets", JSON.stringify(App.assets));
      return;
    }
    await FirebaseService.db.collection(this.collections.scans).add({
      assetId,
      scannedByUid: App.currentUser.uid,
      scannedBy: scanEntry.scannedBy,
      scannerRole: scanEntry.scannerRole,
      scannedAt: scanEntry.scannedAt,
      rawInput: scanEntry.rawInput,
      matchedIdBarang: scanEntry.matchedIdBarang
    });
  },

  async migrateLocalData() {
    if (!this.firebaseEnabled) throw new Error("Firebase belum siap.");
    if (!App.currentUser || App.currentUser.role !== "admin") throw new Error("Hanya Admin yang dapat memindahkan data.");
    const assetsRef = FirebaseService.db.collection(this.collections.assets);
    const reportsRef = FirebaseService.db.collection(this.collections.reports);
    const roomsRef = FirebaseService.db.collection(this.collections.rooms);
    const [assetsSnapshot, roomsSnapshot, reportsSnapshot] = await Promise.all([
      assetsRef.limit(1).get(),
      roomsRef.limit(1).get(),
      reportsRef.limit(1).get()
    ]);
    if (!assetsSnapshot.empty || !roomsSnapshot.empty || !reportsSnapshot.empty) {
      throw new Error("Firebase sudah memiliki data. Pemindahan otomatis dibatalkan agar data cloud tidak tertimpa.");
    }

    const assets = App.localDataForMigration.assets;
    const rooms = App.localDataForMigration.rooms;
    const reports = App.localDataForMigration.reports;
    const entries = [
      ...assets.map((item) => ({ collection: this.collections.assets, data: item })),
      ...rooms.map((item) => ({ collection: this.collections.rooms, data: item })),
      ...reports.map((item) => ({ collection: this.collections.reports, data: item }))
    ];
    for (let offset = 0; offset < entries.length; offset += 450) {
      const batch = FirebaseService.db.batch();
      entries.slice(offset, offset + 450).forEach(({ collection, data }) => {
        const { id, scanHistory, lastScannedAt, lastScannedBy, statusBadge, ...fields } = data;
        if (!id) throw new Error(`Data ${collection} lokal tidak memiliki ID.`);
        const migratedFields = collection === this.collections.reports
          ? Object.fromEntries(Object.entries(fields).filter(([key]) => [
            "senderUid", "senderName", "senderEmail", "targetRole", "room",
            "assetId", "assetItemId", "assetCode", "assetName", "assetLocation",
            "assetArea", "assetPhoto", "message", "feedback", "feedbackAt", "createdAt"
          ].includes(key)))
          : fields;
        batch.set(FirebaseService.db.collection(collection).doc(id), migratedFields);
      });
      await batch.commit();
    }
    return entries.length;
  },

  exportBackup(data) {
    const backup = {
      format: "upitra-inventory-backup",
      exportedAt: new Date().toISOString(),
      ...data
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cadangan-inventaris-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};

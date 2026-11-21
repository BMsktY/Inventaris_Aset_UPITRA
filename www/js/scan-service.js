const ScanService = {
  normalizeScannedValue(rawValue) {
    return String(rawValue || "").trim().replace(/^\*+|\*+$/g, "").trim();
  },

  formatCode39(value) {
    return `*${this.normalizeScannedValue(value)}*`;
  },

  processScan(rawInput, assetsList, currentUser) {
    const cleaned = this.normalizeScannedValue(rawInput);
    if (!cleaned) return { found: false, message: "Kode barcode kosong atau tidak valid." };

    let matchedUnitId = "";
    let matched = assetsList.find((item) =>
      String(item.id_barang || "").toLowerCase() === cleaned.toLowerCase()
    );

    if (!matched) {
      matched = assetsList.find((item) => {
        const baseId = String(item.id_barang || "").replace(/\.\d+$/, "");
        const unitMatch = cleaned.match(/^(.*)\.(\d+)$/);
        if (!baseId || !unitMatch || unitMatch[1].toLowerCase() !== baseId.toLowerCase()) return false;
        const unitNumber = Number(unitMatch[2]);
        if (unitNumber < 1 || unitNumber > (Number(item.qty) || 1)) return false;
        matchedUnitId = cleaned;
        return true;
      });
    }

    if (!matched) {
      const codeMatch = cleaned.match(/^(.*)\.(\d{4})$/);
      if (codeMatch) {
        matched = assetsList.find((item) => {
          const baseCode = String(item.kode || "").replace(/\.\d{4}$/, "");
          const unitNumber = Number(codeMatch[2]);
          const quantity = Number(item.qty) || 1;
          if (!baseCode || baseCode.toLowerCase() !== codeMatch[1].toLowerCase()
            || unitNumber < 1 || unitNumber > quantity) return false;
          const baseId = String(item.id_barang || "");
          matchedUnitId = quantity > 1
            ? `${baseId.replace(/\.\d+$/, "")}.${String(unitNumber).padStart(2, "0")}`
            : baseId;
          return true;
        });
      }
    }

    if (!matched) {
      matched = assetsList.find((item) =>
        String(item.kode || "").toLowerCase() === cleaned.toLowerCase()
      );
    }

    if (!matched) {
      return { found: false, cleanedValue: cleaned, message: `Aset dengan kode/ID "${cleaned}" tidak ditemukan.` };
    }

    const scanEntry = {
      scannedBy: currentUser.name || currentUser.email,
      scannerRole: currentUser.role,
      scannedAt: new Date().toISOString(),
      rawInput: String(rawInput).trim(),
      matchedIdBarang: matchedUnitId || matched.id_barang
    };
    matched.scanHistory = [scanEntry, ...(matched.scanHistory || [])].slice(0, 30);
    matched.lastScannedAt = scanEntry.scannedAt;
    matched.lastScannedBy = scanEntry.scannedBy;
    localStorage.setItem("sarpras_assets", JSON.stringify(assetsList));

    return { found: true, asset: matched, expectedOutputId: matchedUnitId || matched.id_barang };
  }
};

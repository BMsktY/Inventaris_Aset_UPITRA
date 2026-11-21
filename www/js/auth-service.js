const AuthService = {
  usersKey: "sarpras_users",
  sessionKey: "sarpras_session",

  get firebaseEnabled() {
    return FirebaseService.ready;
  },

  getUsers() {
    let users;
    try {
      users = JSON.parse(localStorage.getItem(this.usersKey) || "null");
    } catch (error) {
      throw new Error("Data akun lokal tidak dapat dibaca.");
    }

    const defaultUsers = [
      { id: "admin", name: "Administrator Sarpras", email: "admin@upitra.ac.id", password: "admin123", unit: "Sarana dan Prasarana", role: "admin", loginHistory: [] },
      { id: "staff", name: "Staf Sarpras", email: "staff@upitra.ac.id", password: "staff123", unit: "FEB", role: "user", loginHistory: [] },
      { id: "bima", name: "Bima Sakti", email: "bima@upt.ac.id", password: "bima123", unit: "Fakultas Ekonomi dan Bisnis", role: "user", loginHistory: [] }
    ];

    if (!Array.isArray(users) || users.length === 0) {
      users = defaultUsers;
      this.saveUsers(users);
    } else {
      // Pastikan akun default selalu ada
      let modified = false;
      defaultUsers.forEach(def => {
        if (!users.some(u => u.email.toLowerCase() === def.email.toLowerCase())) {
          users.push(def);
          modified = true;
        }
      });
      if (modified) this.saveUsers(users);
    }
    return users;
  },

  saveUsers(users) {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  },

  getLoginErrorMessage(error) {
    const messages = {
      "auth/invalid-credential": "Email atau kata sandi salah.",
      "auth/invalid-login-credentials": "Email atau kata sandi salah.",
      "auth/user-not-found": "Akun belum terdaftar.",
      "auth/wrong-password": "Kata sandi tidak sesuai.",
      "auth/operation-not-allowed": "Login Email/Password belum diaktifkan.",
      "auth/network-request-failed": "Tidak dapat terhubung. Periksa koneksi internet perangkat.",
      "auth/too-many-requests": "Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi."
    };
    return messages[error.code] || error.message || "Terjadi kesalahan saat login.";
  },

  async restoreSession() {
    if (!this.firebaseEnabled) {
      if (FirebaseService.configured) {
        throw new Error(FirebaseService.error
          ? `Firebase gagal diinisialisasi: ${FirebaseService.error.message}`
          : "Firebase dikonfigurasi tetapi belum siap. Periksa konfigurasi dan koneksi internet.");
      }
      return this.getSession();
    }
    return new Promise((resolve, reject) => {
      let unsubscribe;
      unsubscribe = FirebaseService.auth.onAuthStateChanged(async (user) => {
        unsubscribe();
        if (!user) {
          localStorage.removeItem(this.sessionKey);
          resolve(null);
          return;
        }
        try {
          resolve(await this.loadFirebaseProfile(user));
        } catch (error) {
          reject(error);
        }
      }, reject);
    });
  },

  async loadFirebaseProfile(user) {
    const snapshot = await FirebaseService.db.collection("users").doc(user.uid).get();
    if (!snapshot.exists) {
      await FirebaseService.auth.signOut();
      throw new Error(`Profil users/${user.uid} belum tersedia di Firestore.`);
    }

    const profile = snapshot.data();
    if (profile.uid && profile.uid !== user.uid) {
      await FirebaseService.auth.signOut();
      throw new Error("UID profil Firestore tidak cocok dengan akun Firebase.");
    }
    if (!["admin", "user"].includes(profile.role)) {
      await FirebaseService.auth.signOut();
      throw new Error("Role profil Firestore harus bernilai admin atau user.");
    }

    const session = {
      uid: user.uid,
      id: user.uid,
      name: profile.name || user.displayName || user.email,
      email: user.email,
      unit: profile.unit || "",
      role: profile.role,
      loginHistory: []
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  },

  async login(email, password) {
    if (this.firebaseEnabled) {
      let credential;
      try {
        credential = await FirebaseService.auth.signInWithEmailAndPassword(email.trim(), password);
      } catch (error) {
        console.warn("[Firebase Auth] Login gagal.", {
          code: error.code || "auth/unknown"
        });
        throw error;
      }
      const session = await this.loadFirebaseProfile(credential.user);
      const loginEntry = {
        uid: credential.user.uid,
        timestamp: new Date().toISOString(),
        device: /Android|iPhone|iPad/i.test(navigator.userAgent) || window.cordova ? "Mobile" : "Web"
      };
      try {
        const historySnapshot = await FirebaseService.db.collection("loginHistory")
          .where("uid", "==", credential.user.uid)
          .orderBy("timestamp", "desc")
          .limit(20)
          .get();
        session.loginHistory = historySnapshot.docs.map((doc) => {
          const entry = doc.data();
          return {
            timestamp: entry.timestamp,
            device: entry.device || "Aplikasi"
          };
        });
      } catch (error) {
        console.warn(
          `[Firebase Auth] Riwayat masuk tidak dapat dimuat; login tetap dilanjutkan (${error.code || "firestore/unknown"}).`
        );
      }
      try {
        await FirebaseService.db.collection("loginHistory").add(loginEntry);
        session.loginHistory = [loginEntry, ...(session.loginHistory || [])].slice(0, 20);
      } catch (error) {
        console.warn(
          `[Firebase Auth] Riwayat masuk tidak dapat disimpan; login tetap dilanjutkan (${error.code || "firestore/unknown"}).`
        );
      }
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      return session;
    }

    if (FirebaseService.configured) {
      throw new Error(FirebaseService.error
        ? `Firebase gagal diinisialisasi: ${FirebaseService.error.message}`
        : "Firebase dikonfigurasi tetapi belum siap. Periksa konfigurasi dan koneksi internet.");
    }

    const users = this.getUsers();
    const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
    if (!user) throw new Error("Email atau kata sandi tidak sesuai.");

    const entry = {
      timestamp: new Date().toISOString(),
      device: /Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobile" : "Web"
    };
    user.loginHistory = [entry, ...(user.loginHistory || [])].slice(0, 20);
    this.saveUsers(users);
    const session = { ...user, uid: user.id };
    delete session.password;
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.sessionKey) || "null");
    } catch (error) {
      return null;
    }
  },

  async logout() {
    if (this.firebaseEnabled && FirebaseService.auth.currentUser) {
      await FirebaseService.auth.signOut();
    }
    localStorage.removeItem(this.sessionKey);
  },

  async getAllUsers() {
    if (this.firebaseEnabled) {
      const snapshot = await FirebaseService.db.collection("users").orderBy("name").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    return this.getUsers().map(({ password, ...user }) => user);
  },

  async upsertUserAccount(payload) {
    if (this.firebaseEnabled) {
      const result = await FirebaseService.functions.httpsCallable("adminUpsertUser")({
        uid: payload.id || null,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        unit: payload.unit.trim(),
        role: payload.role === "admin" ? "admin" : "user",
        password: payload.password || ""
      });
      return result.data;
    }

    const users = this.getUsers();
    const email = payload.email.trim().toLowerCase();
    const duplicate = users.find((user) => user.email.toLowerCase() === email && user.id !== payload.id);
    if (duplicate) throw new Error("Email sudah digunakan akun lain.");

    const existing = users.find((user) => user.id === payload.id);
    if (existing) {
      Object.assign(existing, {
        name: payload.name.trim(),
        email,
        unit: payload.unit.trim(),
        role: payload.role === "admin" ? "admin" : "user"
      });
      if (payload.password) existing.password = payload.password;
    } else {
      if (!payload.password) throw new Error("Kata sandi wajib diisi untuk akun baru.");
      users.push({
        id: "user-" + Date.now(),
        name: payload.name.trim(),
        email,
        password: payload.password,
        unit: payload.unit.trim(),
        role: payload.role === "admin" ? "admin" : "user",
        loginHistory: []
      });
    }
    this.saveUsers(users);
  },

  async deleteUserAccount(userId) {
    if (this.firebaseEnabled) {
      await FirebaseService.functions.httpsCallable("adminDeleteUser")({ uid: userId });
      return;
    }
    if (userId === "admin") throw new Error("Akun admin utama tidak dapat dihapus.");
    this.saveUsers(this.getUsers().filter((user) => user.id !== userId));
  }
};

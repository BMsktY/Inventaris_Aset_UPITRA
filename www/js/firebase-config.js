const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXT8SbAODxrf2BAaKtDYbuMJrcekvxrjQ",
  authDomain: "sistem-inventaris-aset.firebaseapp.com",
  projectId: "sistem-inventaris-aset",
  storageBucket: "sistem-inventaris-aset.firebasestorage.app",
  messagingSenderId: "322510956421",
  appId: "1:322510956421:web:8f94ca37c9ff33fccac6ec"
};

const FirebaseService = (() => {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
  const configured = requiredKeys.every((key) => typeof FIREBASE_CONFIG[key] === "string" && FIREBASE_CONFIG[key].trim());
  let app = null;
  let auth = null;
  let db = null;
  let functions = null;
  let storage = null;
  let storageError = null;
  let initializationError = null;

  if (configured) {
    if (typeof firebase === "undefined") {
      initializationError = new Error("Firebase SDK tidak dapat dimuat. Periksa koneksi internet perangkat.");
    } else {
      try {
        app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
        try {
          window.firebaseFirestorePersistence.initialize(app.name);
        } catch (error) {
          if (error.code !== "failed-precondition" && error.code !== "unimplemented") {
            throw error;
          }
          console.warn("Cache offline Firestore tidak dapat diaktifkan.", {
            code: error.code
          });
        }
        auth = firebase.auth();
        db = firebase.firestore();
        functions = firebase.functions();
      } catch (error) {
        initializationError = error;
        console.error("Inisialisasi Firebase gagal.", error);
      }
    }
  }

  if (app) {
    try {
      if (typeof firebase.storage === "function" && FIREBASE_CONFIG.storageBucket) {
        storage = firebase.storage();
      } else {
        storageError = new Error("Firebase Storage belum siap atau storageBucket belum diatur.");
      }
    } catch (error) {
      storageError = error;
      console.error("Inisialisasi Firebase Storage gagal.", error);
    }
  }

  if (app && auth && db && functions) {
    console.info(`[Firebase] SDK siap untuk proyek ${app.options.projectId}; koneksi diverifikasi saat operasi data berhasil.`);
  }

  return {
    get configured() { return configured; },
    get ready() { return Boolean(app && auth && db && functions); },
    get storageReady() { return Boolean(storage); },
    get error() { return initializationError; },
    get storageError() { return storageError; },
    get app() { return app; },
    get auth() { return auth; },
    get db() { return db; },
    get functions() { return functions; },
    get storage() { return storage; }
  };
})();

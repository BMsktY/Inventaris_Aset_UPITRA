const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

initializeApp();

const auth = getAuth();
const db = getFirestore();

async function requireAdmin(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Silakan masuk terlebih dahulu.");
  }
  const profile = await db.collection("users").doc(request.auth.uid).get();
  if (!profile.exists || profile.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Hanya Admin yang dapat mengelola akun.");
  }
}

function validateProfile(data) {
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new HttpsError("invalid-argument", "Nama wajib diisi.");
  }
  if (typeof data.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    throw new HttpsError("invalid-argument", "Email tidak valid.");
  }
  if (typeof data.unit !== "string" || !data.unit.trim()) {
    throw new HttpsError("invalid-argument", "Unit wajib diisi.");
  }
  if (!["admin", "user"].includes(data.role)) {
    throw new HttpsError("invalid-argument", "Peran akun tidak valid.");
  }
  if (data.password !== undefined && data.password !== "" &&
      (typeof data.password !== "string" || data.password.length < 6)) {
    throw new HttpsError("invalid-argument", "Kata sandi minimal 6 karakter.");
  }
}

exports.adminUpsertUser = onCall(async (request) => {
  await requireAdmin(request);
  const data = request.data || {};
  validateProfile(data);

  const email = data.email.trim().toLowerCase();
  const name = data.name.trim();
  let userRecord;
  let createdAt = FieldValue.serverTimestamp();

  if (data.uid) {
    if (typeof data.uid !== "string" || data.uid === request.auth.uid && data.role !== "admin") {
      throw new HttpsError("invalid-argument", "Perubahan peran Admin yang sedang digunakan tidak diizinkan.");
    }
    try {
      const current = await auth.getUser(data.uid);
      userRecord = await auth.updateUser(data.uid, {
        email,
        displayName: name,
        ...(typeof data.password === "string" && data.password.length >= 6 ? { password: data.password } : {})
      });
      const oldProfile = await db.collection("users").doc(data.uid).get();
      createdAt = oldProfile.exists && oldProfile.data().createdAt
        ? oldProfile.data().createdAt
        : FieldValue.serverTimestamp();
      if (!current) throw new HttpsError("not-found", "Akun tidak ditemukan.");
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      if (error.code === "auth/user-not-found") {
        throw new HttpsError("not-found", "Akun autentikasi tidak ditemukan.");
      }
      if (error.code === "auth/email-already-exists") {
        throw new HttpsError("already-exists", "Email sudah digunakan akun lain.");
      }
      if (error.code === "auth/invalid-email") {
        throw new HttpsError("invalid-argument", "Email tidak valid.");
      }
      throw new HttpsError("internal", `Akun gagal diperbarui: ${error.message}`);
    }
  } else {
    if (typeof data.password !== "string" || data.password.length < 6) {
      throw new HttpsError("invalid-argument", "Kata sandi minimal 6 karakter.");
    }
    try {
      userRecord = await auth.createUser({ email, displayName: name, password: data.password });
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        throw new HttpsError("already-exists", "Email sudah digunakan akun lain.");
      }
      if (error.code === "auth/invalid-email") {
        throw new HttpsError("invalid-argument", "Email tidak valid.");
      }
      throw new HttpsError("internal", `Akun gagal dibuat: ${error.message}`);
    }
  }

  await db.collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    name,
    email,
    unit: data.unit.trim(),
    role: data.role,
    createdAt,
    updatedAt: FieldValue.serverTimestamp()
  });
  return { uid: userRecord.uid };
});

exports.adminDeleteUser = onCall(async (request) => {
  await requireAdmin(request);
  const uid = request.data && request.data.uid;
  if (typeof uid !== "string" || !uid || uid === request.auth.uid) {
    throw new HttpsError("invalid-argument", "Akun ini tidak dapat dihapus.");
  }

  const profileRef = db.collection("users").doc(uid);
  const profile = await profileRef.get();
  if (!profile.exists) throw new HttpsError("not-found", "Profil akun tidak ditemukan.");

  if (profile.data().role === "admin") {
    const admins = await db.collection("users").where("role", "==", "admin").limit(2).get();
    if (admins.size <= 1) {
      throw new HttpsError("failed-precondition", "Admin terakhir tidak dapat dihapus.");
    }
  }

  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw new HttpsError("internal", `Akun autentikasi gagal dihapus: ${error.message}`);
    }
  }
  await profileRef.delete();
  return { uid };
});

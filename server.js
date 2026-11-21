const http = require("node:http");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "www");
const preferredPort = Number(process.env.PORT) || 8000;
const allowPortFallback = !process.env.PORT;
const packageMetadata = require("./package.json");
const startedAt = Date.now();
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf"
};

function hasFirebaseConfiguration() {
  const configPath = path.resolve(__dirname, "www/js/firebase-config.js");
  if (!fs.existsSync(configPath)) return false;
  const source = fs.readFileSync(configPath, "utf8");
  const config = source.match(/const FIREBASE_CONFIG = \{([\s\S]*?)\};/);
  if (!config) return false;

  return ["apiKey", "authDomain", "projectId", "storageBucket", "appId"]
    .every((key) => new RegExp(`${key}:\\s*"[^"\\s]+"`).test(config[1]));
}

const progressChecks = [
  {
    id: "web",
    label: "Aplikasi web",
    description: "Halaman dan logika inventaris tersedia.",
    files: ["www/index.html", "www/js/app.js"]
  },
  {
    id: "firebase",
    label: "Firebase dan sinkronisasi",
    description: "SDK, konfigurasi, layanan sinkronisasi, dan rules tersedia.",
    files: [
      "www/js/firebase-sdk.js",
      "www/js/firebase-config.js",
      "www/js/sync-service.js",
      "firestore.rules",
      "storage.rules"
    ],
    validate: hasFirebaseConfiguration
  },
  {
    id: "api",
    label: "API dan fungsi Admin",
    description: "Endpoint pemantauan dan Cloud Functions tersedia.",
    files: ["server.js", "functions/index.js", "functions/package.json"]
  },
  {
    id: "cordova",
    label: "Cordova Android",
    description: "Konfigurasi aplikasi dan plugin kamera tersedia.",
    files: ["config.xml", "plugins/cordova-plugin-camera/plugin.xml"]
  }
];

function sendJson(request, response, statusCode, data) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(request.method === "HEAD" ? undefined : JSON.stringify(data));
}

function getProgress() {
  const checks = progressChecks.map(({ id, label, description, files, validate }) => {
    const ready = files.every((file) => fs.existsSync(path.resolve(__dirname, file)))
      && (!validate || validate());
    return { id, label, description, status: ready ? "ready" : "incomplete" };
  });
  const completed = checks.filter((check) => check.status === "ready").length;

  return {
    status: completed === checks.length ? "ready" : "incomplete",
    completed,
    total: checks.length,
    percentage: Math.round((completed / checks.length) * 100),
    checks,
    note: "Status ini memeriksa kesiapan berkas integrasi. Koneksi Firebase diverifikasi oleh aplikasi setelah pengguna masuk."
  };
}

function openBrowser(url) {
  if (process.env.BROWSER === "none") return;

  const command = process.platform === "win32"
    ? "cmd.exe"
    : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const browser = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
  browser.once("error", (error) => {
    console.warn(`Browser tidak dapat dibuka otomatis (${error.message}). Buka ${url} secara manual.`);
  });
  browser.unref();
}

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch (error) {
    sendJson(request, response, 400, { error: "Bad request" });
    return;
  }

  if (pathname.startsWith("/api/")) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    if (pathname === "/api/health") {
      sendJson(request, response, 200, {
        status: "ok",
        service: packageMetadata.name,
        version: packageMetadata.version,
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (pathname === "/api/progress") {
      const progress = getProgress();
      sendJson(request, response, progress.status === "ready" ? 200 : 503, progress);
      return;
    }

    sendJson(request, response, 404, { error: "API endpoint tidak ditemukan." });
    return;
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(root + path.sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500).end("File tidak dapat dibuka.");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    response.end(request.method === "HEAD" ? undefined : content);
  });
});

function listenOnPort(port) {
  const handleError = (error) => {
    if (error.code === "EADDRINUSE" && allowPortFallback && port < preferredPort + 20) {
      console.warn(`Port ${port} sedang digunakan; mencoba port ${port + 1}.`);
      listenOnPort(port + 1);
      return;
    }

    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} sedang digunakan. Pilih port lain dengan mengatur variabel PORT.`);
      process.exitCode = 1;
      return;
    }

    console.error("Server gagal dijalankan.", error);
    process.exitCode = 1;
  };
  server.once("error", handleError);
  server.once("listening", () => server.removeListener("error", handleError));
  server.listen(port, "0.0.0.0", () => {
    const appUrl = `http://localhost:${port}`;
    console.log(`Aplikasi siap di ${appUrl}`);
    console.log(`Progress integrasi: ${appUrl}/progress.html`);
    openBrowser(appUrl);
    const addresses = Object.values(os.networkInterfaces())
      .flat()
      .filter((address) => address && address.family === "IPv4" && !address.internal)
      .map((address) => `http://${address.address}:${port}`);
    addresses.forEach((address) => console.log(`Akses dari ponsel: ${address}`));
  });
}

listenOnPort(preferredPort);

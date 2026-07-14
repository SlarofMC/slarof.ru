var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var cachedStatus = null;
var lastFetched = 0;
var CACHE_TTL = 15e3;
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/minecraft-status", async (req, res) => {
    const now = Date.now();
    if (cachedStatus && now - lastFetched < CACHE_TTL) {
      return res.json(cachedStatus);
    }
    try {
      const response = await fetch("https://api.mcsrvstat.us/3/slarof.ru", {
        signal: AbortSignal.timeout(4e3)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.online) {
        const fallbackResponse = await fetch("https://api.mcsrvstat.us/3/mc.slarof.ru", {
          signal: AbortSignal.timeout(4e3)
        });
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.online) {
            cachedStatus = fallbackData;
            lastFetched = now;
            return res.json(fallbackData);
          }
        }
      }
      cachedStatus = data;
      lastFetched = now;
      res.json(data);
    } catch (error) {
      console.error("Error fetching Minecraft status:", error.message);
      if (cachedStatus) {
        return res.json(cachedStatus);
      }
      res.json({
        online: false,
        ip: "slarof.ru",
        port: 25565,
        hostname: "slarof.ru",
        players: {
          online: 0,
          max: 100
        },
        version: "26.2",
        motd: {
          clean: ["\u041F\u0440\u0438\u0432\u0430\u0442\u043D\u044B\u0439 \u0432\u0430\u043D\u0438\u043B\u044C\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0435\u0440 \u0421\u043B\u0430\u0440\u043E\u0444", "\u0421\u0435\u0440\u0432\u0435\u0440 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043E\u0444\u0444\u043B\u0430\u0439\u043D \u0438\u043B\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F"]
        }
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

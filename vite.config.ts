import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { createReadStream } from "node:fs";
import { basename } from "node:path";
import https from "node:https";

const kuromojiSource = fileURLToPath(new URL("./node_modules/kuromoji/src/", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: "japanese-dev-server",
      configureServer(server) {
        server.middlewares.use("/verbumnobis/dict", (request, response, next) => {
          const filename = basename(new URL(request.url ?? "", "http://localhost").pathname);
          if (!/^((base|check|tid|tid_pos|tid_map|cc|unk|unk_pos|unk_map|unk_char|unk_compat|unk_invoke)\.dat\.gz)$/.test(filename)) {
            next();
            return;
          }

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/octet-stream");
          response.removeHeader("Content-Encoding");
          createReadStream(fileURLToPath(new URL(`./public/dict/${filename}`, import.meta.url))).pipe(response);
        });

        server.middlewares.use("/verbumnobis/__tatoeba", (request, response) => {
          const requestUrl = new URL(request.url ?? "", "http://localhost");
          const word = requestUrl.searchParams.get("word") ?? "";
          if (!word) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: "Missing word" }));
            return;
          }

          const target = new URL("https://api.tatoeba.org/unstable/sentences");
          target.searchParams.set("lang", "jpn");
          target.searchParams.set("q", word);
          target.searchParams.set("sort", "relevance");
          target.searchParams.set("limit", "3");
          target.searchParams.set("trans:lang", "eng");
          const proxyReq = https.get(target, { family: 4, headers: { "User-Agent": "VerbumNobis/0.1" } }, (proxyRes) => {
            response.statusCode = proxyRes.statusCode ?? 200;
            response.setHeader("Content-Type", "application/json");
            proxyRes.pipe(response);
          });
          proxyReq.on("error", (error) => {
            console.error("[JapaneseLookup] Tatoeba proxy error:", error);
            response.statusCode = 502;
            response.end(JSON.stringify({ error: String(error) }));
          });
        });

        server.middlewares.use("/verbumnobis/__japanese-debug", (request, response, next) => {
          if (request.method !== "POST") {
            next();
            return;
          }

          let body = "";
          request.on("data", (chunk) => {
            body += chunk;
          });
          request.on("end", () => {
            try {
              const event = JSON.parse(body) as { message?: string; details?: unknown; timestamp?: string };
              console.log(`[JapaneseLookup ${event.timestamp ?? ""}] ${event.message ?? "event"}`, event.details ?? "");
            } catch {
              console.log("[JapaneseLookup] Received malformed debug event", body);
            }
            response.statusCode = 204;
            response.end();
          });
        });

        server.middlewares.use("/verbumnobis/__jisho", (request, response) => {
          const url = new URL(request.url ?? "", "http://localhost");
          const keyword = url.searchParams.get("keyword") ?? "";
          if (!keyword) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: "Missing keyword" }));
            return;
          }

          const proxyReq = https.get(
            `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`,
            {
              family: 4,
              headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
              }
            },
            (proxyRes) => {
              response.statusCode = proxyRes.statusCode ?? 200;
              response.setHeader("Content-Type", "application/json");
              response.setHeader("Access-Control-Allow-Origin", "*");
              proxyRes.pipe(response);
            }
          );

          proxyReq.on("error", (err) => {
            console.error("[JapaneseLookup] Jisho proxy error:", err);
            response.statusCode = 502;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: String(err) }));
          });
        });
      }
    }
  ],
  resolve: {
    alias: [
      {
        find: `${kuromojiSource}loader/NodeDictionaryLoader.js`,
        replacement: fileURLToPath(new URL("./features/japanese/browserDictionaryLoader.ts", import.meta.url))
      },
      {
        find: `${kuromojiSource}loader/NodeDictionaryLoader`,
        replacement: fileURLToPath(new URL("./features/japanese/browserDictionaryLoader.ts", import.meta.url))
      },
      {
        find: `${kuromojiSource}loader/BrowserDictionaryLoader.js`,
        replacement: fileURLToPath(new URL("./features/japanese/browserDictionaryLoader.ts", import.meta.url))
      },
      {
        find: `${kuromojiSource}loader/BrowserDictionaryLoader`,
        replacement: fileURLToPath(new URL("./features/japanese/browserDictionaryLoader.ts", import.meta.url))
      },
      {
        find: `${kuromojiSource}loader/DictionaryLoader.js`,
        replacement: fileURLToPath(new URL("./features/japanese/browserDictionaryLoader.ts", import.meta.url))
      },
      {
        find: `${kuromojiSource}loader/DictionaryLoader`,
        replacement: fileURLToPath(new URL("./features/japanese/browserDictionaryLoader.ts", import.meta.url))
      },
      {
        find: "path",
        replacement: fileURLToPath(new URL("./features/japanese/pathShim.ts", import.meta.url))
      }
    ]
  },
  server: {
    port: 5173,
    host: "localhost"
  },
  base: "/verbumnobis/",
});

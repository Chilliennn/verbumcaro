import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const kuromojiSource = fileURLToPath(new URL("./node_modules/kuromoji/src/", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: "japanese-debug-terminal",
      configureServer(server) {
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
      }
    }
  ],
  resolve: {
    alias: [
      {
        find: `${kuromojiSource}loader/NodeDictionaryLoader.js`,
        replacement: `${kuromojiSource}loader/BrowserDictionaryLoader.js`
      },
      {
        find: `${kuromojiSource}loader/DictionaryLoader.js`,
        replacement: fileURLToPath(new URL("./features/japanese/kuromojiDictionaryLoader.js", import.meta.url))
      },
      {
        find: `${kuromojiSource}loader/DictionaryLoader`,
        replacement: fileURLToPath(new URL("./features/japanese/kuromojiDictionaryLoader.js", import.meta.url))
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

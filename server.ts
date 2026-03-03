import "dotenv/config";
import { createServer as createViteServer } from "vite";
import app from "./api/index"; // Import the Express app

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  // Use Vite's connect instance as middleware
  // We need to mount the API app *before* Vite if we want API to take precedence,
  // OR mount Vite *after* API. 
  // In the previous setup, app.use(vite) was called.
  // Express app can be used as a sub-app or we can just attach Vite to it.
  
  // Actually, we want to use the `app` we imported, and attach Vite to it.
  app.use(vite.middlewares);

  const PORT = 3000;
  // Note: app.listen is already called in api/index.ts if run directly.
  // But here we are importing it.
  // If api/index.ts has `if (import.meta.url === ...)` block, it won't listen.
  // So we listen here.
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Local Dev Server running on http://localhost:${PORT}`);
  });
}

startServer();

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // bind to both IPv4 and IPv6 localhost so Chrome on Windows
    // (which resolves "localhost" → 127.0.0.1) can connect
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});

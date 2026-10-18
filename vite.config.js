import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev-server security headers (defense-in-depth; production host sets its own).
  server: {
    middleware: [
      (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "connect-src 'self' http://localhost:5000 ws://localhost:5000; " +
          "frame-ancestors 'none';"
        );
        next();
      },
    ],
  },
})

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // MUI core components
          "vendor-mui-core": ["@mui/material", "@mui/system"],
          // MUI data components (heavy)
          "vendor-mui-data": ["@mui/x-data-grid"],
          // MUI charts (heavy)
          "vendor-mui-charts": ["@mui/x-charts"],
          // D3 visualization library
          "vendor-d3": ["d3"],
          // Ant Design components
          "vendor-antd": ["antd"],
          // Authentication
          "vendor-msal": ["@azure/msal-browser", "@azure/msal-react"],
          // Redux state management
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
          // Date handling
          "vendor-dates": ["dayjs", "@mui/x-date-pickers"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

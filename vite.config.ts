import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import minimist from "minimist";
import tailwindcss from "@tailwindcss/vite";

const args = minimist(process.argv.slice(2));

export default defineConfig({
  base: args["baseUri"] || "/",
  plugins: [
    react({
      babel: {
        plugins: [
          // ["@babel/plugin-proposal-decorators", { legacy: true }],
          // ["@babel/plugin-proposal-class-properties", { loose: true }],
        ],
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    minify: true,
  },
});

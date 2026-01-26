import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [tailwind(), react()],
  output: "hybrid",
  adapter: cloudflare({
    platformProxy: {
      enabled: false,
    },
  }),
});

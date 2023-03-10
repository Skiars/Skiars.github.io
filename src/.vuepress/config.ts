import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "Skiars's Rambling",
      description: "A blog demo for vuepress-theme-hope",
    }
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});

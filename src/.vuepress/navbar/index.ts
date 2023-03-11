import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/",
  {
    text: "Posts",
    icon: "edit",
    prefix: "/posts/",
    children: [
      {
        text: "Interpreter",
        icon: "edit",
        prefix: "interpreter/",
        children: ["0-intro"]
      },
      { text: "Hello world", icon: "edit", link: "2023/hello-world" },
    ],
  },
  {
    text: "About",
    icon: "info",
    link: "/about"
  }
]);

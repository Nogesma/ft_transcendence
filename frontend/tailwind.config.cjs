module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#81a1c1",
          secondary: "#3b4252",
          accent: "#434c5e",
          neutral: "#5e81ac",
          "base-100": "#eceff4",
        },
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "#ffa31a",
          secondary: "#808080",
          accent: "#292929",
          neutral: "#808080",
          "base-100": "#1b1b1b",
        },
      },
    ],
  },
};

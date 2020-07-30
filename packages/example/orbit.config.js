const autoprefixer = require("autoprefixer");
const tailwind = require("tailwindcss");

const { css, hiccup, punctuation } = require("../orbit/src/plugins");

module.exports = {
  input: "./src/",
  output: "./public/",
  plugins: [css([autoprefixer, tailwind]), hiccup(), punctuation()]
};

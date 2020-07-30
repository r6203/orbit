// src/root.js
const root2 = (_, content) => [
  ["!DOCTYPE", "html"],
  [
    "html",
    {lang: "en"},
    [
      "head",
      [
        ["meta", {charset: "utf-8"}],
        ["title", "The HTML5 Herald"],
        ["meta", {name: "description", content: "The HTML5 Herald"}],
        ["meta", {name: "author", content: "Robin Altay"}],
        ["link", {rel: "stylesheet", href: "/main.css"}]
      ]
    ],
    ["body.bg-gray-100", ["main", content]]
  ]
];

// src/index.js
const data = {
  name: "Jacob"
};
const render = (data2) => [
  root2,
  [
    "div",
    [
      ["h1.text-3xl.font-bold", "Hallo Welt!"],
      ["p", `Hello ${data2.name}`]
    ]
  ]
];
export {
  data,
  render
};

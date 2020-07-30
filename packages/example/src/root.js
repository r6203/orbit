export const root = (_, content) => [
  ["!DOCTYPE", "html"],
  [
    "html",
    { lang: "en" },
    [
      "head",
      [
        ["meta", { charset: "utf-8" }],
        ["title", "The HTML5 Herald"],
        ["meta", { name: "description", content: "The HTML5 Herald" }],
        ["meta", { name: "author", content: "Robin Altay" }],
        ["link", { rel: "stylesheet", href: "/main.css" }],
      ],
    ],
    ["body.bg-gray-100", ["main", content]],
  ],
];

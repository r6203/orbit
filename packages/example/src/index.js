import { root } from "./root";

export const data = {
  name: "Robin"
};

export const render = data => [
  root,
  [
    "div",
    [
      ["h1.text-3xl.font-bold", "Hallo Welt!"],
      ["p.font-medium.text-xl.text-red-800", `Hello ${data.name}`],
      ["p.font-bold", "This--is a wonderful---test."],
      ["button", "This--is a another cool---test."]
    ]
  ]
];

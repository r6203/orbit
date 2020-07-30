import unified from "unified";
import rehype from "rehype";
import unist from "unist";
import parse from "rehype-parse";
import stringify from "rehype-stringify";
import visit from "unist-util-visit";

import { CreatePlugin } from "./index";

const unifiedPunctuation: unified.Attacher = () => {
  return tree => {
    visit(tree, "element", node => {
      if (node.tagName === "script") return;

      const children = node.children as unist.Node[];

      children.forEach(child => {
        if (child.tagName !== "script" && child.type === "text") {
          if (typeof child.value === "string")
            child.value = child.value.replace(/---/g, "—").replace(/--/g, "–");
        }
      });
    });
  };
};

export const punctuation: CreatePlugin = () => ({
  name: "punctuation",
  extensions: ["js", "ts"],
  transform: async ({ contents }) => {
    const result = await rehype()
      .use(parse)
      .use(unifiedPunctuation)
      .use(stringify)
      .process(contents);

    return result.contents;
  }
});

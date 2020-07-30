import { CreatePlugin } from "./index";
import postcss from "postcss";

export const css: CreatePlugin = (postCSSPlugins: postcss.AcceptedPlugin[] = []) => ({
  name: "CSS (with PostCSS)",
  extensions: ["css"],
  contentType: "text/css; charset=utf-8",
  transform: async ({ contents }) => {
    const result = await postcss(postCSSPlugins).process(contents, {from: undefined});

    return result.css
  },
});

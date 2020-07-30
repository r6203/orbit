import fs from "fs";
import requireFromString from "require-from-string";
import { serialize } from "@thi.ng/hiccup";
import * as esbuild from "esbuild";

import { CreatePlugin } from "./index";
import { Config } from "../config";
import * as utils from "../utils";

let esbuildService: esbuild.Service;

const compile = async (inputPath: string, config: Config) => {
  console.log(`Compiling ${inputPath}`);

  const outPath = utils.getPath(
    utils.normalizePath(inputPath, config.input),
    config.cache
  );

  if (!esbuildService) esbuildService = await esbuild.startService();

  await esbuildService.build({
    entryPoints: [inputPath],
    outfile: outPath,
    format: "cjs",
    bundle: true
  });
};

export const hiccup: CreatePlugin = () => ({
  name: "hiccup",
  extensions: ["js", "ts"],
  contentType: "text/html; charset=utf-8",
  transform: async ({ filePath, config }, data) => {
    await compile(filePath, config);

    const inputPath = utils.normalizePath(filePath, config.input);
    const cachePath = utils.getPath(inputPath, config.cache);
    const contents = fs.readFileSync(cachePath, "utf-8");
    const { data: renderData, render } = requireFromString(contents);

    const html = serialize(render(renderData));

    const { clientCode } = data as Record<string, string>;

    return html.replace("</body>", `<script>${clientCode}</script></body>`);
  }
});

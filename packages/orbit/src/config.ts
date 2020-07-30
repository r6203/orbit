import _ from "lodash";
import fs from "fs";
import { resolve } from "path";
import importFresh from "import-fresh";

import { CreatePlugin, Plugin } from "./plugins";

export interface Config {
  input: string;
  output: string;
  cache: string;
  plugins: Plugin[];
  port: number;
}

const defaultConfig: Config = {
  input: "./site/",
  output: "./dist/",
  cache: "./.cache/",
  plugins: [],
  port: 3000
};

const withDefaultConfig = (config: Config, defaultConfig: Config) =>
  _.defaults(config, defaultConfig);

export const loadConfig = (path = "./orbit.config.js") => {
  path = resolve(path);

  if (!fs.existsSync(path)) return defaultConfig;

  const config = importFresh(path) as Config;

  return withDefaultConfig(config, defaultConfig);
};

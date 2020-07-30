import _ from "lodash";
import { Config } from "../config";
export * from "./hiccup";
export * from "./css";
export * from "./punctuation";

interface TransformParams {
  contents: string;
  filePath: string;
  config: Config;
}

export interface Plugin {
  name: string;
  extensions: string[];
  contentType?: string;
  data?: unknown;
  transform: (params: TransformParams, data?: unknown) => Promise<unknown>;
}

export type CreatePlugin = () => Plugin;

export const applyPlugin = async (plugin: Plugin, params: TransformParams) => ({
  contents: await plugin.transform(params, plugin.data),
  contentType: plugin.contentType
});

export const findPlugin = (name: string, plugins: Plugin[]) =>
  plugins.find(plugin => plugin.name === name);

export const attachData = (
  plugin: Plugin,
  data: unknown,
  plugins: Plugin[]
) => {
  const index = plugins.findIndex(_.matchesProperty("name", plugin.name));

  return [
    ...plugins.slice(0, index),
    { ...plugin, data },
    ...plugins.slice(index + 1, plugins.length)
  ];
};

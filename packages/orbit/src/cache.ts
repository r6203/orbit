import _ from "lodash";
import Koa from "koa";
import dependencyTree from "dependency-tree";
import { Config } from "./config";
import path from "path";

interface CachedObject {
  name: string;
  contents: string;
  contentType: string;
  dependencies: string[];
}

type Cache = Record<string, CachedObject>;

export const initCache = (): Cache => ({});

export const loadFromCache = (filePath: string, cache: Cache) =>
  cache[filePath];

export const storeInCache = (
  filePath: string,
  obj: CachedObject,
  cache: Cache
) => ({
  ...cache,
  [filePath]: obj,
});

export const invalidateCache = (filePath: string, cache: Cache) =>
  _.omit(cache, [filePath]);

let cache: Cache;

export const getCache = () => {
  if (!cache) cache = initCache();

  return cache;
};

export const setCache = (newCache: Cache) => (cache = newCache);

export const cacheMiddleware = (config: Config): Koa.Middleware => {
  return async (ctx, next) => {
    const { filePath } = ctx.state;

    const cached = loadFromCache(filePath, getCache());

    if (cached) {
      console.log(`Loaded ${filePath} from cache`);

      const { contents, contentType } = cached;

      ctx.body = contents;
      ctx.type = contentType;

      return;
    }

    await next();

    let tree: string[] = dependencyTree.toList({
      filename: filePath,
      directory: config.input,
    });

    tree = tree.map((dependency) => path.relative(process.cwd(), dependency));

    setCache(
      storeInCache(
        filePath,
        {
          name: filePath,
          contents: ctx.body,
          contentType: ctx.type,
          dependencies: tree.slice(0, tree.length - 1),
        },
        getCache()
      )
    );
  };
};

export const getDependentObjects = (dependencyPath: string, cache: Cache) => {
  return _.filter(cache, (obj) =>
    obj.dependencies.some((dependency) => dependency === dependencyPath)
  ).map((dependency) => dependency.name);
};

import path from "path";
import fs from "fs";
import Koa from "koa";
import logger from "koa-logger";
import rewrite from "koa-rewrite";
import serve from "koa-static";
import chokidar from "chokidar";
import http from "http";
import socketIO from "socket.io";

import { Config, loadConfig } from "./config";
import * as utils from "./utils";
import * as cache from "./cache";
import * as plugins from "./plugins";
import * as client from "./client";

const findPathForResource = (resourcePath: string, config: Config) => {
  if (path.extname(resourcePath))
    return utils.getPath(resourcePath, config.input);

  const getInputPath = (resourcePath: string, ext: "js" | "ts") =>
    utils.getPath(`${resourcePath}.${ext}`, config.input);
  const existsInputFile = (resourcePath: string, ext: "js" | "ts") =>
    fs.existsSync(getInputPath(resourcePath, ext));

  if (existsInputFile(resourcePath, "js"))
    return getInputPath(resourcePath, "js");
  if (existsInputFile(resourcePath, "ts"))
    return getInputPath(resourcePath, "ts");
};

const pluginsForExtension = (ext: string, config: Config) =>
  config.plugins.filter(plugin =>
    plugin.extensions.includes(ext.replace(".", ""))
  );

const applyPlugins = async (filePath: string, config: Config) => {
  const applicablePlugins = pluginsForExtension(path.extname(filePath), config);
  if (applicablePlugins.length === 0) return;

  let contents = fs.readFileSync(filePath, "utf-8");
  let contentType;

  for (const plugin of applicablePlugins) {
    console.log(`Applying plugin ${plugin.name}`);

    const result = await plugins.applyPlugin(plugin, {
      contents,
      filePath,
      config
    });

    if (typeof result.contents === "string") contents = result.contents;

    if (result.contentType) contentType = result.contentType;
  }

  return { contents, contentType };
};

const processResource = (filePath: string, config: Config) => {
  console.log(`Processing ${filePath}`);

  return applyPlugins(filePath, config);
};

const filePath = (config: Config): Koa.Middleware => async (ctx, next) => {
  const { path } = ctx.request;

  ctx.state.filePath = findPathForResource(path, config);

  await next();
};

const request = (config: Config): Koa.Middleware => async (ctx, next) => {
  const { filePath } = ctx.state;

  if (!filePath) return next();

  const result = await processResource(filePath, config);

  if (!result) return next();

  const { contents, contentType } = result;

  ctx.body = contents;
  ctx.type = contentType ? contentType : "text/plain; charset=utf-8";
};

const watchFolder = (
  watchPath: string,
  callback: (filePath: string) => void,
  ignoreInitial = true
) => {
  console.log(`watching ${watchPath} for changes`);

  const watcher = chokidar.watch(watchPath, { ignoreInitial });

  const events = ["add", "change"];
  events.forEach(event => watcher.on(event, callback));

  return watcher;
};

const handleFileChange = (filePath: string) => {
  console.log(`${filePath} changed`);

  cache.setCache(cache.invalidateCache(filePath, cache.getCache()));

  const dependents = cache.getDependentObjects(filePath, cache.getCache());

  dependents.forEach(dependent =>
    cache.setCache(cache.invalidateCache(dependent, cache.getCache()))
  );
};

const start = () => {
  console.log(`Starting Orbit`);

  const clientCode = client.getClientCode();

  if (process.env.BASE_PATH) process.chdir(process.env.BASE_PATH);

  const config = loadConfig();

  const hiccup = plugins.findPlugin("hiccup", config.plugins);
  if (hiccup)
    config.plugins = plugins.attachData(hiccup, { clientCode }, config.plugins);

  const app = new Koa();

  app.use(logger());
  app.use(rewrite(/^(\/?\w*\/+)$/, "$1index"));
  // TODO in production use output
  app.use(filePath(config));
  app.use(cache.cacheMiddleware(config));
  app.use(request(config));
  app.use(serve(config.cache));
  app.use(serve(config.input));

  const server = http.createServer(app.callback());
  const io = socketIO(server);

  io.on("connection", socket => {
    console.log(`HMR client connected ${socket.client.id}`);
  });

  const { port } = config;

  server.listen(port, async () => {
    console.log(`Server is listening on port ${port}`);

    // TODO close watcher
    const watcher = watchFolder(config.input, filePath => {
      handleFileChange(filePath);

      console.log(`Notifying clients`);

      io.emit("site_change");
    });
  });
};

start();

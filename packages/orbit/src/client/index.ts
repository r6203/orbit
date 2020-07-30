import fs from "fs";
import os from "os";
import { buildSync } from "esbuild";
import path from "path";

const makeTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "orbit-"));

export const getClientCode = (): string => {
  const filePath = path.join(makeTempDir(), "client-code.js");

  buildSync({
    entryPoints: ["./src/client/hmr.ts"],
    outfile: filePath,
    format: "iife",
    bundle: true,
  });

  const contents = fs.readFileSync(filePath, "utf-8");

  fs.unlinkSync(filePath)

  return contents
};

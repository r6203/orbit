import path from "path";

export const measureTime = async (fn: () => void) => {
  const start = process.hrtime();
  await fn();
  const end = process.hrtime(start);

  console.log("%ds %dms", end[0], end[1] / 1000000);
};

export const pp = (json: any) => console.log(JSON.stringify(json, null, 4));

export const getPath = (resourcePath: string, otherPath: string) =>
  path.join(otherPath, resourcePath);

export const normalizePath = (resourcePath: string, otherPath: string) =>
  path.relative(path.resolve(otherPath), path.resolve(resourcePath));

type PredicateFn = (value: any, key: string) => boolean;

export const findRootKey = (
  predicate: PredicateFn | string,
  obj: Record<string, any>,
  objPath: string[] = []
): string | undefined => {
  if (!obj || typeof obj !== "object") return;

  let search = predicate;
  if (typeof search === "string") {
    search = (_value, key) => key === predicate;
  }

  for (const [key, value] of Object.entries(obj)) {
    const entryPath = [...objPath, key];

    if (search(value, key)) return entryPath[0];

    const result = findRootKey(predicate, value, entryPath);

    if (result) return result;
  }
};

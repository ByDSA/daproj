import fs from "node:fs/promises";
import { findPackageJson } from "./find.mjs";

export async function findInPackageJsonName() {
  return await findInPackageJson("name");
}

async function findInPackageJson(key) {
  const packageJsonInfo = await findPackageJson();

  if (!packageJsonInfo)
    throw new Error("");

  const packageJson = await parsePackageJson(packageJsonInfo.path);

  return packageJson[key];
}

async function parsePackageJson(p) {
  return JSON.parse(
    await fs.readFile(p, "utf8"),
  );
}

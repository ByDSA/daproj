import fs from "node:fs";
import { $, echo } from "zx";
import { editPackageJson } from "../node/package-json/edit.mjs";

export async function getOutDir() {
  const tsconfigStr = await fs.promises.readFile("tsconfig.json", "utf8");
  const tsconfig = JSON.parse(tsconfigStr);

  return tsconfig.compilerOptions?.outDir;
}

export async function defaultBuild() {
  $.verbose = true;
  const outDir = await getOutDir();

  if (outDir === undefined)
    throw new Error("Cannot found outDir");

  await $`rm -rf ${outDir}`;

  try {
    $.verbose = false;
    await $`which tsc-alias`;
    $.verbose = true;
    await $`tsc -p tsconfig-build.json && tsc-alias -p tsconfig-build.json`;
  } catch {
    $.verbose = true;
    await $`tsc -p tsconfig-build.json`;
  }

  await $`cp package.json pnpm-lock.yaml ${outDir}`;

  echo`package.json: removing dev keys ...`;

  await editPackageJson(
    {
      scripts: null,
      devDependencies: null,
    },
    `${outDir}/package.json`,
  );

  return {
    outDir,
  };
}

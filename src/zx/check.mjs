import { $ } from "zx";
import { findInPackageJsonName } from "../node/package-json/get-info.mjs";
import { spinnerVerbose } from "./spinnerVerbose.mjs";

export async function defaultCheck() {
  const projectName = await findInPackageJsonName();

  try {
    await spinnerVerbose(projectName + ": Installing dependencies ...", async () => {
      await $`rm -rf node_modules`;
      await $`pnpm i --ignore-workspace`;
    } );

    await spinnerVerbose(projectName + ": Linting ...", ()=> $`pnpm lint`);
    await spinnerVerbose(projectName + ": Testing ...", ()=> $`pnpm test`);
    await spinnerVerbose(projectName + ": Building ...", ()=> $`pnpm build`);
  } catch {
    process.exit(1);
  }
}

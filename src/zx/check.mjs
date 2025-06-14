import { $ } from "zx";
import { findInPackageJsonName } from "../node/package-json/get-info.mjs";
import { spinnerVerbose } from "./spinnerVerbose.mjs";

export async function defaultCheck() {
  const projectName = await findInPackageJsonName();

  try {
    await spinnerVerbose(projectName + ": (Re)Installing dependencies ...", async () => {
      const { stdout } = await $`pnpm pkg get scripts.reinstall`;

      if (stdout.trim() === "{}") {
        await $`rm -rf node_modules`;
        await $`pnpm i --ignore-workspace`;
      } else
        await $`pnpm reinstall`;
    } );

    await spinnerVerbose(projectName + ": Linting ...", ()=> $`pnpm lint`);
    await spinnerVerbose(projectName + ": Testing ...", ()=> $`pnpm test`);
    await spinnerVerbose(projectName + ": Building ...", ()=> $`pnpm build`);
  } catch {
    process.exit(1);
  }
}

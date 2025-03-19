import { $ } from "zx";
import { spinnerVerbose } from "./spinnerVerbose.mjs";

export async function defaultCheck() {
  try {
    await spinnerVerbose("Installing dependencies ...", async () => {
      await $`rm -rf node_modules`;
      await $`pnpm i --ignore-workspace`;
    } );

    await spinnerVerbose("Linting ...", ()=> $`pnpm lint`);
    await spinnerVerbose("Testing ...", ()=> $`pnpm test`);
    await spinnerVerbose("Building ...", ()=> $`pnpm build`);
  } catch {
    process.exit(1);
  }
}

import { $, spinner } from "zx";

export async function spinnerVerbose(title, fn) {
  await spinner(title, async ()=> {
    process.env.FORCE_COLOR = "1";
    $.verbose = true;
    await fn();
  } );
}

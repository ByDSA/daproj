// @ts-check
import { generateConfigs as generateConfigsJest } from "../testing/jest/eslint.mjs";
import { ALL_KEY_DEPENDENCIES, Dependencies, DEPENDENCIES_AUTO } from "../index.mjs";
import { generateConfigs as generateConfigsTs } from "../typescript/eslint.mjs";
import { generateConfigs as generateConfigsReact } from "../react/eslint.mjs";
import { generateConfigs as generateConfigsPrettier } from "../prettier/eslint.mjs";
import { generateConfigs as generateConfigsNode } from "../node/eslint.mjs";
import { generateConfigs as generateConfigsZx } from "../zx/eslint.mjs";
import { generateConfigs as generateConfigsEslint } from "./eslint.mjs";
import { generateConfigs as generateConfigsCommon } from "./eslint.config.common.mjs";
import { fixAutoArgs } from "./auto-args.mjs";

export async function generateConfigs(args) {
  const ret = [];

  if (
    args[DEPENDENCIES_AUTO]
    || (args[DEPENDENCIES_AUTO] === false && ALL_KEY_DEPENDENCIES.some(k=>args[k] !== undefined))
  )
    await fixAutoArgs(args);

  ret.push(...generateConfigsCommon(args));

  ret.push(...generateConfigsZx(args));

  if (args[Dependencies.TypeScript])
    ret.push(...generateConfigsTs(args));

  if (args[Dependencies.React])
    ret.push(...generateConfigsReact(args));

  if (args[Dependencies.Node])
    ret.push(...generateConfigsNode(args));

  if (args[Dependencies.Jest])
    ret.push(...generateConfigsJest(args));

  if (args[Dependencies.Eslint])
    ret.push(...generateConfigsEslint(args));

  if (args[Dependencies.Prettier])
    ret.push(...generateConfigsPrettier(args));

  return ret;
}

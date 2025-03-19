import { Dependencies } from "../index.mjs";
import * as daproj from "../eslint/custom-plugin/eslint-plugin-daproj.mjs";
import stylisticTsMod from "./eslint.config.stylisticTs.mjs";
import typescriptMod from "./eslint.config.typescript.mjs";

// Para que funcione "import/resolver".typescript
import "eslint-import-resolver-typescript";

export const plugins = {
  "@typescript-eslint": typescriptMod.plugin,
  "@stylistic/ts": stylisticTsMod.plugin,
  daproj: daproj.plugin,
};
const rules = {
  ...typescriptMod.rules,
  ...stylisticTsMod.rules,
  ...daproj.defaultRules,
};
const settings = {
  "import/parsers": {
    "@typescript-eslint/parser": [".ts", ".tsx"],
  },
  "import/resolver": {
    node: {
      paths: ["src"],
    },
    typescript: {
      alwaysTryTypes: true,
    },
  },
};

export function generateConfigs(args) {
  let files = ["**/*.ts"];

  if (args[Dependencies.React])
    files.push("**/*.tsx");

  const ret = [
    {
      files,
      settings,
      languageOptions: {
        parser: typescriptMod.parser,
        parserOptions: typescriptMod.parserOptions,
      },
      plugins: {
        ...plugins,
      },
      rules: {
        ...rules,
      },
    },
  ];

  return ret;
}

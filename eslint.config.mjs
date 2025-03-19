import { Dependencies } from "./src/index.mjs";
import { generateConfigs } from "./src/eslint/index.mjs";

const generatedConfigs = await generateConfigs( {
  [Dependencies.Eslint]: true,
} );

export default [
  ...generatedConfigs,
  {
    files: ["**/*.mjs"],
    rules: {
      "no-console": "warn",
    },
  },
];

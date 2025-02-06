import { Dependencies } from "./index.mjs";
import { generateConfigs } from "./eslint/index.mjs";

const generatedConfigs = generateConfigs( {
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

import importPlugin from "eslint-plugin-import";

const formatRules = {
  "import/newline-after-import": ["error", {
    count: 1,
    considerComments: true,
  }],
};
const lintingRules = {
  "import/first": "error",
  "import/order": ["error", { // Orden de los imports, require...
    "newlines-between": "never", // Impide líneas en blanco entre imports
    groups: ["type", "builtin", "external", "internal", "parent", "sibling", "index", "object"],
  }],
  "import/no-absolute-path": "error",
  "import/no-cycle": ["error", {
    maxDepth: 1,
  }],
  "import/no-default-export": "error",
  "import/no-internal-modules": "off",
  "import/no-extraneous-dependencies": "off", // Si se activa, da problemas con los monorepo multipaquete
  "import/no-unresolved": "off",
  "import/extensions": "off",
};

export const rules = {
  ...lintingRules,
  ...formatRules,
};

export const plugin = importPlugin;

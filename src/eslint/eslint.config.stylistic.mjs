import stylisticPlugin from "@stylistic/eslint-plugin";

export const rules = {
  "@stylistic/spaced-comment": ["error", "always", { block: { balanced: true } }],
  "@stylistic/lines-around-comment": ["error", {
    afterLineComment: false,
    afterBlockComment: false,
  }],
  "@stylistic/newline-per-chained-call": [
    "error",
    {
      ignoreChainWithDepth: 2,
    },
  ],
};

export const plugin = stylisticPlugin;

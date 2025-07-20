import * as mongoosePascalCaseModels from "./rules/mongoose-pascalcase-models.mjs";
import * as indentAfterDecorator from "./rules/indent-after-decorator.mjs";
import * as emptyLineAfterComment from "./rules/empty-line-after-comment.mjs";
import * as noLeadingBlankLines from "./rules/no-leading-blank-lines.mjs";
import * as nestjsConstructorDeps from "./rules/nestjs-constructor-deps.mjs";
import * as maxLen from "./rules/max-len.mjs";
import * as noBlankLinesBetweenDecorators from "./rules/no-blank-lines-between-decorators.mjs";

/**
 * @typedef {{rule: Rule, NAME: string}} RuleModule
 */

/**
 * @type {RuleModule[]}
 */
const ruleModules = [
  noLeadingBlankLines,
  noBlankLinesBetweenDecorators,
  indentAfterDecorator,
  mongoosePascalCaseModels,
  emptyLineAfterComment,
  nestjsConstructorDeps,
  maxLen,
];
const createRulesObject = (ruleModules) => {
  const entries = ruleModules.map(ruleModule => [ruleModule.NAME, ruleModule.rule]);

  return Object.fromEntries(entries);
};

export const plugin = {
  meta: {
    name: "eslint-plugin-daproj",
    version: "0.0.2",
  },
  rules: createRulesObject(ruleModules),
};

const createDefaultParamRules = (...moduleConfigs) => {
  return Object.fromEntries(
    moduleConfigs.map(([module, value]) => [`daproj/${module.NAME}`, value]),
  );
};

export const defaultRules = createDefaultParamRules(
  [noLeadingBlankLines, "error"],
  [indentAfterDecorator, "error"],
  [noBlankLinesBetweenDecorators, "error"],
  [nestjsConstructorDeps, "error"],
  [maxLen, "error"],
  [emptyLineAfterComment, "warn"],
  [mongoosePascalCaseModels, "off"],
);

/* eslint-disable max-len */
/* eslint-disable func-names */
import * as mongoosePascalCaseModels from "./rules/mongoose-pascalcase-models.mjs";
import * as indentAfterDecorator from "./rules/indent-after-decorator.mjs";
import * as emptyLineAfterComment from "./rules/empty-line-after-comment.mjs";
import * as noLeadingBlankLines from "./rules/no-leading-blank-lines.mjs";

export const plugin = {
  meta: {
    name: "eslint-plugin-daproj",
    version: "0.0.2",
  },
  rules: {
    [noLeadingBlankLines.NAME]: noLeadingBlankLines.rule,
    "no-blank-lines-after-decorator": {
      meta: {
        fixable: "code",
      },
      create(context) {
        function checkNode(node) {
          const { decorators } = node;

          if (decorators && decorators.length > 0) {
            const decorator = decorators.at(-1);
            const decoratorLine = decorator.loc.end.line;
            let nodeLoc;
            let nodeRange;

            if (node.type === "ClassDeclaration") {
              nodeLoc = node.loc;
              nodeRange = node.range;
            } else {
              nodeLoc = node.key.loc;
              nodeRange = node.key.range;
            }

            let nodeLine = nodeLoc.start.line;

            if (decoratorLine + 1 !== nodeLine) {
              context.report( {
                node,
                message: "There should be no blank lines after a decorator.",
                fix: function (fixer) {
                  const range = [decorator.range[1], nodeRange[0] - nodeLoc.start.column];

                  return fixer.replaceTextRange(range, "\n");
                },
              } );
            }
          }
        };

        return {
          PropertyDefinition: checkNode,
          MethodDefinition: checkNode,
          ClassDeclaration: checkNode,
        };
      },
    },
    "no-blank-lines-between-decorators": {
      meta: {
        fixable: "code",
      },
      create(context) {
        return {
          PropertyDefinition(node) {
            const { decorators } = node;

            for (let i = 1; i < decorators.length; i++) {
              const previousDecorator = decorators[i - 1];
              const currentDecorator = decorators[i];
              const previousDecoratorLine = previousDecorator.loc.end.line;
              const currentDecoratorLine = currentDecorator.loc.start.line;

              if (previousDecoratorLine + 1 !== currentDecoratorLine) {
                context.report( {
                  node,
                  message: "There should be no blank lines between decorators.",
                  fix: function (fixer) {
                    const range = [previousDecorator.range[1], currentDecorator.range[0] - currentDecorator.loc.start.column];

                    return fixer.replaceTextRange(range, "\n");
                  },
                } );
              }
            }
          },
        };
      },
    },
    [indentAfterDecorator.NAME]: indentAfterDecorator.rule,
    [mongoosePascalCaseModels.NAME]: mongoosePascalCaseModels.rule,
    [emptyLineAfterComment.NAME]: emptyLineAfterComment.rule,
  },
};

export const defaultRules = {
  "daproj/indent-after-decorator": "error",
  "daproj/no-blank-lines-after-decorator": "error",
  "daproj/no-blank-lines-between-decorators": "error",
  "daproj/no-leading-blank-lines": "error",
  "daproj/mongoose-pascalcase-models": "off", // requires TS processor
  "daproj/empty-line-after-comment": "error",
};

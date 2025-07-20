export const NAME = "nestjs-constructor-deps";

export const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require private readonly for constructor parameters in @Injectable() classes",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      missingPrivateReadonly: "Constructor parameter \"{{paramName}}\" in @Injectable class should \
be private readonly",
      missingPrivate: "Constructor parameter \"{{paramName}}\" in @Injectable class should be \
private",
      missingReadonly: "Constructor parameter \"{{paramName}}\" in @Injectable class should be \
readonly",
    },
  },

  create(context) {
    // Helper function to check if a class has @Injectable decorator
    function hasInjectableDecorator(classNode) {
      if (!classNode.decorators)
        return false;

      return classNode.decorators.some(decorator => {
        if (decorator.expression.type === "CallExpression")
          return DECORATORS_SET.has(decorator.expression.callee.name);

        return DECORATORS_SET.has(decorator.expression.name);
      } );
    }

    // Helper function to get parameter name for error reporting
    function getParameterName(param) {
      if (param.parameter && param.parameter.name)
        return param.parameter.name;

      if (param.left && param.left.name)
        return param.left.name;

      return "unknown";
    }

    return {
      ClassDeclaration(node) {
        // Only check classes with @Injectable decorator
        if (!hasInjectableDecorator(node))
          return;

        // Find constructor in the class
        const constructor = node.body.body.find(
          member => member.type === "MethodDefinition" && member.kind === "constructor",
        );

        if (!constructor || !constructor.value.params)
          return;

        // Check each constructor parameter
        constructor.value.params.forEach(param => {
          // Only check TypeScript parameter properties
          if (param.type === "TSParameterProperty") {
            const paramName = getParameterName(param);
            const hasPrivate = param.accessibility === "private";
            const hasReadonly = param.readonly === true;

            if (!hasPrivate && !hasReadonly) {
              context.report( {
                node: param,
                messageId: "missingPrivateReadonly",
                data: { paramName },
                fix(fixer) {
                  return fixer.replaceText(
                    param,
                    `private readonly ${context.getSourceCode().getText(param.parameter)}`,
                  );
                },
              } );
            } else if (!hasPrivate) {
              context.report( {
                node: param,
                messageId: "missingPrivate",
                data: { paramName },
                fix(fixer) {
                  const sourceCode = context.getSourceCode();
                  const text = sourceCode.getText(param);

                  return fixer.replaceText(param, `private ${text}`);
                },
              } );
            } else if (!hasReadonly) {
              context.report( {
                node: param,
                messageId: "missingReadonly",
                data: { paramName },
                fix(fixer) {
                  const sourceCode = context.getSourceCode();
                  const text = sourceCode.getText(param);

                  // Insert readonly after private
                  return fixer.replaceText(param, text.replace("private", "private readonly"));
                },
              } );
            }
          } else {
            // Regular parameter without any property declaration
            // These should be converted to private readonly
            const paramName = param.name || "unknown";

            context.report( {
              node: param,
              messageId: "missingPrivateReadonly",
              data: { paramName },
              fix(fixer) {
                const sourceCode = context.getSourceCode();
                const paramText = sourceCode.getText(param);

                return fixer.replaceText(param, `private readonly ${paramText}`);
              },
            } );
          }
        } );
      },
    };
  },
};

const DECORATORS_SET = new Set(Object.freeze(["Injectable", "Controller"]));

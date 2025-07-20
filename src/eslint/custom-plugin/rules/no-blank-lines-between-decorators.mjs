/* eslint-disable func-names */
export const NAME = "no-blank-lines-between-decorators";

export const rule = {
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
                const range = [
                  previousDecorator.range[1],
                  currentDecorator.range[0] - currentDecorator.loc.start.column,
                ];

                return fixer.replaceTextRange(range, "\n");
              },
            } );
          }
        }
      },
    };
  },
};

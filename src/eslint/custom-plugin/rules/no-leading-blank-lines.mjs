/* eslint-disable func-names */
export const NAME = "no-leading-blank-lines";

export const rule = {
  meta: {
    fixable: "code",
  },
  create(context) {
    const checkNode = (node) => {
      const sourceCode = context.getSourceCode();
      const { lines } = sourceCode;
      let line = 0;

      while (line < lines.length && lines[line].trim() === "") {
        context.report( {
          node,
          loc: { line: line + 1, column: 0 },
          message: "Leading blank lines are not allowed.",
          fix: function (fixer) {
            const rangeStart = sourceCode.getIndexFromLoc( { line: line + 1, column: 0 } );
            const rangeEnd = sourceCode.getIndexFromLoc( { line: line + 2, column: 0 } );

            return fixer.removeRange([rangeStart, rangeEnd]);
          },
        } );
        line++;
      }
    };

    return {
      Program: checkNode,
    };
  },
};

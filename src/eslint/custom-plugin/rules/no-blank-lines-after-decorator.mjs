/* eslint-disable func-names */
export const NAME = "indent-after-decorator";

export const rule = {
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
};

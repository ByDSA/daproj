export const NAME = "empty-line-after-comment";

export const rule = {
  meta: {
    type: "layout",
    docs: {
      description: "Prohíbe líneas vacías después de los comentarios.",
      category: "Stylistic Issues",
      recommended: false,
    },
    schema: [{
      type: "object",
      properties: {
        allowBetweenLineAndBlock: { type: "boolean" },
        allowBetweenLines: { type: "boolean" },
        allowBetweenBlocks: { type: "boolean" },
        allowBetweenBlockAndLine: { type: "boolean" },
      },
      additionalProperties: false,
    }],
    fixable: "whitespace",
    messages: {
      unexpected: "No debe haber una línea vacía después de una línea de comentario.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const props = {
      allowBetweenLineAndBlock: options.allowBetweenLineAndBlock ?? true,
      allowBetweenLines: options.allowBetweenLines ?? false,
      allowBetweenBlocks: options.allowBetweenBlocks ?? true,
      allowBetweenBlockAndLine: options.allowBetweenBlockAndLine ?? false,
    };

    return {
      Program(_node) {
        const sourceCode = context.getSourceCode();
        const { lines } = sourceCode;
        const comments = sourceCode.getAllComments();
        const commentLines = comments.filter(comment=>{
          const commentLine = comment.loc.start.line;
          const commentLineText = lines[commentLine - 1].trim();

          return commentLineText.startsWith("//")
          || (commentLineText.startsWith("/*") && commentLineText.endsWith("*/"));
        } );

        commentLines.forEach((comment, i) => {
          const commentLine = comment.loc.start.line;
          const commentLineText = lines[commentLine - 1].trim();
          const nextLine = lines[commentLine];

          if (nextLine === undefined)
            return;

          // Verificar si la línea siguiente está vacía
          if (nextLine.trim() === "") {
            const nextComment = commentLines[i + 1];

            if (nextComment) {
              const nextCommentLine = nextComment.loc.start.line;

              if (nextCommentLine === commentLine + 2) {
                const commentLineType = commentLineText.startsWith("//") ? "line" : "block";
                const nextCommentLineText = lines[nextCommentLine - 1].trim();
                const nextCommentLineType = nextCommentLineText.startsWith("//") ? "line" : "block";

                if (props.allowBetweenLines && commentLineType === "line" && nextCommentLineType === "line")
                  return;

                if (props.allowBetweenBlocks && commentLineType === "block" && nextCommentLineType === "block")
                  return;

                if (props.allowBetweenLineAndBlock && commentLineType === "line" && nextCommentLineType === "block")
                  return;

                if (props.allowBetweenBlockAndLine && commentLineType === "block" && nextCommentLineType === "line")
                  return;
              }
            }

            context.report( {
              loc: { start: { line: commentLine + 1, column: 0 } },
              messageId: "unexpected",
              fix(fixer) {
                const nextLineStart = sourceCode.getIndexFromLoc( {
                  line: commentLine + 1,
                  column: 0,
                } );
                const nextLineEnd = sourceCode.getIndexFromLoc( {
                  line: commentLine + 2,
                  column: 0,
                } );

                return fixer.removeRange([nextLineStart, nextLineEnd]);
              },
            } );
          }
        } );
      },
    };
  },
};

function formatOperators(state, baseIndent, nextIndent) {
  const operators = [
    "&&",
    "||",
    "??",
    "<=",
    ">=",
    "==",
    "!=",
    "+",
    "-",
    "*",
    "/",
    "%",
    "<",
    ">",
    "=",
  ];
  const matches = [];

  for (const op of operators) {
    const safeOp = op.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
    const regex = new RegExp(`\\s+(${safeOp})\\s+`, "g");
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(state.content)) !== null) {
      matches.push( {
        index: match.index,
        op: match[1],
        length: match[0].length,
      } );
    }
  }

  if (matches.length === 0)
    return state;

  matches.sort((a, b) => b.index - a.index);

  for (const { index, op, length } of matches) {
    const before = state.content.slice(0, index).trimEnd();
    const after = state.content.slice(index + length).trimStart();
    const firstLine = `${before} ${op}`;
    const secondLine = `${nextIndent}${after}`;

    if (firstLine.length <= 100 && secondLine.length <= 100) {
      return {
        content: `${firstLine}\n${secondLine}`,
        fixed: true,
        done: true,
      };
    }
  }

  return state;
}/* eslint-disable no-cond-assign */
export const NAME = "max-len";

export const rule = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce a maximum line length with autofix for function signatures",
      category: "Stylistic Issues",
    },
    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          code: { type: "integer", minimum: 0 },
          ignoreComments: { type: "boolean" },
          ignoreUrls: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const maxLength = options.code ?? 100;
    const { sourceCode } = context;
    const shouldIgnoreLine = (line) => {
      return (options.ignoreUrls && /https?:\/\//.test(line))
             || (options.ignoreComments && line.trim().startsWith("//"))
             || /\/[^/\n]+\/[gimuy]*/.test(line);
    };
    const getLineLength = (line) => line.replace(/\t/g, "  ").length;

    return {
      Program() {
        sourceCode.lines.forEach((line, i) => {
          const length = getLineLength(line);

          if (length <= maxLength || shouldIgnoreLine(line))
            return;

          const start = sourceCode.getIndexFromLoc( { line: i + 1, column: 0 } );
          const end = sourceCode.getIndexFromLoc( { line: i + 1, column: line.length } );
          const result = formatLine(line);

          context.report( {
            loc: { start: { line: i + 1, column: length }, end: { line: i + 1, column: length } },
            message: `Line too long: ${length} characters (max ${maxLength})`,
            fix: result.fixed
              ? fixer => fixer.replaceTextRange([start, end], result.content)
              : undefined,
          } );
        } );
      },
    };
  },
};

function formatLine(line) {
  const baseIndent = (line.match(/^\s*/) || [""])[0];
  const nextIndent = baseIndent + "  ";
  // Crear estado inicial
  let state = {
    content: line,
    fixed: false,
    done: false,
  };
  // Pipeline de formateo (en orden)
  const formatFunctions = [
    { fn: formatTernaryOperator, name: "Operador ternario" }, // 1
    { fn: formatArraysRecursive, name: "Arrays" }, // 2
    { fn: formatFunctionCalls, name: "Llamadas a funciones" }, // 3
    { fn: formatOperators, name: "Operadores" }, // 4
    { fn: formatStrings, name: "Strings normales" }, // 5
    { fn: formatTemplateLiterals, name: "Template literals" }, // 6
  ];

  for (const f of formatFunctions) {
    state = f.fn(state, baseIndent, nextIndent);

    if (state.done)
      return state;
  }

  return state;
}

function formatTernaryOperator(state, baseIndent, nextIndent) {
  if (state.done)
    return state;

  // Buscar operador ternario que supere 70 caracteres
  const ternaryRegex = /([^?]*)\?\s*([^:]*)\s*:\s*(.*)/;
  const match = state.content.match(ternaryRegex);

  if (!match)
    return state;

  const [fullMatch, condition, trueValue, falseValue] = match;

  // Solo aplicar si el ternario completo supera 70 caracteres
  if (fullMatch.length <= 70)
    return state;

  const beforeTernary = state.content.slice(0, state.content.indexOf(fullMatch));
  const afterTernary = state.content.slice(state.content.indexOf(fullMatch) + fullMatch.length);
  const formattedTernary = `${condition.trim()}\n${nextIndent}
    ? ${trueValue.trim()}\n${nextIndent}
    : ${falseValue.trim()}`;
  const newContent = beforeTernary + formattedTernary + afterTernary;

  return {
    content: newContent,
    fixed: true,
    done: newContent.split("\n").every(l => l.length <= 100),
  };
}

function formatArraysRecursive(state, baseIndent, nextIndent, maxIterations = 10) {
  if (state.done || maxIterations <= 0)
    return state;

  const arrayResult = splitLongestArray(state.content, nextIndent);

  if (!arrayResult)
    return state;

  const newContent = arrayResult.before
                    + arrayResult.formattedElements.map(el => nextIndent + "  " + el).join("\n")
                    + arrayResult.after;
  const newState = {
    content: newContent,
    fixed: true,
    done: newContent.split("\n").every(l => l.length <= 100),
  };

  return newState.done ? newState : formatArraysRecursive(newState, nextIndent, maxIterations - 1);
}

function splitLongestArray(line, nextIndent) {
  const arrayRegex = /\[[^[\]]*(?:\[[^[\]]*\][^[\]]*)*\]/g;
  let longestArray = null;
  let match;

  while ((match = arrayRegex.exec(line)) !== null) {
    const { length } = match[0];

    if (length > 70 && (!longestArray || length > longestArray.length)) {
      longestArray = {
        content: match[0],
        start: match.index,
        end: match.index + length,
        length,
      };
    }
  }

  if (!longestArray)
    return null;

  const before = line.slice(0, longestArray.start);
  const after = line.slice(longestArray.end);
  const innerContent = longestArray.content.slice(1, -1).trim();

  if (innerContent.length < 20)
    return null;

  const elements = parseArrayElements(innerContent);

  if (elements.length < 2)
    return null;

  const formattedElements = elements.map((el, i) => el.trim() + (i === elements.length - 1
    ? ""
    : ","));

  return {
    before: `${before}[\n`,
    formattedElements,
    after: `\n${nextIndent}]${after}`,
  };
}

function parseArrayElements(content) {
  const elements = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prevChar = content[i - 1] || "";

    if ((char === "\"" || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
    }

    if (!inString) {
      if ("[({".includes(char))
        depth++;
      else if ("])}".includes(char))
        depth--;

      if (char === "," && depth === 0) {
        if (current.trim()) {
          elements.push(current.trim());
          current = "";
        }

        continue;
      }
    }

    current += char;
  }

  if (current.trim())
    elements.push(current.trim());

  return elements;
}

function formatFunctionCalls(state, baseIndent, nextIndent) {
  if (state.done)
    return state;

  // Buscar llamadas a funciones de forma más robusta
  const functionCallRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*\(/g;
  let longestCall = null;
  let match;

  while ((match = functionCallRegex.exec(state.content)) !== null) {
    const functionName = match[1];
    const openParenIndex = match.index + match[0].length - 1; // Posición del '('
    // Encontrar el paréntesis de cierre correspondiente
    const argsResult = extractFunctionArguments(state.content, openParenIndex);

    if (!argsResult)
      continue;

    const fullCall = state.content.slice(match.index, argsResult.endIndex + 1);

    // Solo procesar si la llamada completa supera 70 caracteres
    if (fullCall.length > 70 && (!longestCall || fullCall.length > longestCall.length)) {
      longestCall = {
        content: fullCall,
        functionName,
        argsContent: argsResult.content,
        start: match.index,
        end: argsResult.endIndex + 1,
        length: fullCall.length,
      };
    }
  }

  if (!longestCall)
    return state;

  const before = state.content.slice(0, longestCall.start);
  const after = state.content.slice(longestCall.end);
  // Parsear los argumentos
  const args = parseFunctionArguments(longestCall.argsContent);

  // Siempre intentar formatear si hay argumentos, incluso con 1 solo
  if (args.length === 0)
    return state;

  // Formatear la llamada con cada argumento en su línea
  const formattedArgs = args.map((arg, index) => {
    const isLast = index === args.length - 1;

    return `${nextIndent}${arg.trim()}${isLast ? "" : ","}`;
  } );
  const formattedCall = `${longestCall.functionName}(\n${formattedArgs.join("\n")}\n${baseIndent})`;
  const content = before + formattedCall + after;

  return {
    content,
    fixed: true,
    done: content.split("\n").every(l => l.length <= 100),
  };
}

function extractFunctionArguments(content, openParenIndex) {
  let depth = 1;
  let i = openParenIndex + 1;
  let inString = false;
  let stringChar = "";

  while (i < content.length && depth > 0) {
    const char = content[i];
    const prevChar = content[i - 1] || "";

    // Manejo de strings
    if ((char === "\"" || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
    }

    if (!inString) {
      if (char === "(")
        depth++;
      else if (char === ")")
        depth--;
    }

    i++;
  }

  if (depth !== 0)
    return null; // Paréntesis no balanceados

  const argsContent = content.slice(openParenIndex + 1, i - 1);

  return {
    content: argsContent,
    endIndex: i - 1,
  };
}

function parseFunctionArguments(argsString) {
  if (!argsString.trim())
    return [];

  const args = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    const prevChar = argsString[i - 1] || "";

    // Manejo de strings
    if ((char === "\"" || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
    }

    if (!inString) {
      // Manejo de paréntesis, llaves y corchetes
      if ("([{".includes(char))
        depth++;
      else if (")]}".includes(char))
        depth--;

      // Si encontramos una coma en el nivel superior, es un separador de argumentos
      if (char === "," && depth === 0) {
        if (current.trim()) {
          args.push(current.trim());
          current = "";
        }

        continue;
      }
    }

    current += char;
  }

  // Añadir el último argumento
  if (current.trim())
    args.push(current.trim());

  return args;
}

function formatStrings(state) {
  if (state.done)
    return state;

  // Buscar strings (comillas simples o dobles) que superen 70 caracteres
  const stringRegex = /(["'])((?:\\.|(?!\1)[^\\])*)\1/g;
  let longestString = null;
  let match;

  while ((match = stringRegex.exec(state.content)) !== null) {
    const fullString = match[0];

    if (fullString.length > 70 && (!longestString || fullString.length > longestString.length)) {
      longestString = {
        content: fullString,
        quote: match[1],
        innerContent: match[2],
        start: match.index,
        end: match.index + fullString.length,
      };
    }
  }

  if (!longestString)
    return state;

  const before = state.content.slice(0, longestString.start);
  const after = state.content.slice(longestString.end);
  // Calcular el espacio disponible: línea completa - comillas - escape - margen
  const firstLineSpace = 100 - before.length - 3; // 3 para quote + \ + margen
  const continuationLineSpace = 100 - 1; // 1 para la quote final
  // Dividir el contenido del string preservando su valor
  const lines = splitStringContentWithEscape(
    longestString.innerContent,
    firstLineSpace,
    continuationLineSpace,
  );

  if (lines.length <= 1)
    return state; // No se puede dividir efectivamente

  // Formar el string multilinea usando escape de línea
  const formattedLines = lines.map((line, index) => {
    if (index === 0)
      return `${longestString.quote}${line}\\`;
    else if (index === lines.length - 1)
      return `${line}${longestString.quote}`;
    else
      return `${line}\\`;
  } );
  const formattedString = formattedLines.join("\n");

  return {
    content: before + formattedString + after,
    fixed: true,
    done: (before + formattedString + after).split("\n").every(l => l.length <= 100),
  };
}

function formatTemplateLiterals(state) {
  if (state.done)
    return state;

  // Buscar template literals que superen 70 caracteres
  const templateRegex = /`([^`]*)`/g;
  let longestTemplate = null;
  let match;

  while ((match = templateRegex.exec(state.content)) !== null) {
    const fullTemplate = match[0];

    if (fullTemplate.length > 70 && (!longestTemplate || fullTemplate.length
      > longestTemplate.length)) {
      longestTemplate = {
        content: fullTemplate,
        innerContent: match[1],
        start: match.index,
        end: match.index + fullTemplate.length,
      };
    }
  }

  if (!longestTemplate)
    return state;

  const before = state.content.slice(0, longestTemplate.start);
  const after = state.content.slice(longestTemplate.end);
  // Calcular el espacio disponible: línea completa - backticks - escape - margen
  const firstLineSpace = 100 - before.length - 3; // 3 para ` + \ + margen
  const continuationLineSpace = 100 - 1; // 1 para el ` final
  // Dividir el contenido del template literal preservando su valor
  const lines = splitStringContentWithEscape(
    longestTemplate.innerContent,
    firstLineSpace,
    continuationLineSpace,
  );

  if (lines.length <= 1)
    return state; // No se puede dividir efectivamente

  // Formar el template literal multilinea usando escape de línea
  const formattedLines = lines.map((line, index) => {
    if (index === 0)
      return `\`${line}\\`;
    else if (index === lines.length - 1)
      return `${line}\``;
    else
      return `${line}\\`;
  } );
  const formattedTemplate = formattedLines.join("\n");

  return {
    content: before + formattedTemplate + after,
    fixed: true,
    done: (before + formattedTemplate + after).split("\n").every(l => l.length <= 100),
  };
}

function splitStringContentWithEscape(content, firstLineSpace, continuationLineSpace) {
  const lines = [];
  let currentLine = "";
  // Dividir por palabras para evitar cortar en medio de una palabra
  const words = content.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const separator = i === 0 ? "" : " ";
    const maxSpace = lines.length === 0 ? firstLineSpace : continuationLineSpace;

    // Si añadir esta palabra excede el límite
    if (currentLine.length + separator.length + word.length > maxSpace) {
      if (currentLine) {
        lines.push(currentLine + separator);
        currentLine = word;
      } else {
        // La palabra sola es muy larga, dividirla por fuerza
        lines.push(word.substring(0, maxSpace));
        currentLine = word.substring(maxSpace);
      }
    } else
      currentLine += separator + word;
  }

  if (currentLine)
    lines.push(currentLine);

  // Si solo hay una línea, no vale la pena dividir
  return lines.length > 1 ? lines : [content];
}

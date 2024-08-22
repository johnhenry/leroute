export const InlineParameter = ({
  name,
  type = "string",
  optional = false,
  transform = (x) => x,
}) => {
  return { type: "inlineParam", name, paramType: type, optional, transform };
};

export const HeaderMatch = ({
  name,
  operator = "exists",
  value,
  negate = false,
}) => {
  return { type: "headerMatch", name, operator, value, negate };
};

export const HTTPExpression = (strings, ...expressions) => {
  let method,
    pathPattern = "",
    headerMatchers = [];
  let currentPart = "METHOD";
  let buffer = "";

  const processBuffer = () => {
    if (currentPart === "METHOD") {
      method = buffer.trim();
      currentPart = "PATH";
    } else if (currentPart === "PATH") {
      pathPattern += buffer;
    }
    buffer = "";
  };

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    for (let j = 0; j < str.length; j++) {
      const char = str[j];
      if (char === " " && currentPart === "METHOD") {
        processBuffer();
      } else if (char === "[" && currentPart !== "HEADER_VALUE") {
        processBuffer();
        currentPart = "HEADERS";
        buffer = "[";
      } else if (char === "]" && currentPart === "HEADERS") {
        buffer += char;
        headerMatchers.push(parseHeaderMatcher(buffer));
        buffer = "";
      } else {
        buffer += char;
      }
    }

    processBuffer();

    if (i < expressions.length) {
      const expr = expressions[i];
      if (expr && expr.type === "inlineParam") {
        pathPattern += `:${expr.name}`;
      } else if (expr && expr.type === "headerMatch") {
        headerMatchers.push(createHeaderMatcherFunction(expr));
      }
    }
  }

  pathPattern = pathPattern.trim();
  const pathRegex = new RegExp(
    "^" + pathPattern.replace(/:\w+/g, "([^/]+)") + "$"
  );
  const paramNames = (pathPattern.match(/:\w+/g) || []).map((p) => p.slice(1));

  return {
    test(request) {
      if (request.method !== method) return false;
      if (!pathRegex.test(new URL(request.url).pathname)) return false;
      return headerMatchers.every((matcher) => matcher(request.headers));
    },
    exec(request) {
      if (!this.test(request)) return null;
      const match = new URL(request.url).pathname.match(pathRegex);
      const params = Object.fromEntries(
        paramNames.map((name, i) => [name, match[i + 1]])
      );
      return { ...params, method, headers: request.headers };
    },
  };
};

const parseHeaderMatcher = (headerString) => {
  const match = headerString.match(/\[(!?)([^=~^$*<>]+)([=~^$*<>]+)?(.+)?\]/);
  if (!match) {
    throw new Error(`Invalid header matcher: ${headerString}`);
  }
  const [, negation, name, operator, value] = match;
  return createHeaderMatcherFunction({
    name: name.trim(),
    operator: operator?.trim(),
    value: value?.trim(),
    negate: !!negation,
  });
};

const createHeaderMatcherFunction = ({ name, operator, value, negate }) => {
  return (headers) => {
    const headerValue = headers.get(name);
    const exists = headers.has(name);
    let match = false;

    if (!operator || operator === "exists") {
      match = exists;
    } else if (!exists) {
      match = false;
    } else {
      switch (operator) {
        case "=":
          match = headerValue === value;
          break;
        case "~=": {
          let regex = value || "";
          let flags = "";
          if (regex.startsWith("(?i)")) {
            regex = regex.slice(4);
            flags = "i";
          }
          match = new RegExp(regex, flags).test(headerValue);
          break;
        }
        case "^=":
          match = headerValue.startsWith(value || "");
          break;
        case "$=":
          match = headerValue.endsWith(value || "");
          break;
        case "*=":
          match = headerValue.includes(value || "");
          break;
        case ">":
          match = parseFloat(headerValue) > parseFloat(value || "0");
          break;
        case "<":
          match = parseFloat(headerValue) < parseFloat(value || "0");
          break;
        case ">=":
          match = parseFloat(headerValue) >= parseFloat(value || "0");
          break;
        case "<=":
          match = parseFloat(headerValue) <= parseFloat(value || "0");
          break;
        default:
          match = false;
      }
    }
    return negate ? !match : match;
  };
};

export default HTTPExpression;

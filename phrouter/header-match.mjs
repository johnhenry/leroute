export const HeaderMatch = ({
  name,
  operator = "exists",
  value,
  negate = false,
}) => {
  return { type: "headerMatch", name, operator, value, negate };
};

export const TaggedHeaderExpression = (strings, ...expressions) => {
  const matchers = [];
  strings.forEach((string, i) => {
    const headerMatches = string.match(/\[(.*?)\]/g) || [];
    headerMatches.forEach((match) => {
      const [, negation, headerName, op, headerValue] =
        match.match(/\[(!?)([^\]=^$~*<>]+)(?:([=^$~*<>]=?|[<>])(.+?))?\]/) ||
        [];
      let negate = !!negation;
      let operator = op || "exists";
      let value = headerValue?.trim();

      if (operator === "{") {
        operator = "{}";
        value = headerValue;
      } else if (operator === "[" || operator === "(") {
        operator = operator + "]";
        value = headerValue + ")";
      }

      matchers.push({
        type: "headerMatch",
        name: headerName.trim(),
        operator,
        value,
        negate,
      });
    });
    if (i < expressions.length) {
      const expr = expressions[i];
      if (expr && expr.type === "headerMatch") {
        matchers.push(expr);
      }
    }
  });

  return {
    test(headers) {
      return matchers.every((matcher) => {
        const headerValue = headers.get(matcher.name);
        const exists = headers.has(matcher.name);

        let match = false;
        if (matcher.operator === "exists") {
          match = exists;
        } else if (!exists) {
          match = false;
        } else {
          switch (matcher.operator) {
            case "=":
              const firstChar = matcher.value[0];
              const lastChar = matcher.value[matcher.value.length - 1];
              const nNvalue = Number(headerValue);
              if (firstChar === "{" && lastChar === "}") {
                const values = matcher.value
                  .slice(1, -1)
                  .split(",")
                  .map((v) => v.trim());
                match = values.includes(headerValue);
                break;
              } else if (
                (firstChar === "[" || firstChar === "(") &&
                (lastChar === "]" || lastChar === ")")
              ) {
                const [min, max] = matcher.value
                  .slice(1, -1)
                  .split(",")
                  .map((v) => Number(v.trim()));
                if (firstChar === "[") {
                  match =
                    lastChar === "]"
                      ? nNvalue >= min && nNvalue <= max
                      : nNvalue >= min && nNvalue < max;
                  break;
                } else {
                  match =
                    lastChar === "]"
                      ? nNvalue > min && nNvalue <= max
                      : nNvalue > min && nNvalue < max;
                  break;
                }
              }
              match = headerValue === matcher.value;
              break;
            case "^=":
              match = headerValue.startsWith(matcher.value);
              break;
            case "$=":
              match = headerValue.endsWith(matcher.value);
              break;
            case "~=":
              match = new RegExp(matcher.value).test(headerValue);
              break;
            case "*=":
              match = headerValue.includes(matcher.value);
              break;
            case ">":
              match = parseFloat(headerValue) > parseFloat(matcher.value);
              break;
            case "<":
              match = parseFloat(headerValue) < parseFloat(matcher.value);
              break;
            case ">=":
              match = parseFloat(headerValue) >= parseFloat(matcher.value);
              break;
            case "<=":
              match = parseFloat(headerValue) <= parseFloat(matcher.value);
              break;
          }
        }
        return matcher.negate ? !match : match;
      });
    },
    toParsed() {
      return matchers;
    },
  };
};

export const InlineParameter = ({
  name,
  type = "string",
  optional = false,
  transform = (x) => x,
}) => {
  return { type: "inlineParam", name, paramType: type, optional, transform };
};

export const TaggedPathExpression = (strings, ...expressions) => {
  const parts = [];
  strings.forEach((string, i) => {
    parts.push(
      ...string
        .split("/")
        .filter(Boolean)
        .map((part) => ({ type: "static", value: part }))
    );
    if (i < expressions.length) {
      const expr = expressions[i];
      if (expr && expr.type === "inlineParam") {
        parts.push({
          type: "param",
          name: expr.name,
          paramType: expr.paramType,
          optional: expr.optional,
          transform: expr.transform,
        });
      } else {
        parts.push({ type: "static", value: String(expr) });
      }
    }
  });

  return {
    test(path) {
      const pathParts = path.split("/").filter(Boolean);
      let partIndex = 0;
      let pathIndex = 0;
      const matchPart = () => {
        while (partIndex < parts.length) {
          const part = parts[partIndex];
          if (pathIndex >= pathParts.length) {
            // If we've run out of path parts, all remaining parts must be optional
            return parts
              .slice(partIndex)
              .every((p) => p.type === "param" && p.optional);
          }

          if (part.type === "static") {
            if (part.value !== pathParts[pathIndex]) {
              return false;
            }
            partIndex++;
            pathIndex++;
          } else if (part.type === "param") {
            if (part.optional) {
              // For optional params, we need to check if the next part matches
              if (
                partIndex + 1 < parts.length &&
                parts[partIndex + 1].type === "static"
              ) {
                if (parts[partIndex + 1].value === pathParts[pathIndex]) {
                  // Skip this optional param
                  partIndex++;
                } else {
                  // Consume this path part as the optional param
                  partIndex++;
                  pathIndex++;
                }
              } else {
                // Consume this path part as the optional param
                partIndex++;
                pathIndex++;
              }
            } else {
              // For required params, always consume a path part
              partIndex++;
              pathIndex++;
            }
          }
        }

        // Make sure we've consumed all path parts
        return pathIndex >= pathParts.length;
      };

      return matchPart();
    },
    exec(path) {
      if (!this.test(path)) return null;
      const pathParts = path.split("/").filter(Boolean);
      const result = {};
      let partIndex = 0;
      let pathIndex = 0;

      while (partIndex < parts.length && pathIndex < pathParts.length) {
        const part = parts[partIndex];
        const pathPart = pathParts[pathIndex];

        if (part.type === "param") {
          if (
            !part.optional ||
            (part.optional && pathPart !== parts[partIndex + 1]?.value)
          ) {
            try {
              const value = part.transform(pathPart);
              if (
                value !== undefined &&
                value !== null &&
                !Number.isNaN(value)
              ) {
                result[part.name] = value;
              }
            } catch (e) {
              // Transform failed, skip this parameter
            }
            pathIndex++;
          }
        } else if (part.type === "static") {
          pathIndex++;
        }

        partIndex++;
      }

      return Object.keys(result).length > 0 ? result : null;
    },
    toParsed() {
      return parts;
    },
  };
};

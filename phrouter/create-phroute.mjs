const DEFAULT_REQUEST = () => new Request("http://.");
export const createPhroute = (initOrMiddleware) => {
  const getInit =
    typeof initOrMiddleware === "function"
      ? initOrMiddleware
      : () => initOrMiddleware || {};

  return (strings, ...substitutions) => {
    return async (request = DEFAULT_REQUEST(), additionalContext = {}) => {
      const init = getInit(request);
      const headers = new Headers(init.headers);
      let status = init.status || 200;
      let statusText = init.statusText || "OK";
      const streaming = init.streaming || false;

      const context = {
        setHeader: (name, value) => headers.set(name, value),
        setStatus: (newStatus, newStatusText) => {
          status = newStatus;
          statusText = newStatusText;
        },
        setStatusText: (newStatusText) => {
          statusText = newStatusText;
        },
        response: {
          headers: headers,
        },
        ...additionalContext,
      };

      const isGenericResponse = strings[0].trim().startsWith("HTTP/");
      let bodyStart = 0;

      if (isGenericResponse) {
        const lines = strings[0].split("\n");
        const [httpVersion, statusCode, ...statusTextParts] =
          lines[0].split(" ");
        status = parseInt(statusCode, 10);
        statusText = statusTextParts.join(" ");

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === "") {
            bodyStart = i + 1;
            break;
          }
          const [key, ...valueParts] = line.split(":");
          headers.set(key.trim(), valueParts.join(":").trim());
        }
      } else if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "text/html");
      }

      const processContent = async (controller = null) => {
        const parts = [];
        for (let i = 0; i < strings.length; i++) {
          const stringPart =
            i === 0 && isGenericResponse
              ? strings[0].split("\n").slice(bodyStart).join("\n")
              : strings[i];

          if (controller) {
            controller.enqueue(new TextEncoder().encode(stringPart));
          } else {
            parts.push(stringPart);
          }

          if (i < substitutions.length) {
            const sub = substitutions[i];
            if (typeof sub === "function") {
              const result = await sub(request, context);
              if (result !== undefined) {
                if (controller) {
                  controller.enqueue(
                    new TextEncoder().encode(result.toString())
                  );
                } else {
                  parts.push(result);
                }
              }
            } else if (
              sub instanceof ReadableStream ||
              sub instanceof Blob ||
              sub instanceof ArrayBuffer ||
              sub instanceof Uint8Array
            ) {
              if (!headers.has("Content-Type")) {
                headers.set("Content-Type", "application/octet-stream");
              }
              return sub;
            } else if (sub instanceof Headers) {
              for (const [key, value] of sub) {
                headers.set(key, value);
              }
            } else {
              if (controller) {
                controller.enqueue(new TextEncoder().encode(sub.toString()));
              } else {
                parts.push(sub);
              }
            }
          }
        }

        return parts.join("");
      };

      let responseBody;

      if (streaming) {
        responseBody = new ReadableStream({
          async start(controller) {
            await processContent(controller);
            controller.close();
          },
        });
      } else {
        responseBody = await processContent();

        if (typeof responseBody === "string") {
          try {
            JSON.parse(responseBody);
            if (!headers.has("Content-Type")) {
              headers.set("Content-Type", "application/json");
            }
          } catch {
            if (!headers.has("Content-Type")) {
              headers.set("Content-Type", "text/plain");
            }
          }

          if (!headers.has("Content-Length")) {
            headers.set(
              "Content-Length",
              new Blob([responseBody]).size.toString()
            );
          }
        }
      }

      return new Response(responseBody, { headers, status, statusText });
    };
  };
};

export default createPhroute;

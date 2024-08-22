/** @type {CreateRoute} */
/**
 * Creates a Phroute function.
 * @param {Function|Object} initOrMiddleware - The initialization function or middleware object.
 * @returns {Function} - The Phroute function.
 */
export const createPhroute = (initOrMiddleware) => {
  const getInit =
    typeof initOrMiddleware === "function"
      ? initOrMiddleware
      : () => initOrMiddleware || {};

  return (strings, ...substitutions) => {
    const phroute = async (request, additionalContext) => {
      const init = getInit(request);
      const headers = new Headers(init.headers);
      let status = init.status || 200;
      let statusText = init.statusText || "OK";
      const streaming = init.streaming || false;

      const setHeader = (name, value) => headers.set(name, value);
      const setStatus = (newStatus, newStatusText) => {
        status = newStatus;
        statusText = newStatusText;
      };
      const setStatusText = (newStatusText) => {
        statusText = newStatusText;
      };

      const context = {
        setHeader,
        setStatus,
        setStatusText,
        ...additionalContext,
      };

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "text/html");
      }

      if (streaming) {
        const stream = new ReadableStream({
          async start(controller) {
            for (let i = 0; i < strings.length; i++) {
              controller.enqueue(new TextEncoder().encode(strings[i]));
              if (i < substitutions.length) {
                const sub = substitutions[i];
                if (typeof sub === "function") {
                  const result = await sub(request, context);
                  if (result !== undefined) {
                    controller.enqueue(
                      new TextEncoder().encode(result.toString())
                    );
                  }
                } else {
                  controller.enqueue(new TextEncoder().encode(sub.toString()));
                }
              }
            }
            controller.close();
          },
        });

        return new Response(stream, { headers, status, statusText });
      } else {
        const parts = [];
        for (let i = 0; i < strings.length; i++) {
          parts.push(strings[i]);
          if (i < substitutions.length) {
            const sub = substitutions[i];
            if (typeof sub === "function") {
              const result = await sub(request, context);
              if (result !== undefined) {
                parts.push(result);
              }
            } else {
              parts.push(sub);
            }
          }
        }

        const body = parts.join("");

        if (!headers.has("Content-Length")) {
          headers.set("Content-Length", body.length.toString());
        }

        return new Response(body, { headers, status, statusText });
      }
    };

    return phroute;
  };
};

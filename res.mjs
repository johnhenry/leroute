// Updated tagResponse function
/**
 * Creates a tagged template function for generating HTTP responses.
 *
 * @param {Object} options - Optional configuration options.
 * @returns {Function} - The tagResponse function.
 */
export const tagResponse = (options = {}) => {
  return async function (strings, ...values) {
    let fullString = "";
    let bodyValue = null;
    for (let i = 0; i < strings.length; i++) {
      fullString += strings[i];
      if (i < values.length) {
        if (
          values[i] instanceof ReadableStream ||
          values[i] instanceof Blob ||
          values[i] instanceof ArrayBuffer ||
          values[i] instanceof Uint8Array
        ) {
          bodyValue = values[i];
          fullString += "[BODY_PLACEHOLDER]";
        } else if (values[i] instanceof Headers) {
          fullString += [...values[i]]
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
        } else {
          fullString += values[i];
        }
      }
    }

    const [statusLine, ...rest] = fullString.trim().split("\n");
    const [httpVersion, statusCode, ...statusText] = statusLine.split(" ");

    const headers = new Headers();
    let body = "";
    let isBody = false;

    for (const line of rest) {
      if (line.trim() === "") {
        isBody = true;
        continue;
      }
      if (!isBody) {
        const [key, value] = line.split(": ");
        headers.append(key.trim(), value.trim());
      } else {
        body += line + "\n";
      }
    }

    let responseInit = {
      status: parseInt(statusCode),
      statusText: statusText.join(" "),
      headers: headers,
    };

    let responseBody = null;

    if (bodyValue !== null) {
      responseBody = bodyValue;
      if (bodyValue instanceof ReadableStream) {
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/octet-stream");
        }
      } else if (bodyValue instanceof Blob) {
        if (!headers.has("Content-Type")) {
          headers.set(
            "Content-Type",
            bodyValue.type || "application/octet-stream"
          );
        }
      } else if (
        bodyValue instanceof ArrayBuffer ||
        bodyValue instanceof Uint8Array
      ) {
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/octet-stream");
        }
      }
    } else if (body.trim()) {
      responseBody = body.trim();
      try {
        JSON.parse(body);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
      } catch {
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "text/plain");
        }
      }
    }

    if (options.setRetroactiveHeaders !== false && responseBody) {
      if (!headers.has("Content-Length")) {
        const bodySize =
          responseBody instanceof Blob
            ? responseBody.size
            : new Blob([responseBody]).size;
        headers.set("Content-Length", bodySize.toString());
      }
    }

    return new Response(responseBody, responseInit);
  };
};
export default tagResponse;

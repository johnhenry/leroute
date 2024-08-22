export const tagRequest = (options = {}) => {
  return async function (strings, ...values) {
    let fullString = "";
    let bodyValue = null;
    for (let i = 0; i < strings.length; i++) {
      fullString += strings[i];
      if (i < values.length) {
        if (values[i] instanceof Headers) {
          fullString += [...values[i]]
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
        } else if (
          values[i] instanceof URLSearchParams ||
          values[i] instanceof FormData ||
          values[i] instanceof Blob ||
          values[i] instanceof Uint8Array ||
          values[i] instanceof ReadableStream
        ) {
          bodyValue = values[i];
          fullString += "[BODY_PLACEHOLDER]";
        } else {
          fullString += values[i];
        }
      }
    }

    const [requestLine, ...rest] = fullString.trim().split("\n");
    const [method, url, httpVersion] = requestLine.split(" ");

    let baseUrl = options.baseUrl || "http://localhost";
    let fullUrl;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      fullUrl = new URL(url);
    } else {
      fullUrl = new URL(url.startsWith("/") ? url : `/${url}`, baseUrl);
    }

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

    if (!headers.has("Host")) {
      headers.set("Host", fullUrl.host);
    }

    const requestInit = {
      method,
      headers,
    };

    if (bodyValue !== null) {
      requestInit.body = bodyValue;
      if (bodyValue instanceof ReadableStream) {
        headers.set("Content-Type", "application/octet-stream");
        requestInit.duplex = "half";
      } else if (bodyValue instanceof Blob) {
        headers.set(
          "Content-Type",
          bodyValue.type || "application/octet-stream"
        );
      } else if (bodyValue instanceof FormData) {
        // FormData sets its own Content-Type
      } else if (bodyValue instanceof URLSearchParams) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
      } else if (
        bodyValue instanceof ArrayBuffer ||
        bodyValue instanceof Uint8Array
      ) {
        headers.set("Content-Type", "application/octet-stream");
      }
    } else if (body.trim()) {
      requestInit.body = body.trim();
      try {
        JSON.parse(body);
        headers.set("Content-Type", "application/json");
      } catch {
        headers.set("Content-Type", "text/plain");
      }
    }

    if (options.setRetroactiveHeaders !== false && requestInit.body) {
      if (!headers.has("Content-Length")) {
        const bodySize =
          requestInit.body instanceof Blob
            ? requestInit.body.size
            : new Blob([requestInit.body]).size;
        headers.set("Content-Length", bodySize.toString());
      }
    }

    return new Request(fullUrl, requestInit);
  };
};

export default tagRequest;

import { test } from "node:test";
import { strict as assert } from "node:assert";
// Updated tagRequest function
import { tagRequest } from "./req.mjs";
import { tagResponse } from "./res.mjs";

// Utility function to create a simple readable stream

const createReadableStream = (data) => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(data));
      controller.close();
    },
  });
};

async function runTests() {
  await test("tagRequest function tests", async (t) => {
    test("tagRequest function tests", async (t) => {
      await t.test("Basic POST request with XML body", async () => {
        const request = await tagRequest({ baseUrl: "http://example.com" })`
POST /api/data HTTP/1.1
User-Agent: TestAgent/1.0

<?xml version="1.0" encoding="utf-8"?>
<data>
  <item>Test Item</item>
</data>
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "http://example.com/api/data");
        assert.equal(request.headers.get("Content-Type"), "text/plain");
        assert.equal(request.headers.get("User-Agent"), "TestAgent/1.0");
        const body = await request.text();
        assert.ok(body.includes("<data>"));
      });

      await t.test("GET request with query parameters", async () => {
        const request = await tagRequest()`
GET https://api.example.com/search?q=test&page=1 HTTP/1.1
Accept: application/json
`;
        assert.equal(request.method, "GET");
        assert.equal(
          request.url,
          "https://api.example.com/search?q=test&page=1"
        );
        assert.equal(request.headers.get("Accept"), "application/json");
      });

      await t.test("POST request with JSON body", async () => {
        const request = await tagRequest({
          baseUrl: "https://api.example.com",
        })`
POST /users HTTP/1.1
User-Agent: TestAgent/1.0

${JSON.stringify({ name: "John Doe", email: "john@example.com" })}
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://api.example.com/users");
        assert.equal(request.headers.get("Content-Type"), "application/json");
        const body = await request.json();
        assert.deepEqual(body, { name: "John Doe", email: "john@example.com" });
      });

      await t.test("POST request with URLSearchParams", async () => {
        const params = new URLSearchParams();
        params.append("key1", "value1");
        params.append("key2", "value2");

        const request = await tagRequest({
          baseUrl: "https://api.example.com",
        })`
POST /submit HTTP/1.1
User-Agent: TestAgent/1.0

${params}
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://api.example.com/submit");
        assert.equal(
          request.headers.get("Content-Type"),
          "application/x-www-form-urlencoded"
        );
        const body = await request.text();
        assert.equal(body, "key1=value1&key2=value2");
      });

      await t.test("PUT request with Blob body", async () => {
        const blob = new Blob(["Hello, World!"], { type: "text/plain" });

        const request = await tagRequest()`
PUT https://storage.example.com/file.txt HTTP/1.1
User-Agent: TestAgent/1.0

${blob}
`;
        assert.equal(request.method, "PUT");
        assert.equal(request.url, "https://storage.example.com/file.txt");
        assert.equal(request.headers.get("Content-Type"), "text/plain");
        const body = await request.text();
        assert.equal(body, "Hello, World!");
      });

      await t.test("POST request with FormData", async () => {
        const formData = new FormData();
        formData.append("username", "testuser");
        formData.append("password", "testpass");

        const request = await tagRequest({
          baseUrl: "https://auth.example.com",
        })`
POST /login HTTP/1.1
User-Agent: TestAgent/1.0

${formData}
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://auth.example.com/login");
        assert.ok(
          request.headers.get("Content-Type").startsWith("multipart/form-data")
        );
      });

      await t.test("POST request with binary data", async () => {
        const binaryData = new Uint8Array([1, 2, 3, 4, 5]);

        const request = await tagRequest({
          baseUrl: "https://api.example.com",
        })`
POST /binary HTTP/1.1
User-Agent: TestAgent/1.0

${binaryData}
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://api.example.com/binary");
        assert.equal(
          request.headers.get("Content-Type"),
          "application/octet-stream"
        );
        const body = await request.arrayBuffer();
        assert.deepEqual(new Uint8Array(body), binaryData);
      });
    });

    test("tagRequest function tests", async (t) => {
      await t.test("Basic GET request", async () => {
        const request = await tagRequest({ baseUrl: "http://example.com" })`
GET /api/data HTTP/1.1
User-Agent: TestAgent/1.0
Accept: application/json
`;
        assert.equal(request.method, "GET");
        assert.equal(request.url, "http://example.com/api/data");
        assert.equal(request.headers.get("User-Agent"), "TestAgent/1.0");
        assert.equal(request.headers.get("Accept"), "application/json");
      });

      await t.test("POST request with JSON body", async () => {
        const body = JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
        });
        const request = await tagRequest({
          baseUrl: "https://api.example.com",
        })`
POST /users HTTP/1.1
Content-Type: application/json

${body}
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://api.example.com/users");
        assert.equal(request.headers.get("Content-Type"), "application/json");
        const requestBody = await request.json();
        assert.deepEqual(requestBody, {
          name: "John Doe",
          email: "john@example.com",
        });
      });

      await t.test("PUT request with URLSearchParams", async () => {
        const params = new URLSearchParams({ key1: "value1", key2: "value2" });
        const request = await tagRequest()`
PUT https://api.example.com/update HTTP/1.1
User-Agent: TestAgent/1.0

${params}
`;
        assert.equal(request.method, "PUT");
        assert.equal(request.url, "https://api.example.com/update");
        assert.equal(
          request.headers.get("Content-Type"),
          "application/x-www-form-urlencoded"
        );
        const bodyText = await request.text();
        assert.equal(bodyText, "key1=value1&key2=value2");
      });

      await t.test("DELETE request with no body", async () => {
        const request = await tagRequest()`
DELETE https://api.example.com/users/123 HTTP/1.1
Authorization: Bearer token123
`;
        assert.equal(request.method, "DELETE");
        assert.equal(request.url, "https://api.example.com/users/123");
        assert.equal(request.headers.get("Authorization"), "Bearer token123");
        assert.equal(await request.text(), "");
      });

      await t.test("POST request with FormData", async () => {
        const formData = new FormData();
        formData.append("username", "testuser");
        formData.append("password", "testpass");
        const request = await tagRequest({
          baseUrl: "https://auth.example.com",
        })`
POST /login HTTP/1.1
User-Agent: TestAgent/1.0

${formData}
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://auth.example.com/login");
        assert.ok(
          request.headers.get("Content-Type").startsWith("multipart/form-data")
        );
      });

      await t.test("GET request with query parameters", async () => {
        const request = await tagRequest()`
GET https://api.example.com/search?q=test&page=1 HTTP/1.1
Accept: application/json
`;
        assert.equal(request.method, "GET");
        assert.equal(
          request.url,
          "https://api.example.com/search?q=test&page=1"
        );
        assert.equal(request.headers.get("Accept"), "application/json");
      });

      await t.test("POST request with Uint8Array body", async () => {
        const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
        const request = await tagRequest({
          baseUrl: "https://api.example.com",
        })`
POST /binary HTTP/1.1
User-Agent: TestAgent/1.0

${binaryData}
`;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://api.example.com/binary");
        assert.equal(
          request.headers.get("Content-Type"),
          "application/octet-stream"
        );
        const bodyBuffer = await request.arrayBuffer();
        assert.deepEqual(new Uint8Array(bodyBuffer), binaryData);
      });
    });

    await t.test("POST request with ReadableStream body", async () => {
      const streamData = "This is streaming data";
      const stream = createReadableStream(streamData);
      const request = await tagRequest({ baseUrl: "https://api.example.com" })`
POST /stream HTTP/1.1
User-Agent: TestAgent/1.0

${stream}
`;
      assert.equal(request.method, "POST");
      assert.equal(request.url, "https://api.example.com/stream");
      assert.equal(
        request.headers.get("Content-Type"),
        "application/octet-stream"
      );

      const responseBody = await request.text();
      assert.equal(responseBody, streamData);
    });
  });

  await test("tagResponse function tests", async (t) => {
    test("tagResponse function tests", async (t) => {
      await t.test("Basic HTML response", async () => {
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Server: Apache/2.2.14 (Win32)
Content-Type: text/html

<html><body>Hello, World!</body></html>
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "text/html");
        assert.equal(response.headers.get("Server"), "Apache/2.2.14 (Win32)");
        assert.equal(
          await response.text(),
          "<html><body>Hello, World!</body></html>"
        );
      });

      await t.test("JSON response", async () => {
        const jsonBody = JSON.stringify({ message: "Hello, World!" });
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

${jsonBody}
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "application/json");
        const body = await response.json();
        assert.deepEqual(body, { message: "Hello, World!" });
      });

      await t.test("Response with custom status code and text", async () => {
        const response = await tagResponse()`HTTP/1.1 404 Not Found
Date: Mon, 27 Jul 2009 12:28:53 GMT

Resource not found
`;
        assert.equal(response.status, 404);
        assert.equal(response.statusText, "Not Found");
        assert.equal(response.headers.get("Content-Type"), "text/plain");
        assert.equal(await response.text(), "Resource not found");
      });

      await t.test("Response with Blob body", async () => {
        const blob = new Blob(["Hello, World!"], { type: "text/plain" });
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

${blob}
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "text/plain");
        assert.equal(await response.text(), "Hello, World!");
      });

      await t.test("Response with ArrayBuffer body", async () => {
        const buffer = new TextEncoder().encode("Hello, World!").buffer;
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

${buffer}
`;
        assert.equal(response.status, 200);
        assert.equal(
          response.headers.get("Content-Type"),
          "application/octet-stream"
        );
        assert.equal(await response.text(), "Hello, World!");
      });

      await t.test("Response with retroactive headers", async () => {
        const response = await tagResponse({
          setRetroactiveHeaders: true,
        })`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

Hello, World!
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "text/plain");
        assert.equal(response.headers.get("Content-Length"), "13");
        assert.equal(await response.text(), "Hello, World!");
      });

      await t.test("Response without retroactive headers", async () => {
        const response = await tagResponse({
          setRetroactiveHeaders: false,
        })`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

Hello, World!
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "text/plain");
        assert.equal(response.headers.get("Content-Length"), null);
        assert.equal(await response.text(), "Hello, World!");
      });
    });

    test("tagResponse function tests", async (t) => {
      await t.test("Basic HTML response", async () => {
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Server: Apache/2.2.14 (Win32)
Content-Type: text/html

<html><body>Hello, World!</body></html>
`;
        assert.equal(response.status, 200);
        assert.equal(response.statusText, "OK");
        assert.equal(response.headers.get("Content-Type"), "text/html");
        assert.equal(response.headers.get("Server"), "Apache/2.2.14 (Win32)");
        assert.equal(
          await response.text(),
          "<html><body>Hello, World!</body></html>"
        );
      });

      await t.test("JSON response", async () => {
        const jsonBody = JSON.stringify({ message: "Hello, World!" });
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

${jsonBody}
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "application/json");
        const body = await response.json();
        assert.deepEqual(body, { message: "Hello, World!" });
      });

      await t.test("Response with custom status code and text", async () => {
        const response = await tagResponse()`HTTP/1.1 404 Not Found
Date: Mon, 27 Jul 2009 12:28:53 GMT

Resource not found
`;
        assert.equal(response.status, 404);
        assert.equal(response.statusText, "Not Found");
        assert.equal(response.headers.get("Content-Type"), "text/plain");
        assert.equal(await response.text(), "Resource not found");
      });

      await t.test("Response with ArrayBuffer body", async () => {
        const buffer = new TextEncoder().encode("Hello, World!").buffer;
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

${buffer}
`;
        assert.equal(response.status, 200);
        assert.equal(
          response.headers.get("Content-Type"),
          "application/octet-stream"
        );
        assert.equal(await response.text(), "Hello, World!");
      });

      await t.test("Response with retroactive headers", async () => {
        const response = await tagResponse({
          setRetroactiveHeaders: true,
        })`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

Hello, World!
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "text/plain");
        assert.equal(response.headers.get("Content-Length"), "13");
        assert.equal(await response.text(), "Hello, World!");
      });

      await t.test("Response without retroactive headers", async () => {
        const response = await tagResponse({
          setRetroactiveHeaders: false,
        })`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT

Hello, World!
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "text/plain");
        assert.equal(response.headers.get("Content-Length"), null);
        assert.equal(await response.text(), "Hello, World!");
      });

      await t.test("Response with no body", async () => {
        const response = await tagResponse()`HTTP/1.1 204 No Content
Date: Mon, 27 Jul 2009 12:28:53 GMT
`;
        assert.equal(response.status, 204);
        assert.equal(response.statusText, "No Content");
        assert.equal(await response.text(), "");
      });

      await t.test("Response with custom headers", async () => {
        const customHeaders = new Headers({
          "X-Custom-Header": "CustomValue",
          "Cache-Control": "no-cache",
        });
        const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
${customHeaders}

Custom response body
`;
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("X-Custom-Header"), "CustomValue");
        assert.equal(response.headers.get("Cache-Control"), "no-cache");
        assert.equal(await response.text(), "Custom response body");
      });
    });

    await t.test("Response with no body (204 No Content)", async () => {
      const response = await tagResponse()`HTTP/1.1 204 No Content
Date: Mon, 27 Jul 2009 12:28:53 GMT
`;
      assert.equal(response.status, 204);
      assert.equal(response.statusText, "No Content");
      assert.equal(await response.text(), "");
      assert.equal(response.headers.get("Content-Length"), null);
    });
    await t.test("Response with ReadableStream body", async () => {
      const streamData = "This is streaming response data";
      const stream = createReadableStream(streamData);
      const response = await tagResponse()`HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Content-Type: application/octet-stream

${stream}
`;
      assert.equal(response.status, 200);
      assert.equal(
        response.headers.get("Content-Type"),
        "application/octet-stream"
      );

      const responseBody = await response.text();
      assert.equal(responseBody, streamData);
    });
  });
}

runTests().catch((error) => {
  console.error("Unhandled error in tests:", error);
  process.exit(1);
});

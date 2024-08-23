import { test } from "node:test";
import { strict as assert } from "node:assert";
import { createRequest, createResponse } from "../index.mjs";

// Utility function to create a simple readable stream
const createReadableStream = (data) => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(data));
      controller.close();
    },
  });
};

await test("createRequest function tests", async (t) => {
  await t.test("Basic GET request", async () => {
    const request = await createRequest({ baseUrl: "http://example.com" })`
      GET /api/data HTTP/1.1
      User-Agent: TestAgent/1.0
      Accept: application/json
    `;
    assert.equal(request.method, "GET");
    assert.equal(request.url, "http://example.com/api/data");
    assert.equal(request.headers.get("User-Agent"), "TestAgent/1.0");
    assert.equal(request.headers.get("Accept"), "application/json");
  });

  await t.test("POST request with various body types", async (t) => {
    const testCases = [
      {
        name: "JSON body",
        body: JSON.stringify({ name: "John Doe", email: "john@example.com" }),
        contentType: "application/json",
        assert: async (req) => {
          const body = await req.json();
          assert.deepEqual(body, {
            name: "John Doe",
            email: "john@example.com",
          });
        },
      },
      {
        name: "URLSearchParams body",
        body: new URLSearchParams({ key1: "value1", key2: "value2" }),
        contentType: "application/x-www-form-urlencoded",
        assert: async (req) => {
          const body = await req.text();
          assert.equal(body, "key1=value1&key2=value2");
        },
      },
      {
        name: "FormData body",
        body: (() => {
          const formData = new FormData();
          formData.append("username", "testuser");
          formData.append("password", "testpass");
          return formData;
        })(),
        contentType: "multipart/form-data",
        assert: async (req) => {
          assert.ok(
            req.headers.get("Content-Type").startsWith("multipart/form-data")
          );
        },
      },
      {
        name: "Uint8Array body",
        body: new Uint8Array([1, 2, 3, 4, 5]),
        contentType: "application/octet-stream",
        assert: async (req) => {
          const bodyBuffer = await req.arrayBuffer();
          assert.deepEqual(
            new Uint8Array(bodyBuffer),
            new Uint8Array([1, 2, 3, 4, 5])
          );
        },
      },
      {
        name: "ReadableStream body",
        body: createReadableStream("This is streaming data"),
        contentType: "application/octet-stream",
        assert: async (req) => {
          const bodyText = await req.text();
          assert.equal(bodyText, "This is streaming data");
        },
      },
    ];

    for (const testCase of testCases) {
      await t.test(`POST request with ${testCase.name}`, async () => {
        const request = await createRequest({
          baseUrl: "https://api.example.com",
        })`
          POST /data HTTP/1.1
          User-Agent: TestAgent/1.0

          ${testCase.body}
        `;
        assert.equal(request.method, "POST");
        assert.equal(request.url, "https://api.example.com/data");
        assert.ok(
          request.headers.get("Content-Type").startsWith(testCase.contentType)
        );
        await testCase.assert(request);
      });
    }
  });

  await t.test("PUT request", async () => {
    const request = await createRequest()`
      PUT https://api.example.com/update HTTP/1.1
      User-Agent: TestAgent/1.0
      
      ${new URLSearchParams({ key1: "value1", key2: "value2" })}
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

  await t.test("DELETE request", async () => {
    const request = await createRequest()`
      DELETE https://api.example.com/users/123 HTTP/1.1
      Authorization: Bearer token123
    `;
    assert.equal(request.method, "DELETE");
    assert.equal(request.url, "https://api.example.com/users/123");
    assert.equal(request.headers.get("Authorization"), "Bearer token123");
    assert.equal(await request.text(), "");
  });

  await t.test("GET request with query parameters", async () => {
    const request = await createRequest()`
      GET https://api.example.com/search?q=test&page=1 HTTP/1.1
      Accept: application/json
    `;
    assert.equal(request.method, "GET");
    assert.equal(request.url, "https://api.example.com/search?q=test&page=1");
    assert.equal(request.headers.get("Accept"), "application/json");
  });
});

await test("createResponse function tests", async (t) => {
  await t.test("Response with various status codes and bodies", async (t) => {
    const testCases = [
      {
        name: "HTML response",
        status: 200,
        headers: { "Content-Type": "text/html" },
        body: "<html><body>Hello, World!</body></html>",
        assert: async (res) => {
          assert.equal(
            await res.text(),
            "<html><body>Hello, World!</body></html>"
          );
        },
      },
      {
        name: "JSON response",
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello, World!" }),
        assert: async (res) => {
          const body = await res.json();
          assert.deepEqual(body, { message: "Hello, World!" });
        },
      },
      {
        name: "No Content response",
        status: 204,
        headers: {},
        body: "",
        assert: async (res) => {
          assert.equal(await res.text(), "");
          assert.equal(res.headers.get("Content-Length"), "0");
        },
      },
      {
        name: "Not Found response",
        status: 404,
        headers: { "Content-Type": "text/html" },
        body: "Resource not found",
        assert: async (res) => {
          assert.equal(await res.text(), "Resource not found");
        },
      },
    ];

    for (const testCase of testCases) {
      await t.test(`${testCase.name}`, async () => {
        const response = await createResponse`HTTP/1.1 ${testCase.status} ${
          testCase.status === 204 ? "No Content" : "OK"
        }
          Date: Mon, 27 Jul 2009 12:28:53 GMT
          ${Object.entries(testCase.headers)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")}

          ${testCase.body}
        `;
        assert.equal(response.status, testCase.status);
        for (const [key, value] of Object.entries(testCase.headers)) {
          assert.equal(response.headers.get(key), value);
        }
        await testCase.assert(response);
      });
    }
  });

  await t.test("Response with various body types", async (t) => {
    const testCases = [
      {
        name: "ArrayBuffer body",
        body: new TextEncoder().encode("Hello, World!").buffer,
        contentType: "application/octet-stream",
        assert: async (res) => {
          assert.equal(await res.text(), "Hello, World!");
        },
      },
      {
        name: "Blob body",
        body: new Blob(["Hello, World!"], { type: "text/plain" }),
        contentType: "text/plain",
        assert: async (res) => {
          assert.equal(await res.text(), "Hello, World!");
        },
      },
      {
        name: "ReadableStream body",
        body: createReadableStream("This is streaming response data"),
        contentType: "application/octet-stream",
        assert: async (res) => {
          assert.equal(await res.text(), "This is streaming response data");
        },
      },
    ];

    for (const testCase of testCases) {
      await t.test(`Response with ${testCase.name}`, async () => {
        const response = await createResponse`HTTP/1.1 200 OK
          Date: Mon, 27 Jul 2009 12:28:53 GMT
          Content-Type: ${testCase.contentType}

          ${testCase.body}
        `;
        assert.equal(response.status, 200);
        assert.equal(
          response.headers.get("Content-Type"),
          testCase.contentType
        );
        await testCase.assert(response);
      });
    }
  });

  await t.test("Response with custom headers", async () => {
    const customHeaders = new Headers({
      "X-Custom-Header": "CustomValue",
      "Cache-Control": "no-cache",
    });
    const response = await createResponse`HTTP/1.1 200 OK
      Date: Mon, 27 Jul 2009 12:28:53 GMT
      ${customHeaders}

      Custom response body
    `;
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Custom-Header"), "CustomValue");
    assert.equal(response.headers.get("Cache-Control"), "no-cache");
    assert.equal(await response.text(), "Custom response body");
  });

  await t.test("Response with retroactive headers", async () => {
    const response = await createResponse`HTTP/1.1 200 OK
      Date: Mon, 27 Jul 2009 12:28:53 GMT

      Hello, World!
    `;
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Content-Type"), "text/html");
    assert.equal(response.headers.get("Content-Length"), "13");
    assert.equal(await response.text(), "Hello, World!");
  });
});

import { createLeRouter } from "../create-lerouter.mjs";
import HTTPExpression, {
  InlineParameter,
  HeaderMatch,
} from "../utility/http-expression.mjs";

import { describe, it, test } from "node:test";
import assert from "node:assert";

test("LeRouter - Basic routing", async () => {
  const router = createLeRouter();
  router.endpoint`GET /``Hello, World!`;
  const request = new Request("http://example.com/");
  const response = await router(request);
  assert.equal(await response.text(), "Hello, World!");
  assert.equal(response.status, 200);
});

test("LeRouter - URL parameters", async () => {
  const router = createLeRouter();
  router.endpoint`GET /user/:id``User ID: ${(_, { params }) => params.id}`;

  const request = new Request("http://example.com/user/123");
  const response = await router(request);
  assert.equal(await response.text(), "User ID: 123");
});

test("LeRouter - 404 for unmatched routes", async () => {
  const router = createLeRouter();
  router.endpoint`GET /``Hello, World!`;

  const request = new Request("http://example.com/not-found");
  const response = await router(request);
  assert.equal(response.status, 404);
});

test("LeRouter - Custom error handler", async () => {
  const router = createLeRouter({
    errorHandler: (error, request) =>
      new Response(`Custom Error: ${error.message}`, { status: 500 }),
  });
  router.endpoint`GET /error`(() => {
    throw new Error("Test Error");
  });

  const request = new Request("http://example.com/error");
  const response = await router(request);
  assert.equal(response.status, 500);
  assert.equal(await response.text(), "Custom Error: Test Error");
});

test("LeRouter - Multiple routes", async () => {
  const router = createLeRouter();
  router.endpoint`GET /``Home`;
  router.endpoint`GET /about``About`;
  router.endpoint`GET /contact``Contact`;

  const routes = ["/", "/about", "/contact"];
  for (const route of routes) {
    const request = new Request(`http://example.com${route}`);
    const response = await router(request);
    assert.equal(
      await response.text().then((s) => s.toLowerCase()),
      route === "/" ? "home" : route.slice(1)
    );
  }
});

test("LeRouter - Method matching", async () => {
  const router = createLeRouter();
  router.endpoint`GET /api``GET API`;
  router.endpoint`POST /api``POST API`;

  const getRequest = new Request("http://example.com/api", { method: "GET" });
  const postRequest = new Request("http://example.com/api", { method: "POST" });

  const getResponse = await router(getRequest);
  const postResponse = await router(postRequest);

  assert.equal(await getResponse.text(), "GET API");
  assert.equal(await postResponse.text(), "POST API");
});

test("LeRouter - Nested routes", async () => {
  const router = createLeRouter();
  router.endpoint`GET /api/v1/users``API v1 Users`;
  router.endpoint`GET /api/v2/users``API v2 Users`;

  const v1Request = new Request("http://example.com/api/v1/users");
  const v2Request = new Request("http://example.com/api/v2/users");

  const v1Response = await router(v1Request);
  const v2Response = await router(v2Request);

  assert.equal(await v1Response.text(), "API v1 Users");
  assert.equal(await v2Response.text(), "API v2 Users");
});

test("LeRouter - Function handler", async () => {
  const router = createLeRouter();
  router.endpoint`GET /function`((request) => {
    return new Response("Function handler", { status: 200 });
  });

  const request = new Request("http://example.com/function");
  const response = await router(request);

  assert.equal(await response.text(), "Function handler");
  assert.equal(response.status, 200);
});

// Commented out tests
/*
test("LeRouter - InlineParam", async () => {
  const router = createLeRouter();
  const id = InlineParam({
    name: "id",
    type: "number",
    min: 1,
    max: 1000,
  });
  router.endpoint`GET /user/${id}``User ID: ${(_, { params }) => params.id}`;

  const request = new Request("http://example.com/user/123");
  const response = await router(request);
  assert.equal(await response.text(), "User ID: 123");
});

test("LeRouter - HeaderMatch", async () => {
  const router = createLeRouter();
  const jsonHeader = HeaderMatch({
    name: "Content-Type",
    value: "application/json",
  });
  router.endpoint`POST /api ${jsonHeader}`(async (request) => {
    const data = await request.json();
    return new Response(JSON.stringify({ received: data }), {
      headers: { "Content-Type": "application/json" },
    });
  });

  const request = new Request("http://example.com/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test: "data" }),
  });
  const response = await router(request);
  assert.equal(response.headers.get("Content-Type"), "application/json");
  assert.equal(await response.json(), { received: { test: "data" } });
});
*/

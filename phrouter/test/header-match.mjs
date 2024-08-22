import { test } from "node:test";
import assert from "node:assert";
import { TaggedHeaderExpression, HeaderMatch } from "../header-match.mjs";

test("TaggedHeaderExpression - basic functionality", async (t) => {
  const expr = TaggedHeaderExpression`[Content-Type] [!Cache-Control]`;

  await t.test("test method", () => {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    assert.strictEqual(expr.test(headers), true);

    headers.set("Cache-Control", "no-cache");
    assert.strictEqual(expr.test(headers), false);
  });

  await t.test("toParsed method", () => {
    const parsed = expr.toParsed();
    assert.deepStrictEqual(parsed, [
      {
        type: "headerMatch",
        name: "Content-Type",
        operator: "exists",
        value: undefined,
        negate: false,
      },
      {
        type: "headerMatch",
        name: "Cache-Control",
        operator: "exists",
        value: undefined,
        negate: true,
      },
    ]);
  });
});

test("TaggedHeaderExpression - comparison operators", async (t) => {
  const expr = TaggedHeaderExpression`
    [Content-Type=application/json]
    [Accept^=text/]
    [Content-Length>1000]
    [ETag$=abc]
    [User-Agent~=Chrome]
    [X-Custom*=test]
  `;

  await t.test("test method", () => {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "text/html,application/xhtml+xml",
      "Content-Length": "1500",
      ETag: "123abc",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "X-Custom": "this is a test header",
    });
    assert.strictEqual(expr.test(headers), true);

    headers.set("Content-Type", "text/plain");
    assert.strictEqual(expr.test(headers), false);
  });
});

test("TaggedHeaderExpression - sets and ranges", async (t) => {
  const expr = TaggedHeaderExpression`
    [Content-Type={application/json,application/xml}]
    [Content-Length=[1000,2000)]
  `;

  await t.test("test method", () => {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Content-Length": "1500",
    });
    assert.strictEqual(expr.test(headers), true);

    headers.set("Content-Type", "text/plain");
    assert.strictEqual(expr.test(headers), false);

    headers.set("Content-Type", "application/xml");
    headers.set("Content-Length", "2000");
    assert.strictEqual(expr.test(headers), false);
  });
});

test("TaggedHeaderExpression - negation", async (t) => {
  const expr = TaggedHeaderExpression`
    [!Content-Type^=application/]
    [!Content-Length=[200,300)]
  `;

  await t.test("test method", () => {
    const headers = new Headers({
      "Content-Type": "text/plain",
      "Content-Length": "150",
    });
    assert.strictEqual(expr.test(headers), true);

    headers.set("Content-Type", "application/json");
    assert.strictEqual(expr.test(headers), false);

    headers.set("Content-Type", "text/plain");
    headers.set("Content-Length", "250");
    assert.strictEqual(expr.test(headers), false);
  });
});

test("HeaderMatch function", async (t) => {
  const expr = TaggedHeaderExpression`
    ${HeaderMatch({ name: "X-Custom", operator: "*=", value: "test" })}
    ${HeaderMatch({ name: "Authorization", negate: true })}
  `;

  await t.test("test method", () => {
    const headers = new Headers({
      "X-Custom": "this is a test header",
    });
    assert.strictEqual(expr.test(headers), true);

    headers.set("Authorization", "Bearer token");
    assert.strictEqual(expr.test(headers), false);
  });
});

test("TaggedHeaderExpression - complex scenarios", async (t) => {
  const expr = TaggedHeaderExpression`
    [Content-Type={application/json,application/xml}]
    [Accept^=text/]
    [Content-Length=[1000,5000)]
    [!Cache-Control=no-store]
    [User-Agent~=(Chrome|Firefox)]
    [X-Custom*=test]
    [X-Rate-Limit>10]
    [X-Rate-Remaining<=5]
  `;

  await t.test("test method", () => {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "text/html,application/xhtml+xml",
      "Content-Length": "3000",
      "Cache-Control": "max-age=3600",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "X-Custom": "this is a test header",
      "X-Rate-Limit": "20",
      "X-Rate-Remaining": "3",
    });
    assert.strictEqual(expr.test(headers), true);

    headers.set("Content-Type", "text/plain");
    assert.strictEqual(expr.test(headers), false);

    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "no-store");
    assert.strictEqual(expr.test(headers), false);

    headers.set("Cache-Control", "max-age=3600");
    headers.set("X-Rate-Remaining", "6");
    assert.strictEqual(expr.test(headers), false);
  });
});

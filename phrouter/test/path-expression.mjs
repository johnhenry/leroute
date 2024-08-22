import { test } from "node:test";
import assert from "node:assert";
import { TaggedPathExpression, InlineParameter } from "../path-expression.mjs";

test("TaggedPathExpression - basic functionality", async (t) => {
  const expr = TaggedPathExpression`/users/${InlineParameter({
    name: "id",
    type: "number",
    transform: Number,
  })}/posts`;

  await t.test("test method", () => {
    assert.strictEqual(expr.test("/users/123/posts"), true);
    assert.strictEqual(expr.test("/users/abc/posts"), true); // Note: test doesn't validate type
    assert.strictEqual(expr.test("/users/123"), false);
  });

  await t.test("exec method", () => {
    assert.deepStrictEqual(expr.exec("/users/123/posts"), { id: 123 });
    assert.strictEqual(expr.exec("/users/abc/posts"), null); // Invalid number
  });

  await t.test("toParsed method", () => {
    assert.deepStrictEqual(expr.toParsed(), [
      { type: "static", value: "users" },
      {
        type: "param",
        name: "id",
        paramType: "number",
        optional: false,
        transform: Number,
      },
      { type: "static", value: "posts" },
    ]);
  });
});

test("TaggedPathExpression - optional parameters", async (t) => {
  const expr = TaggedPathExpression`/users/${InlineParameter({
    name: "id",
    optional: true,
  })}/posts`;

  await t.test("test method", () => {
    assert.strictEqual(expr.test("/users/123/posts"), true);
    assert.strictEqual(expr.test("/users/posts"), true);
    assert.strictEqual(expr.test("/users/123/posts/extra"), false);
    assert.strictEqual(expr.test("/users"), false);
  });

  await t.test("exec method", () => {
    assert.deepStrictEqual(expr.exec("/users/123/posts"), { id: "123" });
    assert.strictEqual(expr.exec("/users/posts"), null);
  });
});

test("TaggedPathExpression - custom transform", async (t) => {
  const expr = TaggedPathExpression`/date/${InlineParameter({
    name: "date",
    transform: (dateString) => new Date(dateString),
  })}`;

  await t.test("exec method", () => {
    const result = expr.exec("/date/2023-05-15");
    assert.ok(result.date instanceof Date);
    assert.strictEqual(result.date.toISOString(), "2023-05-15T00:00:00.000Z");
  });
});

test("TaggedPathExpression - multiple parameters", async (t) => {
  const expr = TaggedPathExpression`/users/${InlineParameter({
    name: "id",
    type: "number",
    transform: Number,
  })}/posts/${InlineParameter({ name: "postId", optional: true })}`;

  await t.test("test method", () => {
    assert.strictEqual(expr.test("/users/123/posts/456"), true);
    assert.strictEqual(expr.test("/users/123/posts"), true);
    assert.strictEqual(expr.test("/users/123"), false);
  });

  await t.test("exec method", () => {
    assert.deepStrictEqual(expr.exec("/users/123/posts/456"), {
      id: 123,
      postId: "456",
    });
    assert.deepStrictEqual(expr.exec("/users/123/posts"), { id: 123 });
  });
});

test(async (t) => {
  const expr = TaggedPathExpression`/users/${InlineParameter({
    name: "id",
    type: "number",
    transform: Number,
  })}/posts/${InlineParameter({ name: "postId", optional: true })}`;

  // assert.strictEqual(expr.test("/users/123/posts/456 "), true);
  assert.strictEqual(expr.test("/users/123/posts"), true);
  assert.strictEqual(expr.test("/users/123"), false);
  assert.deepStrictEqual(expr.exec("/users/123/posts/456"), {
    id: 123,
    postId: "456",
  });
  assert.deepStrictEqual(expr.exec("/users/123/posts"), { id: 123 });
});

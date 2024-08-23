# TaggedPathExpression and TaggedHeaderExpression Documentation

## Table of Contents

- [TaggedPathExpression and TaggedHeaderExpression Documentation](#taggedpathexpression-and-taggedheaderexpression-documentation)
  - [Table of Contents](#table-of-contents)
  - [TaggedPathExpression](#taggedpathexpression)
    - [Purpose](#purpose)
    - [Usage](#usage)
    - [Syntax](#syntax)
      - [InlineParameter Options](#inlineparameter-options)
    - [Examples](#examples)
  - [TaggedHeaderExpression](#taggedheaderexpression)
    - [Purpose](#purpose-1)
    - [Usage](#usage-1)
    - [Syntax](#syntax-1)
      - [Header Matcher Syntax](#header-matcher-syntax)
    - [Examples](#examples-1)

## TaggedPathExpression

### Purpose

`TaggedPathExpression` is a function that creates a powerful URL path matching utility. It allows you to define complex path patterns using a template literal syntax, making it easy to create and maintain route matching logic.

### Usage

```javascript
const pathMatcher = TaggedPathExpression`/users/${InlineParameter({
  name: "id",
  type: "number",
  optional: false,
  transform: Number,
})}/posts`;

// Test a path
console.log(pathMatcher.test("/users/123/posts")); // true
console.log(pathMatcher.test("/users/abc/posts")); // false

// Extract parameters
console.log(pathMatcher.exec("/users/123/posts")); // { id: 123 }
```

### Syntax

The `TaggedPathExpression` uses a template literal syntax with the following components:

- Static path segments: Regular URL path segments (e.g., `/users/posts`)
- Dynamic parameters: Specified using the `InlineParameter` function
- Optional parameters: Add `optional: true` to the `InlineParameter` options

#### InlineParameter Options

- `name`: The name of the parameter (required)
- `type`: The expected type of the parameter (default: 'string')
- `optional`: Whether the parameter is optional (default: false)
- `transform`: A function to transform the parameter value (default: identity function)

### Examples

1. Basic route with a required parameter:

```javascript
const userRoute = TaggedPathExpression`/users/${InlineParameter({
  name: "id",
})}`;
console.log(userRoute.test("/users/123")); // true
console.log(userRoute.exec("/users/123")); // { id: '123' }
```

2. Route with an optional parameter:

```javascript
const postsRoute = TaggedPathExpression`/posts/${InlineParameter({
  name: "category",
  optional: true,
})}`;
console.log(postsRoute.test("/posts")); // true
console.log(postsRoute.test("/posts/tech")); // true
console.log(postsRoute.exec("/posts/tech")); // { category: 'tech' }
```

3. Route with a transformed parameter:

```javascript
const dateRoute = TaggedPathExpression`/events/${InlineParameter({
  name: "date",
  transform: (dateString) => new Date(dateString),
})}`;
console.log(dateRoute.test("/events/2023-05-15")); // true
console.log(dateRoute.exec("/events/2023-05-15")); // { date: Date object }
```

## TaggedHeaderExpression

### Purpose

`TaggedHeaderExpression` is a function that creates a powerful HTTP header matching utility. It allows you to define complex header matching patterns using a template literal syntax, making it easy to create and maintain header-based routing or validation logic.

### Usage

```javascript
const headerMatcher = TaggedHeaderExpression`
  [Content-Type=application/json]
  [Accept^=text/]
  [X-Custom-Header]
`;

const headers = new Headers({
  "Content-Type": "application/json",
  Accept: "text/html,application/xhtml+xml",
  "X-Custom-Header": "some-value",
});

console.log(headerMatcher.test(headers)); // true
```

### Syntax

The `TaggedHeaderExpression` uses a template literal syntax with the following components:

- Header matchers: Enclosed in square brackets `[]`
- Negation: Prefix with `!` to negate the condition
- Comparison operators: `=`, `^=`, `$=`, `*=`, `~=`, `>`, `<`, `>=`, `<=`
- Sets: Use curly braces `{}` to specify a set of possible values
- Ranges: Use `[]` for inclusive ranges and `()` for exclusive ranges

#### Header Matcher Syntax

- `[Header-Name]`: Header must exist
- `[!Header-Name]`: Header must not exist
- `[Header-Name=Value]`: Header must exist and match the value exactly
- `[Header-Name^=Value]`: Header must exist and start with the value
- `[Header-Name$=Value]`: Header must exist and end with the value
- `[Header-Name*=Value]`: Header must exist and contain the value
- `[Header-Name~=Regex]`: Header must exist and match the regular expression
- `[Header-Name>Value]`: Header must exist and be greater than the value
- `[Header-Name<Value]`: Header must exist and be less than the value
- `[Header-Name>=Value]`: Header must exist and be greater than or equal to the value
- `[Header-Name<=Value]`: Header must exist and be less than or equal to the value
- `[Header-Name={Value1,Value2,Value3}]`: Header must exist and match one of the values
- `[Header-Name=[Min,Max)]`: Header must exist and be within the specified range (inclusive min, exclusive max)

### Examples

1. Basic header matching:

```javascript
const jsonMatcher = TaggedHeaderExpression`[Content-Type=application/json]`;
const headers = new Headers({ "Content-Type": "application/json" });
console.log(jsonMatcher.test(headers)); // true
```

2. Multiple header conditions:

```javascript
const complexMatcher = TaggedHeaderExpression`
  [Content-Type=application/json]
  [Accept^=text/]
  [X-Custom-Header]
  [!Cache-Control]
`;
const headers = new Headers({
  "Content-Type": "application/json",
  Accept: "text/html,application/xhtml+xml",
  "X-Custom-Header": "some-value",
});
console.log(complexMatcher.test(headers)); // true
```

3. Using sets and ranges:

```javascript
const rangeSetMatcher = TaggedHeaderExpression`
  [Content-Type={application/json,application/xml}]
  [Content-Length=[1000,5000)]
`;
const headers = new Headers({
  "Content-Type": "application/json",
  "Content-Length": "3000",
});
console.log(rangeSetMatcher.test(headers)); // true
```

4. Using the `HeaderMatch` function for programmatic matchers:

```javascript
const programmaticMatcher = TaggedHeaderExpression`
  ${HeaderMatch({ name: "X-Custom", operator: "*=", value: "test" })}
  ${HeaderMatch({ name: "Authorization", negate: true })}
`;
const headers = new Headers({
  "X-Custom": "this is a test header",
});
console.log(programmaticMatcher.test(headers)); // true
```

These utilities provide powerful and flexible ways to match URL paths and HTTP headers, making them valuable tools for routing, validation, and other HTTP-related tasks in your applications.

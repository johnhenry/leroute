Let's create a php like framework for javascript using tagged template literals.
It will consist of a module with two main parts: `createPhrote` and `createPhrouter`.
Let's assume they are exported from a file named `./phrouter.mjs`.

## Types

First let's consider these type -- if they are well formatte and if they make sense.
Give any feedback and add coments where necessary.

file://./types.d.ts

```typescript
type Phoute = (request: Request) => Response | Promise<Response>;
type PhrouterExtension = {
  endpoint: (template: TemplateStringsArray | Phroute) => void;
};
type Phrouter = Phroute & PhrouterExtension;
type PhrouteInit = {
  headers?: HeadersInit | Headers;
  status?: number;
  statusText?: string;
  streaming?:boolean;
  // TBD
};
type PhrouteMiddleware = PhrouteInit | (request: Request) => PhrouteInit;
type CreateRoute= (init?: PhrouteMiddleware
) => (template: TemplateStringsArray) => Phroute;
type PhrouterInit = {
  // TBD
};
type PhrouterMiddleware = PhrouterInit | (request: Request) => PhrouterInit;
type CreateRouter = (init?: PhrouterMiddleware) => Phrouter;
```

### createPhroute

This is the function that we want to create in `./phrouter.mjs`.

file://./phrouter.mjs

```typescript
/** @type {CreateRouter} */
export const createRoute = (/*...*/) => {
  // TBD
};
```

#### Usage

Here is some example usage

##### Deno

```javascript
const router = createPhroute()`<!DOCTYPE html>...`;
Deno.serve(router);
```

##### Service Workers

```javascript
const router = createPhroute()`<!DOCTYPE html>...`;

addEventListener("fetch", (event) => {
  event.respondWith(router(event.request));
});
```

#### Description

The function returned by `createPhroute`
is a tagged template literal function
that itself returns a `Phroute` function.

The string in the tag templated function
is the response body.

```javascript
const responder = createPhroute()`<!DOCTYPE html>
  <html>
    <body>
      Hello, World!
    </body>
  </html>`;
```

### PhrouterInit

A PhrouteInit can be passed to `createPhroute`
to set default values for the response.

Status code defaults to 200 and can be set

Status text defaults to "OK" and can be set.

If unset, headers like `Content-Type` default to `text/html`.

Headers like `Content-Length` are automatically set.

A function that takes a request an returns a PhrouteInit object
can be passed to `createPhroute` to set the Inite dynamically
as requests come in.

```javascript
const responder = createPhroute({
  headers: { "Content-Type": "text/plain" },
  status: 200,
  statusText: "OK",
})`Hello, World!`;
```

### createPhroute: functions substitutions

The tagged template literal function can take functions as substitutions.

```javascript
const responder = createPhroute()`<!DOCTYPE html>
  <html>
    <body>
      The time is ${() => Date.now()}
    </body>
  </html>`;
```

The request object will be passed into the function.

```javascript
const responder = createPhroute()`<!DOCTYPE html>
  <html>
    <body>
      The time is ${async (request) => await request.text()}
    </body>
  </html>`;
```

A second context object will be passed into the function with various methods:

- setHeader(name: string, value: string): void
- setStatus(status: number, statusText: string): void
- setStatusText(statusText: string): void

Note that if nothing is returned from the function, it's result is ignored

```javascript
const responder = createPhroute()`<!DOCTYPE html>
  <html>
    <body>
      Not Found ${async (_, { setStatusText }) => {
        setStatusText("Not Found");
      }}
    </body>
  </html>`;
```

### Streaming

If the PhrouteInit object has a `streaming` property set to `true`,
the response will start streaming as soon as the first text
string or text substitution is ready.

Note that calling `setHeader`, `setStatus`, or `setStatusText` after the first text
string or text substitution will have no effect

```javascript
const responder = createPhroute({
  streaming: true,
})`${(_, { setHeaders }) => {}}<!DOCTYPE html>
  <html>
    <body>
      The time is ${() => Date.now()}
    </body>
  </html>`;
```

### Demo

In addition `./phrouter.mjs`,
let's creat a demo file `./demo.mjs`
using to the `Deno.serve`

file://./demo.mjs

```javascript
import { phroute } from "./phroute.mjs";

Deno.serve(route);
```

### Tests

In addition `./phrouter.mjs` and `./demo.mjs`,
let's create some tests in `./test.mts`
Let's create some tests using `node:test`

file://./test.mjs

```javascript
import { phroute } from "./phroute.mjs";
// TBD
```

### createPhrouter

This is the next function that we want to create in `./phrouter.mjs`.

file://./phrouter.mjs

```javascript
/** @type {CreatePhouter} */
export const createPhouter = (/*...*/) => {
  // TBD
};
```

Consider the updated type

```typescript
// Configuration options for a Phrouter
type PhrouterInit = {
  defaultHandler: Phroute;
  errorHandler: (
    error: Error,
    request: Request
  ) => Response | Promise<Response>;
  cache: CacheOptions;
} & PhrouteInit;
```

#### Usage

Here is some example usage

##### Deno

```javascript
const router = createPhrouter();
router.endpoint`GET / `createPhrote()`<!DOCTYPE html>...`;
router.endpoint`GET / ``<!DOCTYPE html>...`;
Deno.serve(router);
```

#### Description

The function returned by `createPhrouter`
is itself a `Phroute` function.

It also has an `endpoint` method
tha with to direct requests and returns a function.
That function take either:
Secnario A. `Phrote` to handle requests on that specific route OR
Scenario B. OR a TemplateStringsArray use to create a Phrote by by passing in defaults from
the PhrouterInit object.

```javascript
const router = createPhrouter();
router.endpoint`GET / `(request)=>new Response("Hello, World!");
router.endpoint`GET / `createPhrote()`<!DOCTYPE html>
  <html>
    <body>
      Phrouter Router
    </body>
  </html>`;
router.endpoint`GET / ``<!DOCTYPE html>...`;

Deno.serve(router);
```

### URL Parameters

URL parameters can be specified in the template string
and for Secnario B above, they will be passed
into second object used in function substitutions
in a `params` object

```javascript
router.endpoint`GET /:id ``<!DOCTYPE html>
<html>
  <body>
    The id is ${(_, { params }) => params.id}
  </body>
</html>
`;
```

#### Inline Parameter Function

There should also be an InlineParam function that can be used
to specifiy properties of the parameters.

```javascript
import { InlineParam as ip, Phrouter } from "./phrouter.mjs";

const id = ip({
  name: "id",
  optional: true, // defaults to false
  type: "number", // casting type, defaults to "string"
  default: 0, // default defaults to undefined
  cast: (value) => parseInt(value), // custom casting function. optional
  max: 100, // defaults to Infinity
  min: 0, // defaults to 0
  array: false, // defaults to false
  delimiter: "/", // defaults to "/"
});

router.endpoint`GET /${id} ``<!DOCTYPE html>
<html>
  <body>
    The id is ${(_, { params }) => params.id}
  </body>
</html>
`;
```

You must create this as well:

file://./phrouter.mjs

```javascript
export const InlineParam = (/*...*/) => {
  // TBD
};
```

Additionally, create an entry for it's type in `./types.d.ts`

### Header Routing

Routing based on request headers can also be specified with arguments following the path

```javascript
router.endpoint`GET / [Header-Name=Header-value]`createPhrote()`<!DOCTYPE html>
  <html>
    <body>
      Phrouter Router
    </body>
  </html>`;
```

#### Format

Header routing is specified with square brackets "[]".

If the header name is present, the value must exist.

[Header-Name] - Header-Name must exist

e.g. `GET \ [Content-Type]`

If preceeded by an exclamation point, the header must not exist.

[!Header-Name] - Header-Name must not exist

e.g. `GET \ [!Cache-Control]`

If the header name is followed by a "=", the header value must match the given value exactly.

[Header-Name=Header-Value] - Header-Name must exist and match Header-Value

e.g. `GET \ [Content-Type=application/json]`

If preceeded by an exclamation point, if the header exists, it must not match the given value.

[!Content-type=plain/text] - Header-Name must not exist or not match Header-Value

If the "=" is preceeded by a "^", this denotes that the header must simply begin with the value

[Header-Name^=Header-Value] - Header-Name must exist and begin with Header-Value

e.g. `GET \ [Content-Type^=application/]`

Here's the a full list of comparison operators. Please add more if they would be useful.

"=" - Header value must match the given value exactly
"^=" - Header value must begin with the given value
"$=" - Header value must end with the given value
"~=" - Header value match the given value interpreted as a regular expression
"\*=" - Header value must contain the given value
">" - Header value must be greater than the given value
"<" - Header value must be less than the given value
">=" - Header value must be greater than or equal to the given value
"<=" - Header value must be less than or equal to the given value

Use brackets "{}" to specify sets

[Header-Name={value1,value2,value3}] - Header must exist and match one of the values

e.g. `GET \ [Content-Type={application/json,application/xml}]`

Define ranges with parentheses "()" (exclusive) and brackets "[]" (inclusive)

e.g. `GET \ [Content-Length=[200,300)]` - Content-Length must be greater than or equal to 200 and less than 300

These can all be negated

e.g. `GET \ [!Content-Type^=application/]` - If content type does exists, it must not begin with "application/"

e.g. `GET \ [!Content-Length=[200,300)]` - If content length exists, it must be less than 200 or greater than or equal to 300

#### Header Match Function

There should also be an HeaderMatch function that can be used
to match headers.

```javascript
import { HeaderMatch as hm, Phrouter } from "./phrouter.mjs";

const hd = hm({
  //...
});

router.endpoint`GET / ${hd} ``<!DOCTYPE html>
<html>
  <body>
    The id is ${(_, { params }) => params.id}
  </body>
</html>
`;
```

You must create this as well:

file://./phrouter.mjs

```javascript
export const HeaderMatch = (/*...*/) => {
  // TBD
};
```

Additionally, create an entry for it's type in `./types.d.ts`

### PhrouterInit

The parameters in Phrote init are used to pass defaults to route

but there is also a `defaultHandler` that is used when no route is matched
(Defaults to 404 not found)

and an `errorHandler` that is used when an error is thrown
(Defaults to 500 internal server error)

```typescript
/** @type {CreateRouter} */
export const createRouter = (/*...*/) => {
  // TBD
};
```

### Demo

In addition `./phrouter.mjs`,
let's creat a demo file `./demo2.mjs`
using to the `Deno.serve`

file://./demo.mjs

```javascript
import { phroute } from "./phroute.mjs";

Deno.serve(route);
```

### Demo

In addition to the changes made to `./phrouter.mjs`,
let's creat a demo file `./demo2.mjs`
using to the `Deno.serve`

file://./demo2.mjs

```javascript
import { createPhrouter } from "./phrouter.mjs";
//...
Deno.serve(route);
```

### Tests

In addition to the changes made in `./phrouter.mjs` and `./demo2.mjs`,
let's create some tests in `./test2.mts`
Let's create some tests using `node:test`

file://./test2.mjs

```javascript
import { createPhrouter } from "./phroute.mjs";
// TBD
```

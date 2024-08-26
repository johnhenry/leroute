# Loute

[![npm version](https://badge.fury.io/js/loute.svg)](https://badge.fury.io/js/loute)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<img alt="" width="512" height="512" src="./logo.jpeg" style="width:512px;height:512px"/>

Loute is a flexible and powerful routing library for handling HTTP requests and responses in JavaScript.

It uses tagged-template-strings to provides an intuitive API for creating routes, handling requests, and generating requests and responses.

## Features

- Create simple and complex routes with ease
- Support for route parameters and query strings
- Flexible response generation using template literals
- Middleware support for request and response processing
- Built-in support for streaming responses
- TypeScript definitions included

## Installation

```bash
npm install loute
```

## Usage

### Basic Usage

```javascript
import { createLouteRouter, createLouteRoute } from "loute";

// Create a router
const router = createLouteRouter();

// Define a simple route
router.endpoint`GET /`(createLouteRoute()`
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome</title>
  </head>
  <body>
    <h1>Welcome to Loute!</h1>
    <p>The current time is: ${() => new Date().toISOString()}</p>
  </body>
</html>
`);

// Define a route with parameters
router.endpoint`GET /user/:id`(createLouteRoute()`
<!DOCTYPE html>
<html>
  <body>
    <h1>User Profile</h1>
    <p>User ID: ${(_, { params }) => params.id}</p>
  </body>
</html>
`);

// Use the router
import { serve } from "loute";
serve({ port: 8080 }, router);
```

### Advanced Usage

```javascript
import { createLouteRouter, createLouteRoute } from "loute";

const router = createLouteRouter();

// JSON response
router.endpoint`GET /api/data`(async (request) => {
  const data = {
    message: "Hello, World!",
    timestamp: new Date().toISOString(),
  };
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});

// Route with header matching
router.endpoint`GET /protected [Authorization: Bearer *]`(createLouteRoute()`
HTTP/1.1 200 OK
Content-Type: text/plain

This is a protected resource
`);

// Custom error handling
router.endpoint`GET /error`(() => {
  throw new Error("Intentional error");
});

const errorHandler = (error, request) => {
  console.error("Error:", error);
  return new Response("An error occurred", { status: 500 });
};

serve({ port: 8080 }, router, { errorHandler });
```

## API Reference

### `createLouteRouter(options?: LouteRouterInit): LouteRouter`

Creates a new router instance.

### `createLouteRoute(options?: LouteRouteInit): LouteRoute`

Creates a new route handler.

### `serve(options: { port: number }, handler: LouteRoute | LouteRouter, serverOptions?: object): void`

Starts a server with the given handler.

## Types

The library includes TypeScript definitions. Here are some key types:

```typescript
type LouteRoute = (request: Request) => Response | Promise<Response>;

type LouteRouter = LouteRoute & {
  endpoint: (template: TemplateStringsArray | LouteRoute) => void;
};

type LouteRouteInit = {
  headers?: HeadersInit | Headers;
  status?: number;
  statusText?: string;
  streaming?: boolean;
};

type LouteRouterInit = {
  baseUrl: string;
  defaultHandler: LouteRoute;
  errorHandler: (
    error: Error,
    request: Request
  ) => Response | Promise<Response>;
  cache: CacheOptions;
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

# Phrouter

Phrouter is a flexible and powerful routing library for handling HTTP requests and responses in JavaScript. It provides an intuitive API for creating routes, handling requests, and generating responses.

## Features

- Create simple and complex routes with ease
- Support for route parameters and query strings
- Flexible response generation using template literals
- Middleware support for request and response processing
- Built-in support for streaming responses
- TypeScript definitions included

## Installation

```bash
npm install phrouter
```

## Usage

### Basic Usage

```javascript
import { createPhrouter, createPhroute } from 'phrouter';

// Create a router
const router = createPhrouter();

// Define a simple route
router.endpoint`GET /`(createPhroute()`
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome</title>
  </head>
  <body>
    <h1>Welcome to Phrouter!</h1>
    <p>The current time is: ${() => new Date().toISOString()}</p>
  </body>
</html>
`);

// Define a route with parameters
router.endpoint`GET /user/:id`(createPhroute()`
<!DOCTYPE html>
<html>
  <body>
    <h1>User Profile</h1>
    <p>User ID: ${(_, { params }) => params.id}</p>
  </body>
</html>
`);

// Use the router
import { serve } from 'phrouter';
serve({ port: 8080 }, router);
```

### Advanced Usage

```javascript
import { createPhrouter, createPhroute } from 'phrouter';

const router = createPhrouter();

// JSON response
router.endpoint`GET /api/data`(async (request) => {
  const data = { message: "Hello, World!", timestamp: new Date().toISOString() };
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Route with header matching
router.endpoint`GET /protected [Authorization: Bearer *]`(createPhroute()`
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

### `createPhrouter(options?: PhrouterInit): Phrouter`

Creates a new router instance.

### `createPhroute(options?: PhrouteInit): Phroute`

Creates a new route handler.

### `serve(options: { port: number }, handler: Phroute | Phrouter, serverOptions?: object): void`

Starts a server with the given handler.

## Types

The library includes TypeScript definitions. Here are some key types:

```typescript
type Phroute = (request: Request) => Response | Promise<Response>;

type Phrouter = Phroute & {
  endpoint: (template: TemplateStringsArray | Phroute) => void;
};

type PhrouteInit = {
  headers?: HeadersInit | Headers;
  status?: number;
  statusText?: string;
  streaming?: boolean;
};

type PhrouterInit = {
  baseUrl: string;
  defaultHandler: Phroute;
  errorHandler: (error: Error, request: Request) => Response | Promise<Response>;
  cache: CacheOptions;
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

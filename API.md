# Loute API Documentation

## Table of Contents

1. [createLouteRouter](#createLouteRouter)
2. [createLouteRoute](#createLouteRoute)
3. [serve](#serve)
4. [Utility Functions](#utility-functions)

## createLouteRouter

Creates a new router instance.

```typescript
function createLouteRouter(init?: LouteRouterInit): LouteRouter
```

### Parameters

- `init` (optional): Configuration options for the router

  ```typescript
  type LouteRouterInit = {
    baseUrl?: string;
    defaultHandler?: LouteRoute;
    errorHandler?: (error: Error, request: Request) => Response | Promise<Response>;
    cache?: CacheOptions;
  }
  ```

### Returns

Returns a `LouteRouter` instance, which is a function that can be used as a request handler and also has an `endpoint` method for defining routes.

### Example

```javascript
import { createLouteRouter } from 'loute';

const router = createLouteRouter({
  baseUrl: 'https://api.example.com',
  errorHandler: (error, request) => {
    console.error('Error:', error);
    return new Response('An error occurred', { status: 500 });
  }
});

router.endpoint`GET /users/:id`(async (request, { params }) => {
  // Handle the request
});
```

## createLouteRoute

Creates a new route handler.

```typescript
function createLouteRoute(init?: LouteRouteInit): (template: TemplateStringsArray, ...substitutions: any[]) => LouteRoute
```

### Parameters

- `init` (optional): Configuration options for the route

  ```typescript
  type LouteRouteInit = {
    headers?: HeadersInit | Headers;
    status?: number;
    statusText?: string;
    streaming?: boolean;
  }
  ```

### Returns

Returns a function that takes a template literal and returns a `LouteRoute` (a request handler function).

### Example

```javascript
import { createLouteRoute } from 'loute';

const userRoute = createLouteRoute({ streaming: true })`
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": ${(_, { params }) => params.id},
  "name": "John Doe",
  "email": "john@example.com"
}
`;
```

## serve

Starts a server with the given handler.

```typescript
function serve(options: { port: number }, handler: LouteRoute | LouteRouter, serverOptions?: object): void
```

### Parameters

- `options`: An object with a `port` property specifying the port to listen on
- `handler`: A `LouteRoute` or `LouteRouter` to handle incoming requests
- `serverOptions` (optional): Additional options for the server

### Example

```javascript
import { serve, createLouteRouter } from 'loute';

const router = createLouteRouter();
// Define routes...

serve({ port: 8080 }, router);
```

## Utility Functions

Loute provides several utility functions to help with request and response handling:

### tagRequest

Creates a new `Request` object from a template literal.

```javascript
import { tagRequest } from 'loute';

const request = await tagRequest()`
GET /api/users HTTP/1.1
Accept: application/json
`;
```

### createResponse

Creates a new `Response` object from a template literal.

```javascript
import { createResponse } from 'loute';

const response = await createResponse`
HTTP/1.1 200 OK
Content-Type: application/json

{"message": "Hello, World!"}
`;
```

### HTTPExpression

A utility for parsing and manipulating HTTP messages.

```javascript
import { HTTPExpression } from 'loute';

const expr = new HTTPExpression('GET /users/:id HTTP/1.1');
console.log(expr.method); // 'GET'
console.log(expr.path); // '/users/:id'
console.log(expr.version); // 'HTTP/1.1'
```

### deconstruct

A utility function for deconstructing HTTP messages.

```javascript
import { deconstruct } from 'loute';

const { method, url, headers, body } = deconstruct`
POST /api/users HTTP/1.1
Content-Type: application/json

{"name": "John Doe", "email": "john@example.com"}
`;
```

### cook

A utility function for processing HTTP messages.

```javascript
import { cook } from 'loute';

const processedMessage = cook`
GET /api/users/:id HTTP/1.1
Accept: application/json
`({ id: 123 });
```

This API documentation provides an overview of the main functions and utilities provided by the Loute library. For more detailed information on specific use cases and advanced features, please refer to the README.md and the source code.
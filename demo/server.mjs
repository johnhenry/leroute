import serve from "serve-cold";
import { createLeRoute, createLeRouter } from "../index.mjs";

// Server with single html route
const htmlRoute = createLeRoute({ streaming: true })`<!DOCTYPE html>
<html>
  <head>
    <title>LeRoute Demo</title>
  </head>
  <body>
    <h1>Welcome to LeRoute!</h1>
    <p>The current time is: ${() => new Date().toISOString()}</p>
    <p>Your user agent is: ${(request) => request.headers.get("User-Agent")}</p>
  </body>
</html>`;
serve({ port: 8080 }, htmlRoute);
// Server with single non-html route
const customRoute = createLeRoute({ streaming: true })`HTTP/1.1 200 OK
Content-Type: text/markdown

---
access time: ${() => new Date().toISOString()}
user agent: ${(request) => request.headers.get("User-Agent")}
---

# Custom Response
This custom response has it's content type set to 'text/markdown'.
`;
serve({ port: 8081 }, customRoute);

// Server with multiple routes using router
const router = createLeRouter();
router.endpoint`GET /`(htmlRoute);
router.endpoint`GET /about`(customRoute);
router.endpoint`GET /user/:id?``<!DOCTYPE html>
  <html>
    <body>
      <h1>User Profile</h1>
      <p>User ID: ${(_, { params }) => (params.id ? params.id : "???")}</p>
    </body>
  </html>`;
router.endpoint`GET /debug/:id?`(async (request, { params }) => {
  const obj = {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    params,
  };
  return new Response(JSON.stringify(obj, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
serve({ port: 8082 }, router);

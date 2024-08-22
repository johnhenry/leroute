// Phrouter class for handling routes
class Phrouter {
  constructor() {
    this.routes = [];
    // Bind the handle method to ensure correct 'this' context
    this.handle = this.handle.bind(this);
  }

  addRoute(method, path, handler) {
    const keys = [];
    const pattern = path.replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });
    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      keys,
      handler,
    });
  }

  get(path, handler) {
    this.addRoute("GET", path, handler);
  }

  post(path, handler) {
    this.addRoute("POST", path, handler);
  }

  // Add other HTTP methods as needed

  async handle(req) {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;

    for (const route of this.routes) {
      if (route.method === method) {
        const match = path.match(route.pattern);
        if (match) {
          const params = {};
          route.keys.forEach((key, index) => {
            params[key] = match[index + 1];
          });
          return route.handler(req, params);
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}

// Phroute function that returns a template function
const Phroute = (options = {}) => {
  const defaultOptions = {
    contentType: "text/html; charset=UTF-8",
    headers: {},
    statusCode: 200,
  };

  const handlerOptions = { ...defaultOptions, ...options };

  const templateFunction = (strings, ...values) => {
    let responsePromise;
    let requestObject;
    let routeParams;

    const context = {
      get response() {
        if (!responsePromise) {
          throw new Error(
            "Response is not available outside of request context"
          );
        }
        return responsePromise;
      },

      get request() {
        if (!requestObject) {
          throw new Error(
            "Request is not available outside of request context"
          );
        }
        return requestObject;
      },

      get $SERVER() {
        return {
          REQUEST_METHOD: this.request.method,
          HTTP_HOST: this.request.headers.get("host"),
          HTTP_USER_AGENT: this.request.headers.get("user-agent"),
        };
      },

      $GET(key) {
        const url = new URL(this.request.url);
        const params = new URLSearchParams(url.search);
        return key ? params.get(key) : Object.fromEntries(params);
      },

      async $POST(key) {
        if (this.request.method !== "POST") {
          return key ? null : {};
        }
        const formData = await this.request.formData();
        const postData = Object.fromEntries(formData);
        return key ? postData[key] : postData;
      },

      $PARAMS(key) {
        return key ? routeParams[key] : routeParams;
      },

      isset: (variable) => typeof variable !== "undefined" && variable !== null,
      empty: (variable) =>
        !variable ||
        (Array.isArray(variable) && variable.length === 0) ||
        (typeof variable === "object" && Object.keys(variable).length === 0),

      header(name, value) {
        this.response.then((response) => response.headers.set(name, value));
        return "";
      },

      http_response_code(code) {
        this.response.then((response) => {
          response.status = code;
        });
        return "";
      },
    };

    const handler = async (req, params = {}) => {
      requestObject = req;
      routeParams = params;
      const responseInit = {
        status: handlerOptions.statusCode,
        headers: new Headers({
          "Content-Type": handlerOptions.contentType,
          ...handlerOptions.headers,
        }),
      };

      responsePromise = Promise.resolve(new Response("", responseInit));

      const body = await strings.reduce(async (resultPromise, str, i) => {
        const result = await resultPromise;
        let value = values[i];
        if (typeof value === "function") {
          value = await value.call(context);
        }
        return result + str + (value || "");
      }, Promise.resolve(""));

      return responsePromise.then(
        (response) =>
          new Response(body, {
            status: response.status,
            headers: response.headers,
          })
      );
    };

    return handler;
  };

  return templateFunction;
};
// Example usage with routing
const router = new Phrouter();

const homePage = Phroute()`
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Welcome to Phroute!</h1>
      <a href="/user/123">Go to user page</a>
    </body>
  </html>
`;

const userPage = Phroute()`
  <!DOCTYPE html>
  <html>
    <body>
      <h1>User Profile</h1>
      <p>User ID: ${function () {
        return this.$PARAMS("id");
      }}</p>
      <p>Query Param: ${function () {
        return this.$GET("foo") || "Not provided";
      }}</p>
    </body>
  </html>
`;

router.get("/", homePage);
router.get("/user/:id", userPage);

// // Usage
// addEventListener("fetch", (event) => {
//   event.respondWith(router.handle(event.request));
// });

// Usage
Deno.serve(router.handle);

import { createLouteRoute } from "./create-louteroute.mjs";
import { HTTPExpression } from "./utility/http-expression.mjs";
/** @type {CreateRouter} */
export const createLouteRouter = (initial = {}) => {
  const routes = [];
  const {
    defaultHandler = (request) =>
      new Response("404 Not Found", { status: 404 }),
    errorHandler = (error, request) =>
      new Response("500 Internal Server Error", { status: 500 }),
    ...init
  } = initial;

  const router = async (request) => {
    try {
      for (const [matcher, handler] of routes) {
        const match = matcher(request);
        if (match) {
          return handler(request, { ...init, ...match });
        }
      }
      return defaultHandler(request);
    } catch (error) {
      return errorHandler(error, request);
    }
  };

  router.endpoint = (strings, ...substitutions) => {
    const matcher = (request) => {
      const match = HTTPExpression(strings, ...substitutions).exec(request);
      if (!match) {
        return null;
      }
      const { method, headers, ...params } = match;
      return { params, method, headers };
    };

    return (values, ...substitutions) => {
      const handler =
        typeof values === "function"
          ? values
          : (request, init) =>
              createLouteRoute(init)(values, ...substitutions)(request, init);
      routes.push([matcher, handler]);
      return router;
    };
  };
  return router;
};